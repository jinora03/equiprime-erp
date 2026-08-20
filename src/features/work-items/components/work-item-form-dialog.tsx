import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTechnicians } from "@/features/users/hooks";
import { useCreateWorkItem } from "../hooks";

const schema = z.object({
  task: z.string().min(1, "Task is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]),
  estimatedHours: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface WorkItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The parent job order — work items cannot exist independently. */
  jobOrderId: number;
  jobOrderCode: string;
  technicianIds: number[];
}

export function WorkItemFormDialog({
  open,
  onOpenChange,
  jobOrderId,
  jobOrderCode,
  technicianIds,
}: WorkItemFormDialogProps) {
  const create = useCreateWorkItem();
  const { data: technicians = [] } = useTechnicians();
  const assignedTechnicians = technicians.filter((technician) =>
    technicianIds.includes(technician.id),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      task: "",
      assigneeId: "",
      priority: "Medium",
      estimatedHours: "",
      dueDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await create.mutateAsync({
        task: values.task,
        jobOrderId,
        assigneeId: values.assigneeId ? Number(values.assigneeId) : undefined,
        priority: values.priority,
        estimatedHours: Number(values.estimatedHours) || 0,
        dueDate: values.dueDate || undefined,
        notes: values.notes || undefined,
      });
      toast.success("Work item added");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't add work item.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add work item</DialogTitle>
          <DialogDescription>
            Added to job order {jobOrderCode}. New work items start as Not
            Started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Input placeholder="Inspect Engine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician</FormLabel>
                    <Select
                      value={field.value || "unassigned"}
                      onValueChange={(value) =>
                        field.onChange(value === "unassigned" ? "" : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignedTechnicians.map((technician) => (
                          <SelectItem
                            key={technician.id}
                            value={String(technician.id)}
                          >
                            {technician.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {assignedTechnicians.length > 0
                        ? "Only technicians assigned to this job order are listed."
                        : "Assign technicians to the job order to make them available here."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated hours</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.5" placeholder="4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Optional notes…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={create.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Adding…" : "Add work item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
