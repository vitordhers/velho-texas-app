import Product from '../models/product.model';
import ItemList from '../../shared/models/itemlist.model';

export const dummyItemList = new ItemList('', '', '', ['', ''], 0, 0, [''], 0);
export const dummyProduct = new Product(dummyItemList, [''], '', 0, '');
