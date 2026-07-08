export interface Equipment {
  id: number;
  code: string;
  name: string;
  model: string;
  type: string;
  /** Owning customer — used to auto-fill the customer on a job order. */
  customerId: number;
  customerName: string;
}
