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
import { useCreateRecord } from "@/hooks/use-workflow-records";
import { getErrorMessage } from "@/services/api/errors";
import { useCustomers } from "@/features/customers/hooks";
import { useEquipmentByCustomer } from "@/features/equipment/hooks";
import { useMechanics } from "@/features/users/hooks";
import { useWorkflows } from "@/features/workflows/hooks";
import { jobOrderService } from "../service";
import { useServiceVehicles } from "../use-service-vehicles";
import { MechanicMultiSelect } from "./mechanic-multi-select";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  customerId: z.string().min(1, "Select a customer"),
  equipmentId: z.string().min(1, "Select equipment"),
  serviceVehicleId: z.string().optional(),
  assigneeIds: z.array(z.number()).min(1, "Assign at least one mechanic"),
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
  const create = useCreateRecord("job-orders", jobOrderService.create);
  const { data: customers = [] } = useCustomers();
  const { data: mechanics = [] } = useMechanics();
  const { data: serviceVehicles = [] } = useServiceVehicles();
  const { data: workflows = [] } = useWorkflows();
  const jobWorkflows = workflows.filter(
    (w) => w.moduleId === "job-orders" && w.status === "active",
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      customerId: "",
      equipmentId: "",
      serviceVehicleId: "",
      assigneeIds: [],
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

  const selectedCustomerId = Number(form.watch("customerId")) || undefined;
  const { data: equipment = [] } = useEquipmentByCustomer(selectedCustomerId);

  const onCustomerChange = (value: string) => {
    form.setValue("customerId", value, { shouldValidate: true });
    // Equipment is customer-owned, so changing the customer invalidates any
    // previous equipment selection.
    form.setValue("equipmentId", "", { shouldValidate: false });
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
        equipmentId: eq.id,
        serviceVehicleId: values.serviceVehicleId
          ? Number(values.serviceVehicleId)
          : null,
        assigneeIds: values.assigneeIds,
        priority: values.priority,
        workflowId: Number(values.workflowId),
        dueDate: values.dueDate,
        notes: values.notes,
      });
      toast.success("Job order created", {
        description: "It now follows its assigned workflow.",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Couldn't create job order.", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5 pr-12">
          <DialogTitle>New job order</DialogTitle>
          <DialogDescription>
            Job number is auto-generated. Related records are selected from
            existing data.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
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
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select value={field.value} onValueChange={onCustomerChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Equipment choices are filtered to this customer.
                  </FormDescription>
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedCustomerId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedCustomerId
                              ? "Select equipment"
                              : "Select a customer first"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipment.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name} · {item.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomerId && equipment.length === 0 ? (
                    <FormDescription>
                      This customer has no equipment in the active branch.
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceVehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service vehicle</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No service vehicle</SelectItem>
                      {serviceVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.code} · {vehicle.name} · {vehicle.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Equiprime field vehicle used by the assigned mechanics.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assigneeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned mechanics</FormLabel>
                    <MechanicMultiSelect
                      mechanics={mechanics}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormDescription>
                      Active employees from the Mechanic department in this branch.
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

            </div>

            <DialogFooter className="shrink-0 border-t bg-muted/20 px-6 py-4">
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
