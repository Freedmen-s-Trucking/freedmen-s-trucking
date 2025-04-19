export type orderCardT  = {
    orderId: string;
    recipient: string;
    location: string;
    timestamp: string;
    status: 'Completed' | 'Pending' | 'In Progress';
  }