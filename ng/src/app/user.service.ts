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

    login(user: User): Observable<any> {
        return this.http.post<User>(URL + "/login", user, { 
            observe: 'response',
            withCredentials: true  // Habilitar o envio de cookies
        }).pipe(
            catchError(this.errorHandler)
        );
    }

    getUsuariosSemPermissao(): Observable<User[]> {
        return this.http.get<User[]>(URL + "/selectUnregisteredUsers").pipe(
            catchError(this.errorHandler)
        );
    }
	getAllUsersAllowed(): Observable<User[]> {
        return this.http.get<User[]>(URL + "/selectAllAllowed").pipe(
            catchError(this.errorHandler)
		);
		};

        getAllUsersAllowedWihoutPermissions(): Observable<User[]> {
            return this.http.get<User[]>(URL + "/selectAllAllowedWithoutPermission").pipe(
                catchError(this.errorHandler)
            );
            };

            setUserPermission(data: { id: number, permissions: number }) {
                return this.http.post(URL + "/setUserPermission", data, {
                  withCredentials: true
                }).pipe(
                  catchError(this.errorHandler)
                );
              }

              logout(): Observable<void> {
                return this.http.post<void>(URL + "/logout", {}, {
                    withCredentials: true
                }).pipe(
                    catchError(this.errorHandler)
                );
            }

    getAllRejected(): Observable<User[]> {
        return this.http.get<User[]>(URL + "/getAllRejected").pipe(
            catchError(this.errorHandler)
        );
        };
        }
