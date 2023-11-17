import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import HomeDataInterFace from './interfaces/home-data.interface';

@Injectable({
    providedIn: 'root'
})

export class HomeService {
    constructor(private http: HttpClient) {

    }

    fetchHomeData(): Observable<HomeDataInterFace> {
        return this.http.get<HomeDataInterFace>
            (`${environment.api_base_url}products/home`);
    }
}
