export interface IProofPaymentMessaging {
    customerId: string;
    reservationId: string;
    totalValue: number;
    dailyValue: number;
    days: number;
    checkIn: Date;
    checkOut: Date;
}