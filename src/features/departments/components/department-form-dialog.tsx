import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";
import { useCreateDepartment, useUpdateDepartment } from "../hooks";

const COLORS = [
  "#1E40AF", "#7C3AED", "#0891B2", "#0D9488", "#CA8A04",
  "#EA580C", "#DC2626", "#475569", "#4F46E5", "#DB2777",
];

const schema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(1, "Code is required").max(6, "Keep the code short"),
  description: z.string().optional(),
  head: z.string().optional(),
  color: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) {
  const isEdit = Boolean(department);
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      head: "",
      color: COLORS[0],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: department?.name ?? "",
        code: department?.code ?? "",
        description: department?.description ?? "",
        head: department?.head ?? "",
        color: department?.color ?? COLORS[0],
      });
    }
  }, [open, department, form]);

  const selectedColor = form.watch("color");

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && department) {
        await updateDept.mutateAsync({ id: department.id, input: values });
        toast.success("Department updated");
      } else {
        await createDept.mutateAsync(values);
        toast.success("Department created");
      }
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const submitting = createDept.isPending || updateDept.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit department" : "New department"}
          </DialogTitle>
          <DialogDescription>
            Organize your team into operational units.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="SRV" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="head"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department head</FormLabel>
                  <FormControl>
                    <Input placeholder="Carlos Aquino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What this department is responsible for…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent color</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => field.onChange(color)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full ring-offset-background transition-transform hover:scale-110",
                          selectedColor === color &&
                            "ring-2 ring-ring ring-offset-2",
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color}`}
                      >
                        {selectedColor === color ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
