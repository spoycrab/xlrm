import { Injectable } from '@angular/core';
import { Customer } from './customer';
import { HttpHeaders, HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

const URL = "http://localhost:8080/api/customer";
const OPTIONS = {
    headers: new HttpHeaders({
    "Content-Type":  "application/json"
    }),
    observe: "response" as const
};
@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }

  private errorHandler(e: HttpErrorResponse) {
    let msg: string;

    if (e.status == 0) {
        msg = "Something went wrong.";
    } else {
        msg = e.error.err;
    }
    return throwError(() => new Error(msg));
    }
    
  registerCustomer(customer: Customer): Observable<HttpResponse<Customer>>{
    return this.http.post<Customer>(URL + "/register", customer, OPTIONS).pipe(
            catchError(this.errorHandler)
        );
}
}

