export default class ItemList {
    constructor(
        public readonly productId: string,
        public readonly productName: string,
        public readonly brand: string,
        public readonly unit: [string, string],
        public price: number,
        public readonly shippingWeight: number,
        public skus: string[],
        public quantity: number
    ) {

    }
}
