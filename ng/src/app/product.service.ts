/* See: https://stackblitz.com/run?file=src%2Fapp%2Fhero.service.ts */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';


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

    // register(user: User): Observable<HttpResponse<User>> {
	// return this.http.post<User>(URL + "/register", user, OPTIONS).pipe(
	//     catchError(this.errorHandler)
	// );
    // }

	// login(user: User): Observable<any> {
	// 	return this.http.post<User>(URL + "/login", user, { observe: 'response' }).pipe(
	// 		catchError(this.errorHandler)
	// 	);
	// }

    // getUsuariosSemPermissao(): Observable<User[]> {
    //     return this.http.get<User[]>(URL + "/selectUnregisteredUsers").pipe(
    //         catchError(this.errorHandler)
    //     );
    // }
	// getAllUsersAllowed(): Observable<User[]> {
    //     return this.http.get<User[]>(URL + "/selectAllAllowed").pipe(
    //         catchError(this.errorHandler)
	// 	);
	// 	};

        // getAllUsersAllowedWihoutPermissions(): Observable<User[]> {
        //     return this.http.get<User[]>(URL + "/selectAllAllowedWithoutPermission").pipe(
        //         catchError(this.errorHandler)
        //     );
        //     };

    // setUserPermission(data: { id: number, permissions: number }) {
    //     return this.http.post(URL + "/setUserPermission", data).pipe(
    //         catchError(this.errorHandler)
    //     );
    // }

    registerProduct(product: Product): Observable<HttpResponse<Product>>{
        return this.http.post<Product>(URL + "/register", product, OPTIONS).pipe(
                catchError(this.errorHandler)
            );
    }


    

}
