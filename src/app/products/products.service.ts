import { Injectable } from '@angular/core';
import Product from './models/product.model';
import ItemList from '../shared/models/itemlist.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, map, tap, switchMap, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isEmpty } from 'lodash';
import { AvailabilityResponse } from './models/availability-response.model';

import { QueryResult } from './models/query-result.model';
import { QueryParams } from './models/query-params.model';
import FetchedProduct from './interfaces/product.interface';

@Injectable({
    providedIn: 'root'
})

export class ProductService {
    private _products = new BehaviorSubject<Product[]>([]);

    private _availableProducts = new BehaviorSubject<{
        [key: string]: {
            price: number;
            quantity: number;
        };
    }>({});


    get products(): Observable<Product[]> {
        return this._products.asObservable();
    }

    get availableProducts(): Observable<AvailabilityResponse> {
        return this._availableProducts.asObservable();
    }

    availablesUpToDate = false;

    fetchProducts(skip: number, limit: number, sort: string, query: QueryParams):
        Observable<QueryResult> {
        if (skip === 0) {
            this._products.next([]);
        }
        let observable: Observable<QueryResult>;
        if (query) {
            let params = new HttpParams();
            params = params.append('skip', String(skip));
            params = params.append('limit', String(limit));
            params = params.append('sort', String(sort));
            if (query.pesquisa) {
                params = params.append('search', query.pesquisa);
            }

            if (query['precos[]']) {
                params = params.append('prices[]', String(query['precos[]'][0]));
                params = params.append('prices[]', String(query['precos[]'][1]));
            }

            if (query['categorias[]']) {
                if (typeof query['categorias[]'] === 'string') {
                    params = params.append('categories[]', query['categorias[]']);
                } else {
                    query['categorias[]'].forEach(category => {
                        params = params.append('categories[]', category);
                    });
                }
            }


            if (query['marcas[]']) {
                if (typeof query['marcas[]'] === 'string') {
                    params = params.append('brands[]', query['marcas[]']);
                } else {
                    query['marcas[]'].forEach(brand => {
                        params = params.append('brands[]', brand);
                    });
                }
            }

            if (query['tags[]']) {
                if (typeof query['tags[]'] === 'string') {
                    params = params.append('tags[]', query['tags[]']);
                } else {
                    query['tags[]'].forEach(tag => {
                        params = params.append('tags[]', tag);
                    });
                }
            }
            observable = this.http.get<QueryResult>
                (`${environment.api_base_url}products/`,
                    { params }
                );
        } else {
            observable = this.http.get<QueryResult>
                (`${environment.api_base_url}products/`);
        }
        return observable.pipe(
            withLatestFrom(this.products),
            tap(([result, products]) => {
                const updatedProducts = products;
                result.products.forEach(product => {
                    const itemList = new ItemList(
                        product._id,
                        product.productName,
                        product.brand,
                        product.unit,
                        product.price,
                        product.shippingWeight,
                        product.skus,
                        product.skus.length
                    );
                    const newProduct = new Product(
                        itemList,
                        product.tags,
                        product.category_id,
                        product.netWeight,
                        product.description
                    );
                    updatedProducts.push(newProduct);
                });
                this._products.next(updatedProducts);
            }),
            map(([result, _]) => {
                return { ...result };
            })
        );
    }

    fetchProduct(productId: string): Observable<Product> {
        return this.http.get<FetchedProduct>(`${environment.api_base_url}products/${productId}`).pipe(
            map(product => {
                const itemList = new ItemList(
                    product._id,
                    product.productName,
                    product.brand,
                    product.unit,
                    product.price,
                    product.shippingWeight,
                    product.skus,
                    product.skus.length
                );
                const newProduct = new Product(
                    itemList,
                    product.tags,
                    product.category_id,
                    product.netWeight,
                    product.description
                );
                return newProduct;
            }),
            tap(product => {
                this._products.next([product]);
            })
        );
    }

    getProduct(id: string) {
        return this.products.pipe(map(products => {
            return {
                ...products.find(p => p.productId === id)
            };
        }));
    }

    getItensQuantity(items: ItemList[])
        : Observable<AvailabilityResponse> {
        const productIds: string[] = [];
        items.forEach((item) => {
            productIds.push(item.productId);
        });

        if (!isEmpty(productIds)) {
            return this.availableProducts.pipe(
                // tap(stored => console.log('STORED AVAILABLES IN SERVICE', stored)),
                switchMap(availableProducts => {
                    if (!this.availablesUpToDate) {
                        return this.http.post<AvailabilityResponse>
                            (`${environment.api_base_url}products/availability`, {
                                productIds
                            }).pipe(
                                tap(products => {
                                    this.availablesUpToDate = true;
                                    this._availableProducts.next(products);
                                })
                            );
                    } else {
                        return of(availableProducts);
                    }
                }),
                distinctUntilChanged()
            );
        } else {
            return of({});
        }
    }

    spliceProducts(splice: number) {
        this.products.pipe(take(1)).subscribe(products => {
            const updatedProducts = [...products];
            updatedProducts.splice(-splice, splice);
            this._products.next(updatedProducts);
        });
    }

    clearAvailables() {
        this.availablesUpToDate = false;
    }

    constructor(private http: HttpClient) {

    }
}
