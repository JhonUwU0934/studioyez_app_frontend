import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiGetService {

  constructor(
    private http: HttpClient
  ) {}

  getDebtInfo(url: string, httpHeaders: any) {
    return this.http.get<any>(url,{ headers: httpHeaders });
  }
  
}
