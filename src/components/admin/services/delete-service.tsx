"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteService } from "@/app/admin/(panel)/services/actions";
import { Button } from "@/components/ui/button";

export function DeleteServiceButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Удалить услугу? Это нельзя отменить.")) return;
        startTransition(async () => {
          const res = await deleteService(id);
          if (res && !res.ok && res.message) toast.error(res.message);
        });
      }}
    >
      <Trash2 /> Удалить
    </Button>
  );
}
