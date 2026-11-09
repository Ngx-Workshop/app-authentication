import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { catchError, of } from 'rxjs';

type Provider = 'google' | 'apple' | 'github';

@Component({
  selector: 'ngx-social-login',
  imports: [AsyncPipe, MatButton],
  template: `
    @if (error) { <p role="alert">{{ error }}</p> }
    @if (providers$ | async; as providers) {
      @for (provider of providers; track provider) {
        <button type="button" mat-stroked-button (click)="signIn(provider)">
          Continue with {{ names[provider] }}
        </button>
      }
    }
  `,
  styles: `:host { display: flex; flex-direction: column; gap: .5rem; }`,
})
export class SocialLogin {
  readonly names = { google: 'Google', apple: 'Apple', github: 'GitHub' };
  readonly providers$ = inject(HttpClient).get<Provider[]>('/api/auth/social/providers')
    .pipe(catchError(() => of([])));
  readonly error = new URLSearchParams(window.location.search).get('social_error') === 'link_required'
    ? 'An account already uses this email. Sign in with your existing method. Linking providers is not available yet.'
    : new URLSearchParams(window.location.search).has('social_error')
      ? 'Provider sign-in could not be completed. Please try again.' : '';

  signIn(provider: Provider) {
    const query = new URLSearchParams();
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect) query.set('redirect', redirect);
    window.location.assign(`/api/auth/social/${provider}/start?${query}`);
  }
}
