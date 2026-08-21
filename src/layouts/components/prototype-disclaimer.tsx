import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrototypeDisclaimerProps {
  open: boolean;
  onAcknowledge: () => void;
}

export function PrototypeDisclaimer({
  open,
  onAcknowledge,
}: PrototypeDisclaimerProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onAcknowledge();
      }}
    >
      <DialogContent className="max-w-[31rem] gap-4 p-5 sm:p-6">
        <DialogHeader className="space-y-1 pr-7 text-left">
          <DialogTitle className="text-base font-semibold text-brand-700">
            Prototype Demonstration
          </DialogTitle>
          <DialogDescription className="text-sm leading-5">
            Please read before interpreting anything shown in this application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm leading-5 text-muted-foreground">
          <p>
            This website is a non-commercial demonstration prototype created for
            portfolio, educational, and presentation purposes only.
          </p>
          <p>
            All displayed information, users, customers, equipment, transactions,
            and records are fictional or generated dummy data.
          </p>
          <p>
            Any logos, icons, illustrations, photographs, or other visual assets
            not original to this project remain the property of their respective
            rights holders and are used only for demonstration purposes.
          </p>
          <p>
            This prototype does not use real customer or business data. Changes
            made in the application exist only within the demo environment unless
            otherwise stated.
          </p>
          <p>
            This project is intended solely to demonstrate ERP system design,
            workflows, user experience, and software architecture.
          </p>
        </div>

        <DialogFooter className="pt-1">
          <Button size="sm" onClick={onAcknowledge}>
            I understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
