import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuickProducts } from 'src/app/products/models/quick-search-products.model';
import { tap, withLatestFrom, map } from 'rxjs/operators';
import { Notificate } from './models/notificate.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private _products = new BehaviorSubject<QuickProducts[]>([]);
  private _notifications = new BehaviorSubject<Notificate[]>([]);

  get products() {
    return this._products.asObservable();
  }

  get notifications() {
    return this._notifications.asObservable();
  }

  constructor(private http: HttpClient) { }

  quickSearch(search: string): Observable<{ products: QuickProducts[], total: { total: number }[] }> {
    return this.http.get<{ products: QuickProducts[], total: { total: number }[] }>
      (`${environment.api_base_url}products/quick/${search}`).pipe(
        tap(result => this._products.next(result.products))
      );
  }

  emptyProducts() {
    this._products.next([]);
  }

  fetchNotifications(start: number) {
    return this.http.get<Notificate[]>
      (`${environment.api_base_url}users/notifications/${start}`).pipe(
        withLatestFrom(this.notifications),
        tap(([result, notifications]) => {
          const updatedNotifications = notifications;
          result.forEach(notification => {
            const newNotification = new Notificate(
              notification.notId,
              notification.read,
              notification.date,
              notification.text,
              notification.url
            );
            updatedNotifications.push(newNotification);
          });
          this._notifications.next(updatedNotifications);
        }),
        map(([result, notifications]) => result.length)
      );
  }
}
