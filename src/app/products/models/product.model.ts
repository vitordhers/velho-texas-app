import ItemList from '../../shared/models/itemlist.model';

export default class Product extends ItemList {
    constructor(
        public product: ItemList,
        public readonly tags: string[],
        public readonly category_id: string,
        public readonly netWeight: number,
        public readonly description: string,
    ) {
        super(
            product.productId,
            product.productName,
            product.brand,
            product.unit,
            product.price,
            product.shippingWeight,
            product.skus,
            product.skus.length
        );
    }
}
