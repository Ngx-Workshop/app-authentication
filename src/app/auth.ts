import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, Subject, tap } from 'rxjs';

export interface IUser {
  email: string;
  password: string;
}

export interface IUserMetadata {
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  httpClient: HttpClient = inject(HttpClient);

  signInFormErrorSubject = new Subject<number>();
  signInFormError$ = this.signInFormErrorSubject.asObservable();

  userMetadata = new Subject<IUserMetadata>();
  userMetadata$ = this.userMetadata.asObservable();

  signIn(user: IUser) {
    return this.httpClient.post<IUserMetadata>('/api/sign-in', user)
    .pipe(
      tap((userMetadata) => this.userMetadata.next(userMetadata)),
      catchError((error: HttpErrorResponse) => {
        this.signInFormErrorSubject.next(error.status);
        return [];
      })
    )
  }

  isLoggedIn(): Observable<boolean> {
    return this.httpClient.get<boolean>(
      '/api/authentication/is-user-logged-in'
    );
  }
}
