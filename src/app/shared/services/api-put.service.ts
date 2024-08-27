import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiPutService {

  constructor(private http: HttpClient) { }

  updateDebtInfo(url: string, dataFormBody: any, httpHeaders: any): Observable<any> { 

    const paramsBody = new HttpParams({ fromObject: dataFormBody });

    if (httpHeaders && Object.keys(httpHeaders).length > 0) {
      return this.http.put<any>(url, paramsBody, { headers: httpHeaders }); 

    } else {
      return this.http.put<any>(url, paramsBody); 
    }
  }
}
