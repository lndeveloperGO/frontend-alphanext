import { useState } from "react";
import { promoService, ValidatePromoCodeInput } from "@/lib/promoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag, X } from "lucide-react";

interface PromoCodeInputProps {
  amount: number;
  onPromoApplied?: (discount: number, finalAmount: number, code: string) => void;
  onPromoRemoved?: () => void;
}

export function PromoCodeInput({ amount, onPromoApplied, onPromoRemoved }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(amount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const input: ValidatePromoCodeInput = {
        code: code.trim().toUpperCase(),
        amount,
      };

      const response = await promoService.validatePromoCode(input);

      const { discount: appliedDiscount, final_amount } = response.data;

      setAppliedCode(input.code);
      setDiscount(appliedDiscount);
      setFinalAmount(final_amount);

      onPromoApplied?.(appliedDiscount, final_amount, input.code);

      toast({
        title: "Promo code applied!",
        description: `You saved Rp ${appliedDiscount.toLocaleString()}`,
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Invalid promo code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCode(null);
    setDiscount(0);
    setFinalAmount(amount);
    setCode("");
    setError(null);
    onPromoRemoved?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !appliedCode) {
      handleApply();
    }
  };

  if (appliedCode) {
    return (
      <div className="space-y-2">
        <Label>Promo Code</Label>
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 border-green-200">
          <Tag className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm font-semibold text-green-700">
                {appliedCode}
              </code>
              <span className="text-sm text-green-600">
                -Rp {discount.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-green-600">
              Final amount: Rp {finalAmount.toLocaleString()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="promo-code">Promo Code</Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Enter promo code"
          className={error ? "border-red-500" : ""}
        />
        <Button onClick={handleApply} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Apply
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
