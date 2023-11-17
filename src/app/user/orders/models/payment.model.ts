export default class Payment {
    transactionId: string;
    installments: number;
    payments: [
        {
            id: string,
            chargeId: string,
            date: string,
            releaseDate: string,
            amount: number,
            fee: number,
            type: string,
            status: string,
            failReason: null
        }
    ];
}
