import { HttpInterceptor, HttpHandler, HttpEvent, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, switchMap, filter, take, tap, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(public authService: AuthService) { }

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.accessToken.pipe(
            withLatestFrom(this.authService.userIsAuthenticated),
            switchMap(
                ([accessToken, authenticated]) => {
                    if (!authenticated) {
                        return next.handle(request);
                    }

                    if (accessToken) {
                        request = this.addAccessToken(request, accessToken);
                    }

                    return next.handle(request).pipe(
                        catchError(error => {
                            if (error instanceof HttpErrorResponse && error.status === 401) {
                                return this.handle401Error(request, next);
                            } else {
                                return throwError(error);
                            }
                        }));
                }
            )
        );
    }

    private addAccessToken(request: HttpRequest<any>, accessToken: string) {
        if (request.url.includes(environment.api_base_url)) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        } else {
            return request.clone();
        }
    }

    private addRefreshToken(request: HttpRequest<any>, refreshToken: string) {
        return request.clone({
            setHeaders: {
                'x-refresh-token': refreshToken
            }
        });
    }


    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            this.authService.doRefreshToken().subscribe(token => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next(token.credentials.accessToken);
                return next.handle(this.addAccessToken(request, token.credentials.accessToken));
            });
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(refreshToken => {
                    return next.handle(this.addRefreshToken(request, refreshToken));
                }));
        }
    }
}
