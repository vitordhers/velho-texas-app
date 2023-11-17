export default class Freight {
    public address: { street: string, no: string, city: string, state: string, postalCode: string, addInfo: string };
    public freightMode: string;
    public shippingWeight: number;
    public shippingDate: Date;
    public mailTrakingCode?: string;
    public deliveryDate?: Date;
}
