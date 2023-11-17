import { Injectable, OnDestroy } from '@angular/core';
import ItemList from '../shared/models/itemlist.model';
import { BehaviorSubject, Observable, from, Subscription, empty, EMPTY } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { Storage } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import CorreiosResult from './models/correios-success-result.model';
import { CryptoService } from './crypto.service';
import { PlaceOrderResponse } from './models/place-order-result.model';

@Injectable({
  providedIn: 'root'
})

export class CartService implements OnDestroy {

  private cartLoadItensSub: Subscription;
  private _cartItens = new BehaviorSubject<ItemList[]>([]);
  public publicKey: string;

  constructor(
    private http: HttpClient,
    private crypto: CryptoService
  ) {
    this.cartLoadItensSub = this.loadCart().subscribe(_ => { });
  }

  loadCart() {
    return from(Storage.get({ key: 'cartData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        } else {
          const parsedData = JSON.parse(storedData.value) as ItemList[];
          const cartItens: ItemList[] = [];
          parsedData.forEach((itemList) => {
            cartItens.push(
              new ItemList(
                itemList.productId,
                itemList.productName,
                itemList.brand,
                itemList.unit,
                itemList.price,
                itemList.shippingWeight,
                null,
                itemList.quantity
              )
            );
          });
          return cartItens;
        }
      }),
      tap(cartItems => {
        this._cartItens.next(cartItems);
      }));
  }

  get cartItens(): Observable<ItemList[]> {
    return this._cartItens.asObservable();
  }

  get cartTotal(): Observable<number> {
    return this.cartItens.pipe(
      map(order => {
        if (order) {
          return order.reduce((total, item) => total + (item.price * item.quantity), 0);
        } else {
          return 0;
        }
      }
      ));
  }

  get cartWeightTotal() {
    return this.cartItens.pipe(
      map(order => {
        if (order) {
          return order.reduce((total, item) => total + (item.shippingWeight * item.quantity), 0);
        } else {
          return 0;
        }
      }),
      map(result => result / 1000));
  }

  getCartItem(id: string): Observable<ItemList> {
    return this.cartItens.pipe(
      map(itens => {
        if (itens) {
          return { ...itens.find(i => i.productId === id) };
        } else {
          return null;
        }
      }),
    );
  }

  updateProductQuantity(productId: string, quantity: number): Observable<ItemList[]> {
    return this.cartItens.pipe(
      take(1),
      tap(products => {
        const updatedProductIndex = products.findIndex(pr => pr.productId === productId);
        const updatedProducts = [...products];
        const oldProduct = updatedProducts[updatedProductIndex];
        updatedProducts[updatedProductIndex] = new ItemList(
          oldProduct.productId,
          oldProduct.productName,
          oldProduct.brand,
          oldProduct.unit,
          oldProduct.price,
          oldProduct.shippingWeight,
          oldProduct.skus,
          quantity
        );
        this.storeCart(updatedProducts);
      })
    );
  }

  updateProductPrice(productId: string, price: number): Observable<ItemList[]> {
    return this.cartItens.pipe(
      take(1),
      tap(products => {
        const updatedProductIndex = products.findIndex(pr => pr.productId === productId);
        const updatedProducts = [...products];
        const oldProduct = updatedProducts[updatedProductIndex];
        updatedProducts[updatedProductIndex] = new ItemList(
          oldProduct.productId,
          oldProduct.productName,
          oldProduct.brand,
          oldProduct.unit,
          oldProduct.shippingWeight,
          price,
          oldProduct.skus,
          oldProduct.quantity,
        );
        this.storeCart(updatedProducts);
      })
    );
  }

  removeCartItem(productId: string): Observable<ItemList[]> {
    return this.cartItens.pipe(
      take(1),
      tap(products => {
        const updatedProducts = products.filter(p => p.productId !== productId);
        this.storeCart(updatedProducts);
      })
    );
  }

  addToCart(cartItem: ItemList): Observable<ItemList[]> {
    return this.cartItens.pipe(
      take(1),
      tap(products => {
        let updatedProductIndex: number;
        let updatedProducts = [];

        if (products) {
          updatedProductIndex = products.findIndex(p => p.productId === cartItem.productId);
          updatedProducts = [...products];
        } else {
          updatedProductIndex = -1;
        }

        if (updatedProductIndex !== -1) {
          const oldProduct = updatedProducts[updatedProductIndex];
          updatedProducts[updatedProductIndex] = new ItemList(
            oldProduct.productId,
            oldProduct.productName,
            oldProduct.brand,
            oldProduct.unit,
            oldProduct.price,
            oldProduct.shippingWeight,
            oldProduct.skus,
            oldProduct.quantity + cartItem.quantity
          );
        } else {
          updatedProducts.push(new ItemList(
            cartItem.productId,
            cartItem.productName,
            cartItem.brand,
            cartItem.unit,
            cartItem.price,
            cartItem.shippingWeight,
            cartItem.skus,
            cartItem.quantity
          ));
        }
        this.storeCart(updatedProducts);
      })
    );
  }

  storeCart(itemList: ItemList[]) {
    const data = JSON.stringify(itemList);
    Storage.set({ key: 'cartData', value: data });
    this._cartItens.next(itemList);
  }

  updateFreight(data: { amount: number, weight: number, postalCode: string }): Observable<CorreiosResult> {
    if (data && data.amount && data.weight) {
      return this.http
        .post<CorreiosResult>
        (`${environment.api_base_url}freight`, data);
    } else {
      return EMPTY;
    }
  }

  ngOnDestroy() {
    if (this.cartLoadItensSub) {
      this.cartLoadItensSub.unsubscribe();
    }
  }

  public getInternalCardHash(
    products: ItemList[],
    cpf: string,
    addressId: string,
    card: { cardNumber: string, holderName: string, dueDate: string, securityCode: string }
  ): Promise<string> {
    let res = card.dueDate.split('T');
    res = res[0].split('-');
    const cardData = {
      cardNumber: card.cardNumber.replace(/ /g, ''),
      holderName: card.holderName,
      securityCode: card.securityCode,
      expirationYear: res[0],
      expirationMonth: res[1]
    };
    const cardDataString = JSON.stringify(cardData);
    return this.crypto.encrypt(this.publicKey, cardDataString);

  }

  public getCardHash(encoded: string) {
    const url = `${environment.juno_url}get-credit-card-hash.json`;
    const params = `publicToken=${environment.juno_public_token}&encryptedData=${encodeURIComponent(encoded)}`;
    return this.http.post<{ data: string }>(
      url,
      params,
      { headers: { 'Content-type': 'application/x-www-form-urlencoded' } }
    ).pipe(map(result => {
      if (result.data) {
        return result.data;
      } else {
        throw new Error('Erro recebendo o Encoded!');
      }
    }));
  }

  public loadPublicKey(): Observable<{ data: string }> {
    const url = `${environment.juno_url}get-public-encryption-key.json`;
    const params = `publicToken=${environment.juno_public_token}&version=0.0.2`;
    return this.http.post<{ data: string }>(
      url,
      params,
      { headers: { 'Content-type': 'application/x-www-form-urlencoded' } }
    ).pipe(tap(result => {
      if (result) {
        this.publicKey = result.data;
      }
    }));
  }

  public placeOrder(
    products: ItemList[],
    freightMode: string,
    cpf: string,
    addressId?: string,
    offlineAddress?: {
      email: string,
      name: string
      postalCode: string,
      street: string,
      no: number,
      city: string,
      state: string,
      addInfo?: string,
    },
    cardHash?: string
  ): Observable<PlaceOrderResponse> {
    const orderData = {
      products,
      freightMode,
      cpf,
      addressId,
      offlineAddress,
      cardHash,
      paymentMethod: cardHash ? 'creditCard' : 'boleto'
    };
    return this.http.post<PlaceOrderResponse>(`${environment.api_base_url}orders`, orderData);
  }
}
