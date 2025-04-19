export type orderCardT = {
  orderId: string;
  recipient: string;
  location: string;
  status: "Completed" | "Pending";
  timestamp?: string;
  expectedTime?: string;
};