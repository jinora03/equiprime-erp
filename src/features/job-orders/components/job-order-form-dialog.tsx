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
import { useAuth } from "@/contexts/auth-context";
import { useCreateRecord } from "@/hooks/use-workflow-records";
import { useCustomers } from "@/features/customers/hooks";
import { useEquipment } from "@/features/equipment/hooks";
import { useUsers } from "@/features/users/hooks";
import { useWorkflows } from "@/features/workflows/hooks";
import { jobOrderService } from "../service";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  equipmentId: z.string().min(1, "Select equipment"),
  customerId: z.string().min(1, "Select a customer"),
  assignee: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]),
  workflowId: z.string().min(1, "Select a workflow"),
  dueDate: z.string().min(1, "Estimated date is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function JobOrderFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const create = useCreateRecord("job-orders", jobOrderService.create);
  const { data: customers = [] } = useCustomers();
  const { data: equipment = [] } = useEquipment();
  const { data: userPage } = useUsers({ status: "active", page_size: 100 });
  const { data: workflows = [] } = useWorkflows();

  const assignees = userPage?.items ?? [];
  const jobWorkflows = workflows.filter((w) => w.moduleId === "job-orders");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      equipmentId: "",
      customerId: "",
      assignee: "",
      priority: "Medium",
      workflowId: "",
      dueDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  // Preselect the (single) job-order workflow once loaded.
  useEffect(() => {
    if (open && jobWorkflows.length && !form.getValues("workflowId")) {
      form.setValue("workflowId", String(jobWorkflows[0].id));
    }
  }, [open, jobWorkflows, form]);

  // Selecting equipment auto-fills the owning customer.
  const onEquipmentChange = (value: string) => {
    form.setValue("equipmentId", value, { shouldValidate: true });
    const eq = equipment.find((e) => String(e.id) === value);
    if (eq) form.setValue("customerId", String(eq.customerId), { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    const customer = customers.find((c) => String(c.id) === values.customerId);
    const eq = equipment.find((e) => String(e.id) === values.equipmentId);
    if (!customer || !eq) return;
    try {
      await create.mutateAsync({
        title: values.title,
        description: values.description,
        customerId: customer.id,
        customerName: customer.name,
        equipmentId: eq.id,
        equipmentName: eq.name,
        assignee: values.assignee,
        priority: values.priority,
        workflowId: Number(values.workflowId),
        dueDate: values.dueDate,
        notes: values.notes,
        actor: user?.full_name ?? "System",
      });
      toast.success("Job order created", {
        description: "It now follows its assigned workflow.",
      });
      onOpenChange(false);
    } catch {
      toast.error("Couldn't create job order.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New job order</DialogTitle>
          <DialogDescription>
            Job number is auto-generated. Related records are selected from
            existing data.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Job number</FormLabel>
              <Input value="Auto-generated" disabled />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Repair Excavator – SE215W" {...field} />
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
                    <Textarea rows={2} placeholder="Scope of work…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <Select value={field.value} onValueChange={onEquipmentChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipment.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.name} · {e.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Auto-filled from the selected equipment; change if needed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned to</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignees.map((u) => (
                          <SelectItem key={u.id} value={u.full_name}>
                            {u.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workflowId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a workflow" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobWorkflows.map((w) => (
                          <SelectItem key={w.id} value={String(w.id)}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated date</FormLabel>
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
                {create.isPending ? "Creating…" : "Create job order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
