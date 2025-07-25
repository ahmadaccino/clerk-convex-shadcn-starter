import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/layout/main-layout";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { PlusIcon } from "lucide-react";

type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

function HomePageContent({ user }: { user: UserResource }) {
  return (
    <MainLayout pageTitle="Home">
      <div className="p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">Welcome, {user.firstName}</div>
            <Button>
              <PlusIcon />
              Connect Bank Account
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function HomePage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <LoadingSpinner />;
  if (!user) return <RedirectToSignIn />;
  return <HomePageContent user={user} />;
}
