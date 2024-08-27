import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiPostService {

  constructor(private http: HttpClient) { }

  getDebtInfo(url: string, dataFormBody: any,  httpHeaders: any):Observable<any>{

    const paramsBody = new HttpParams({ fromObject: dataFormBody });
        
    if (httpHeaders && Object.keys(httpHeaders).length > 0) {
      return this.http.post<any>(url, paramsBody, { headers: httpHeaders });
      
    } else {
      return this.http.post<any>(url, paramsBody);
    }
  }
}
