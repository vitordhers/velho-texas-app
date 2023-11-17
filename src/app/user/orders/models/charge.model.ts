export default class Charge {
    id: string;
    code: number;
    reference: string;
    dueDate: string;
    link: string;
    checkoutUrl: string;
    installmentLink: string;
    payNumber: string;
    amount: number;
    billetDetails: {
        bankAccount: string,
        ourNumber: string,
        barcodeNumber: string,
        portfolio: string
    };
    _links: {
        self: {
            href: string
        }
    };
}
