import { MainLayout } from "@/layout/main-layout";
import { PricingTable } from "@clerk/clerk-react";

function SubscriptionPage() {
  return (
    <MainLayout
      pageTitle="Subscription"
      pageDescription="Manage your subscription"
    >
      <div className="p-4 space-y-4">
        <PricingTable />
      </div>
    </MainLayout>
  );
}

export default SubscriptionPage;
