import { MainLayout } from "@/layout/main-layout";
import { UserProfile } from "@clerk/clerk-react";

function ProfilePage() {
  return (
    <MainLayout pageTitle="Profile" pageDescription="Manage your profile">
      <div className="p-4 space-y-4">
        <UserProfile />
        {/* uncomment this if/when you set up clerk billing */}
        {/* <SubscriptionContent /> */}
      </div>
    </MainLayout>
  );
}

export default ProfilePage;
