import React from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text: string;
    url: string;
    className?: string;
}

export const ShareButton = ({ title, text, url, className }: ShareButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                toast.success("Berhasil dibagikan!");
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Error sharing:", error);
                }
            }
        } else {
            // Fallback: Copy to clipboard if Web Share API is not available
            copyToClipboard();
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            setCopied(true);
            toast.success("Link berhasil disalin ke clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
            toast.error("Gagal menyalin link.");
        }
    };

    const shareToSocial = (platform: string) => {
        let shareUrl = "";
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(`${text}`);

        switch (platform) {
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
                break;
            case "telegram":
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Bagikan...</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
                        {copied ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                            <LinkIcon className="mr-2 h-4 w-4" />
                        )}
                        <span>Salin Link</span>
                    </DropdownMenuItem>
                    <div className="h-px bg-muted my-1" />
                    <DropdownMenuItem onClick={() => shareToSocial("whatsapp")} className="cursor-pointer">
                        <span>WhatsApp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareToSocial("telegram")} className="cursor-pointer">
                        <span>Telegram</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareToSocial("facebook")} className="cursor-pointer">
                        <span>Facebook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareToSocial("twitter")} className="cursor-pointer">
                        <span>Twitter (X)</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
