import { Category } from './category.model';
import FetchedProduct from '../interfaces/product.interface';

export class QueryResult {
    products: FetchedProduct[];
    prices: { _id: null, max: number, min: number }[];
    brands: { _id: string, total: number }[];
    tags: { total: number, category: string, tag: string, index: number }[];
    categories: { _id: string, total: number }[];
    template?: Category[];
}
