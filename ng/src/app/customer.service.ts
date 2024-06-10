import { Injectable } from '@angular/core';
import { Customer } from './customer';
import { HttpHeaders, HttpClient, HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

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

  getCustomerByName(firstName: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${URL}/getCustomersByName?name=${firstName}`).pipe(
      catchError(this.errorHandler)
    );
  }

  getCustomerByDocument(document: string): Observable<Customer> {
    return this.http.get<Customer>(`${URL}/getCustumerByDocument?document=${document}`).pipe(
      catchError(this.errorHandler)
    );
  }

  // getCustomerByNameAndDocument(firstName: string, document: string): Observable<Customer[]> {
  //   let params = new HttpParams().set('firstName', firstName).set('document', document);
  //   return this.http.get<Customer[]>(`${URL}/getCustomersByName`, { params }).pipe(
  //     catchError(this.errorHandler)
  //   );
  // }

  getAllCustomers(): Observable<Customer[]> {
    //console.log('Fetching all products...');
    return this.http.get<Customer[]>(`${URL}/getAllCustomers`).pipe(
      tap(data => console.log('All customers:', data))
    );
  }

  

  getCustomersByQuery(params: { firstName?: string; document?: string }): Observable<Customer[]> {
    let httpParams = new HttpParams();
    if (params.firstName) {
      httpParams = httpParams.set('name', params.firstName);
    }
    if (params.document) {
      httpParams = httpParams.set('code', params.document);
    }

    console.log('Fetching customers with params:', params);
        return this.http.get<Customer[]>(`${URL}/getProductsByQuery`, { params: httpParams }).pipe(
          tap(data => console.log('Queried customers:', data))
        );
  }

  updateCustomer(customer: Customer) {
    return this.http.post(`${URL}/updateCustomer`, customer, { responseType: 'text' }).pipe(
      tap(data => console.log('Customers updated:', data))
    );
  }

  deleteCustomer(customer: Customer){
    return this.http.post(`${URL}/deleteCustomer`, customer, { responseType: 'text' }).pipe(
      tap(data => console.log('Customers updated:', data)))
  }
}
