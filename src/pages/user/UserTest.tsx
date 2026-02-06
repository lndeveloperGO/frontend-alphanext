import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PromoCodeInput } from "@/components/PromoCodeInput";

export default function UserTest() {
  return (
    <DashboardLayout type="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Test Page</h1>
          <p className="text-muted-foreground">
            Customize this page as needed
          </p>
        </div>

        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
}
