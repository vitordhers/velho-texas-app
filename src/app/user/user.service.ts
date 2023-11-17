import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserStart } from './start/models/user-start.model';

@Injectable({
    providedIn: 'root'
})

export class UserService {
    constructor(private http: HttpClient) {

    }

    fetchUserData() {
        return this.http.get<UserStart>(`${environment.api_base_url}users/`);
    }

    unsubscribeAll() {
        return this.http.get(`${environment.api_base_url}users/unsubscribe`);
    }

    resendConfirmationEmail() {
        return this.http.get<{ email: string }>(`${environment.api_base_url}auth/resend`);
    }
}
