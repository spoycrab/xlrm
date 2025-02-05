/* See: https://stackblitz.com/run?file=src%2Fapp%2Fhero.service.ts */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';


import { Product } from './product';

/* https://docs.angular.lat/guide/http */
const URL = "http://localhost:8080/api/product";
const OPTIONS = {
    headers: new HttpHeaders({
	"Content-Type":  "application/json"
    }),
    observe: "response" as const
};

@Injectable({
    providedIn: 'root'
})
export class ProductService {
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

    registerProduct(product: Product): Observable<HttpResponse<Product>>{
        return this.http.post<Product>(URL + "/register", product, OPTIONS).pipe(
                catchError(this.errorHandler)
            );
    }

    getProductByName(name: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${URL}/getProductsByName?name=${name}`).pipe(
          catchError(this.errorHandler)
        );
      }
    
      getProductByCode(code: number): Observable<Product[]> {
        return this.http.get<Product[]>(`${URL}/getProductsByName?code=${code}`).pipe(
          catchError(this.errorHandler)
        );
      }

      getProductByNameAndCode(name: string, code: number): Observable<Product[]> {
        let params = new HttpParams().set('name', name).set('code', code);
        return this.http.get<Product[]>(`${URL}/getProductsByName`, { params }).pipe(
          catchError(this.errorHandler)
        );
      }


      searchProducts(product: Product): Observable<Product[]> {
        const { name, code } = product;
        if (name && code) {
          return this.getProductByNameAndCode(name, code);
        } else if (name) {
          return this.getProductByName(name);
        } else if (code) {
          return this.getProductByCode(code);
        } else {
          return this.getAllProducts();
        }
      }
    
      getAllProducts(): Observable<Product[]> {
        console.log('Fetching all products...');
        return this.http.get<Product[]>(`${URL}/getAllProducts`).pipe(
          tap(data => console.log('All products:', data))
        );
      }
    
      getProductsByQuery(params: { name?: string; code?: string }): Observable<Product[]> {
        let httpParams = new HttpParams();
        if (params.name) {
          httpParams = httpParams.set('name', params.name);
        }
        if (params.code) {
          httpParams = httpParams.set('code', params.code);
        }
    
        console.log('Fetching products with params:', params);
        return this.http.get<Product[]>(`${URL}/getProductsByQuery`, { params: httpParams }).pipe(
          tap(data => console.log('Queried products:', data))
        );
      }
      updateProduct(product: Product) {
        return this.http.post(`${URL}/updateProduct`, product, { responseType: 'text' }).pipe(
          tap(data => console.log('Product updated:', data))
        );
      }

      deleteProduct(product: Product){
        return this.http.post(`${URL}/deleteProduct`, product, { responseType: 'text' }).pipe(
          tap(data => console.log('Product updated:', data)))
      }
  

    }