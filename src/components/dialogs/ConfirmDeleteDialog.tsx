"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "Hapus data?",
  description = "Tindakan ini tidak dapat dibatalkan.",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Hapus
        </Button>
      </div>
    </Dialog>
  );
}
