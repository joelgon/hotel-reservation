export interface IProofPaymentMessaging {
    customerId: string;
    totalValue: number;
    dailyValue: number;
    days: number;
    checkIn: Date;
    checkOut: Date;
}