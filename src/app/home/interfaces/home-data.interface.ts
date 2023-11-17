import FetchedProduct from '../../products/interfaces/product.interface';

export default interface HomeDataInterFace {
    brands: { _id: string, total: number }[];
    categories: { _id: string, categoryName: string }[];
    products: {
        mostSold: FetchedProduct[],
        onSale: FetchedProduct[],
        new: FetchedProduct[]
    };
}
