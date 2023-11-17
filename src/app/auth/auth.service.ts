import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { User } from './models/user.model';
import { map, tap, take, switchMap } from 'rxjs/operators';
import { AuthResponseData } from './models/auth-response-data.model';
import { Credentials } from './models/credentials.model';
import { UserStatus } from '../shared/enums/user-status.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeRefreshTokenTimer: any;
  private notificationsSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.autoLogin().subscribe();
  }

  get userIsAuthenticated(): Observable<boolean> {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get accessToken() {
    return from(Storage.get({ key: 'authData' })).pipe(
      take(1),
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }

        const parsedData = JSON.parse(storedData.value) as {
          userId: string,
          accessToken: string,
          refreshToken: string,
          tokenExpiry: number
        };

        const expirationTime = new Date(parsedData.tokenExpiry);

        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(parsedData.userId, parsedData.accessToken, parsedData.refreshToken, parsedData.tokenExpiry);
        return user.token;
      })
    );
  }

  get refreshToken() {
    return from(Storage.get({ key: 'authData' })).pipe(
      take(1),
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }

        const parsedData = JSON.parse(storedData.value) as {
          userId: string,
          accessToken: string,
          refreshToken: string,
          tokenExpiry: number
        };

        const user = new User(parsedData.userId, parsedData.accessToken, parsedData.refreshToken, parsedData.tokenExpiry);
        return user.refreshToken;
      })
    );
  }

  get notifications() {
    return this.notificationsSubject.asObservable();
  }

  signUp(values: {
    name: string,
    email: string,
    passwords: { password: string, cpassword: string },
    celphoneNumber?: string,
    whatsapp?: boolean,
    birthday: string,
    promo?: boolean,
    communication: { mailcomm?: string, wppcomm?: string },
    terms: boolean
  }) {
    return this.http.post<AuthResponseData>(`${environment.api_base_url}auth`, values).pipe(
      tap(response => {
        this.setUserData(response.credentials);
        this.notificationsSubject.next(response.notifications.new);
      })
    );
  }

  signIn(values: {
    email: string,
    password: string,
    recaptcha: string
  }) {
    return this.http.post<AuthResponseData>(`${environment.api_base_url}auth/signin`, values).pipe(
      tap(response => {
        this.setUserData(response.credentials);
        this.notificationsSubject.next(response.notifications.new);
      })
    );
  }

  setUserData(userData: Credentials): void {
    const user = new User(
      userData.localId,
      userData.accessToken,
      userData.refreshToken,
      userData.expiresIn
    );
    this._user.next(user);
    this.storeAuthData(userData);
    this.autoRefreshToken(user.tokenDuration);
  }

  private storeAuthData(userData: Credentials): void {
    const data = JSON.stringify({
      userId: userData.localId,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      tokenExpiry: userData.expiresIn
    });
    Storage.set({ key: 'authData', value: data });
  }

  autoLogin(): Observable<boolean> {
    return from(Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          userId: string,
          accessToken: string,
          refreshToken: string,
          tokenExpiry: number
        };

        const user = new User(parsedData.userId, parsedData.accessToken, parsedData.refreshToken, parsedData.tokenExpiry);
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoRefreshToken(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      }));
  }

  autoRefreshToken(duration: number): void {
    if (this.activeRefreshTokenTimer) {
      clearTimeout(this.activeRefreshTokenTimer);
    }
    this.activeRefreshTokenTimer = setTimeout(() => {
      this.doRefreshToken().subscribe(_ => _, err => {
        if (err) {
          console.log('ERRO DO LOGOUTE', err);
          this.logout();
        }
      });
    }, duration);
  }

  doRefreshToken() {
    return this.refreshToken.pipe(
      switchMap(refreshToken => {
        return this.http.get<AuthResponseData>(`${environment.api_base_url}auth/token`, {
          headers: {
            'x-refresh-token': refreshToken
          }
        }).pipe(
          tap(response => {
            this.setUserData(response.credentials);
            this.notificationsSubject.next(response.notifications.new);
          })
        );
      })
    );
  }

  logout(): void {
    if (this.activeRefreshTokenTimer) {
      clearTimeout(this.activeRefreshTokenTimer);
    }
    this._user.next(null);
    Storage.remove({ key: 'authData' });
  }

  checkEmail(email: string): Observable<true> {
    return this.http.get<true>
      (`${environment.api_base_url}users/checkemail/${email}`);
  }

  confirmEmail(token: string, recaptcha: string, passwords?: { password: string, cpassword: string }) {
    const data = passwords ? { recaptcha, ...passwords } : { recaptcha };
    return this.http.post<{
      confirmation: boolean;
      email: string;
      status: UserStatus;
      password: boolean;
    }>
      (`${environment.api_base_url}auth/confirm?token=${token}`,
        { ...data },
        { observe: 'response' }
      ).pipe(
        map(response => {
          return response.body;
        })
      );
  }

  forgotPassword(email: string, recaptcha: string) {
    return this.http.post<{ email: string }>(`${environment.api_base_url}auth/forgotpassword`,
      { email, recaptcha },
      { observe: 'response' }
    ).pipe(
      map(response => {
        return response.body;
      })
    );
  }

  validateEmailToken(token: string) {
    return this.http.get<{ valid: boolean }>
      (`${environment.api_base_url}auth/validate?token=${token}`, { observe: 'response' }).pipe(
        map(response => response.body)
      );
  }

  redefinePassword(token: string, passwords: { password: string, cpassword: string }, recaptcha: string) {
    return this.http.post<{ success: boolean }>
      (`${environment.api_base_url}auth/redefine?token=${token}`,
        { ...passwords, recaptcha },
        { observe: 'response' }).pipe(
          map(response => response.body)
        );
  }

  resendConfirmationOffilne(email: string, recaptcha: string) {
    return this.http.post<{ email: string }>
      (`${environment.api_base_url}auth/resendoffline`,
        { email, recaptcha },
        { observe: 'response' }).pipe(
          map(response => response.body)
        );
  }

  ngOnDestroy() {
    if (this.activeRefreshTokenTimer) {
      clearTimeout(this.activeRefreshTokenTimer);
    }
  }
}
