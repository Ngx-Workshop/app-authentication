import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
  router: Router = inject(Router);

  signInFormErrorSubject = new Subject<number>();
  signInFormError$ = this.signInFormErrorSubject.asObservable();

  signUpFormErrorSubject = new Subject<number>();
  signUpFormError$ = this.signUpFormErrorSubject.asObservable();

  signIn(user: IUser) {
    return this.httpClient.post<IUserMetadata>('/api/sign-in', user)
    .pipe(
      tap(() => {
        this.handleRedirectAfterLogin();
      }),
      catchError((error: HttpErrorResponse) => {
        this.signInFormErrorSubject.next(error.status);
        return [];
      })
    )
  }

  signUp(user: IUser) {
    return this.httpClient.post<IUserMetadata>('/api/sign-up', user)
    .pipe(
      tap(() => {
        this.handleRedirectAfterLogin();
      }),
      catchError((error: HttpErrorResponse) => {
        this.signUpFormErrorSubject.next(error.status);
        return [];
      })
    )
  }

  private handleRedirectAfterLogin(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    if (redirectUrl) {
      const decodedRedirectUrl = decodeURIComponent(redirectUrl);
      window.location.href = decodedRedirectUrl;
    } else {
      window.location.href = 'https://beta.ngx-workshop.io/';
    }
  }

}
