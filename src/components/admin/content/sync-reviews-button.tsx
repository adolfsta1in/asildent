"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { syncReviewsFromTwoGis } from "@/app/admin/(panel)/content/actions";
import { Button } from "@/components/ui/button";

export function SyncReviewsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await syncReviewsFromTwoGis();
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />} Обновить из 2GIS
    </Button>
  );
}
