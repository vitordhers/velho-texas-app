export default interface FetchedProduct {
    _id: string;
    metadata: string;
    category_id: string;
    dateCreated: Date;
    productName: string;
    unit: [string, string];
    shippingWeight: number;
    price: number;
    skus: string[];
    brand: string;
    tags: string[];
    netWeight: number;
    description: string;
    onSale: boolean;
}
