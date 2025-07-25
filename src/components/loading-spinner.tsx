import { Loader2Icon } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2Icon className="h-10 w-10 animate-spin" />
    </div>
  );
}
