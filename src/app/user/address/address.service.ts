import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { Address } from './models/address.model';
import { take, map, tap, delay, switchMap, debounceTime, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SuccessfulCep } from './models/successfulcep.model';
import { UnsuccessfulCep } from './models/unsuccessfulcep.model';
import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class AddressService {

  private _addresses = new BehaviorSubject<Address[]>([]);

  locationOutput: Observable<SuccessfulCep | UnsuccessfulCep | HttpErrorResponse>;
  postalCodeEmitter = new Subject<string>();
  postalCodeObservable = this.postalCodeEmitter.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.locationOutput = this.postalCodeObservable.pipe(
      distinctUntilChanged(),
      debounceTime(1000),
      map(cep => cep.replace('-', '')),
      switchMap((cep) => {
        return this.http.get<SuccessfulCep | UnsuccessfulCep | HttpErrorResponse>(`https://viacep.com.br/ws/${cep}/json/`);
      })
    );
  }

  get addresses(): Observable<Address[]> {
    return this._addresses.asObservable();
  }

  fetchAddresses(): Observable<Address[]> {
    return this.authService.userIsAuthenticated.pipe(
      switchMap(isAuth => {
        if (isAuth) {
          return this.http.get<Address[]>(`${environment.api_base_url}users/addresses`);
        } else {
          return of([]);
        }
      }),
      tap(addresses => {
        this._addresses.next(addresses);
      })
    );

  }

  getAddress(id: string) {
    return this.addresses.pipe(take(1), map(addresses => {
      return {
        ...addresses.find(a => a.addressId === id)
      };
    }));
  }

  addAddress(newAddress: Address): Observable<Address[]> {
    let generatedId: string;
    let defaultAddress: boolean;
    const address = new Address(
      null,
      newAddress.postalCode,
      newAddress.street,
      newAddress.no,
      newAddress.city,
      newAddress.state,
      null,
      newAddress.addInfo
    );

    return this.http.post<{ addressId: string, defaultAddress: boolean }>(`${environment.api_base_url}users/address`, address)
      .pipe(
        switchMap(resData => {
          generatedId = resData.addressId;
          defaultAddress = resData.defaultAddress;
          return this.addresses;
        }),
        take(1),
        tap(addresses => {
          address.addressId = generatedId;
          address.defaultAddress = defaultAddress;
          this._addresses.next(addresses.concat(address));
        })
      );
  }

  updateAddress(id: string, editedAddress: Address) {
    let updatedAddresses: Address[];
    return this.addresses.pipe(
      take(1),
      switchMap(
        addresses => {
          const updatedAddressIndex = addresses.findIndex(ad => ad.addressId === id);
          updatedAddresses = [...addresses];
          const oldAddress = updatedAddresses[updatedAddressIndex];
          updatedAddresses[updatedAddressIndex] = new Address(
            oldAddress.addressId,
            editedAddress.postalCode,
            editedAddress.street,
            editedAddress.no,
            editedAddress.city,
            editedAddress.state,
            null,
            editedAddress.addInfo,
          );
          return this.http.put<boolean>(`${environment.api_base_url}users/address`,
            { ...updatedAddresses[updatedAddressIndex] }
          );
        }
      ),
      tap(resData => {
        if (resData) {
          this._addresses.next(updatedAddresses);
        }
      })
    );
  }

  updateDefaultAddress(addressId: string) {
    return this.http.put<boolean>(`${environment.api_base_url}users/defaultaddress/`, {
      addressId
    }).pipe(
      withLatestFrom(this.addresses),
      tap(([result, addresses]) => {
        if (result) {
          console.log(result);
          const updatedAddressIndex = addresses.findIndex(ad => ad.addressId === addressId);
          const updateAddresses = [...addresses];
          updateAddresses.map(ad => ad.defaultAddress = false);
          updateAddresses[updatedAddressIndex].defaultAddress = true;
          this._addresses.next(updateAddresses);
        }
      }),
      map(([result, addresses]) => result));
  }

  removeAddress(addressId: string) {
    return this.http.delete<boolean>(`${environment.api_base_url}users/address/${addressId}`)
      .pipe(
        switchMap(resData => {
          if (resData) {
            return this.addresses;
          }
        }),
        take(1),
        tap(addresses => {
          this._addresses.next(addresses.filter(address => address.addressId !== addressId));
        })
      );
  }
}
