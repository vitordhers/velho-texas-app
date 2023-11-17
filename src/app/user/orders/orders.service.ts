import { Injectable } from '@angular/core';
import { Order } from './models/order.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, map, take, switchMap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Observable, forkJoin, of, zip, combineLatest } from 'rxjs';
import { OrderStatus } from './enums/order-status.enum';
import { UserStatus } from '../../shared/enums/user-status.enum';


@Injectable({
    providedIn: 'root'
})

export class OrderService {
    private _orders = new BehaviorSubject<Order[]>([]);

    get orders(): Observable<Order[]> {
        return this._orders.asObservable();
    }

    constructor(private http: HttpClient) { }

    fetchOrders(skip: number): any {
        return this.http.get<Order[]>(`${environment.api_base_url}orders/${skip}`).pipe(
            withLatestFrom(this.orders),
            tap(([resultOrders, outdatedOrders]) => {
                resultOrders.forEach((order) => {
                    order.date = new Date(order.date);
                });
                const updatedOrders = outdatedOrders.concat(resultOrders);
                this._orders.next(updatedOrders);
            }),
            map(([resultOrders, _]) => {
                return resultOrders;
            })
        );
    }

    getOrder(orderNo: number): Observable<Order> {
        return this.orders.pipe(
            take(1),
            map(orders => {
                return {
                    ...orders.find(order => order.orderNo === orderNo)
                };
            }));
    }

    fetchOrder(orderNo: number): Observable<Order> {
        return this.http.get<Order>(`${environment.api_base_url}orders/order/${orderNo}`).pipe(
            map(order => {
                return new Order(
                    order.orderId,
                    order.orderNo,
                    order.status,
                    order.products,
                    order.description,
                    new Date(order.date),
                    order.freight,
                    order.skus,
                    order.charges,
                    order.payment,
                    order.cpf ? order.cpf : null,
                    order.nfe ? order.nfe : null,
                    order.cancel ? {
                        canceledDate: new Date(order.cancel.canceledDate)
                    } : null
                );
            })
        );
    }

    fetchOfflineUserOrder(orderId: string, token?: string) {
        const headers: { Authorization?: string } = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return this.http.get<{ name: string, status: UserStatus, orders: Order[] }>
            (`${environment.api_base_url}orders/offlineorder/${orderId}`, {
                headers
            });
    }

    cancelOrder(orderId: string, token?: string) {
        const headers: { Authorization?: string } = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return this.http.patch<{ chargeId: string; cancelDate: Date; notice: string; }>
            (`${environment.api_base_url}orders/cancel/${orderId}`,
                {},
                { headers, observe: 'response' })
            .pipe(
                switchMap(result => {
                    if (result.status === 202) {
                        return combineLatest([this.orders.pipe(take(1)), of(result.body)]);
                    }
                }),
                tap(orders => {
                    if (!token) {
                        const canceledOrderIndex = orders[0].findIndex(order => order.orderId === orderId);
                        const updatedOrders = [...orders[0]];
                        const oldOrder = updatedOrders[canceledOrderIndex];
                        updatedOrders[canceledOrderIndex] = new Order(
                            oldOrder.orderId,
                            oldOrder.orderNo,
                            OrderStatus.CANCELED,
                            oldOrder.products,
                            oldOrder.description,
                            oldOrder.date,
                            oldOrder.freight,
                            oldOrder.skus,
                            oldOrder.charges,
                            null,
                            oldOrder.cpf,
                            null,
                            { canceledDate: new Date(orders[1].cancelDate) }
                        );
                        this._orders.next(updatedOrders);
                    }
                })
            );
    }

    savePasswordFromOrder(token: string, orderId: string, password: string, cpassword: string, promo: string) {
        const headers: { Authorization: string } = { Authorization: `Bearer ${token}` };
        return this.http.post<{ email: string }>(`${environment.api_base_url}auth/passwordfromorder`,
            { passwords: { password, cpassword }, orderId, promo },
            { headers });
    }
}
