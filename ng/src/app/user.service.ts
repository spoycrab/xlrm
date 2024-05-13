/* See: https://stackblitz.com/run?file=src%2Fapp%2Fhero.service.ts */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { User } from './user';

/* https://docs.angular.lat/guide/http */
const URL = "http://localhost:8080/api/user";
const OPTIONS = {
    headers: new HttpHeaders({
	"Content-Type":  "application/json"
    }),
    observe: "response" as const
};

@Injectable({
    providedIn: 'root'
})
export class UserService {
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

    register(user: User): Observable<HttpResponse<User>> {
	return this.http.post<User>(URL + "/register", user, OPTIONS).pipe(
	    catchError(this.errorHandler)
	);
    }
}
