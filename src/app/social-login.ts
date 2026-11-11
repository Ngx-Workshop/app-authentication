import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { NgxButton, NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import { catchError, of } from 'rxjs';

type Provider = 'google' | 'apple' | 'github';

@Component({
  selector: 'ngx-social-login',
  imports: [AsyncPipe, MatButton, NgxButton, NgxInlineStatus],
  template: `
    @if (error) {
      <ngx-inline-status tone="error" [label]="error" [announce]="true" />
    }
    @if (providers$ | async; as providers) {
      @if (providers.length) {
        <div class="provider-buttons">
          @for (provider of providers; track provider) {
            @switch (provider) {
              @case ('google') {
                <button
                  class="provider-button google"
                  type="button"
                  (click)="signIn(provider)"
                >
                  <picture>
                    <source
                      media="(prefers-color-scheme: dark)"
                      srcset="/providers/google-sign-in-dark.png"
                    />
                    <img
                      src="/providers/google-sign-in-light.png"
                      width="180"
                      height="40"
                      alt="Sign in with Google"
                    />
                  </picture>
                </button>
              }
              @case ('github') {
                <button
                  class="provider-button github"
                  type="button"
                  (click)="signIn(provider)"
                >
                  <picture>
                    <source
                      media="(prefers-color-scheme: dark)"
                      srcset="/providers/github-white.svg"
                    />
                    <img
                      src="/providers/github-black.svg"
                      width="22"
                      height="22"
                      alt=""
                    />
                  </picture>
                  Sign in with GitHub
                </button>
              }
              @case ('apple') {
                <button
                  type="button"
                  mat-stroked-button
                  ngxButton
                  surface="outline"
                  shape="chamfered"
                  motion="none"
                  (click)="signIn(provider)"
                >
                  Continue with Apple
                </button>
              }
            }
          }
        </div>
      }
    }
    @if (providersUnavailable()) {
      <ngx-inline-status
        tone="warning"
        label="Social sign-in is temporarily unavailable."
        [announce]="true"
      />
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--ngx-space-2);
    }
    :host:empty {
      display: none;
    }
    .provider-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ngx-space-2);
    }
    .provider-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 180px;
      max-width: 100%;
      min-height: 40px;
      cursor: pointer;
      border-radius: 4px;
    }
    .provider-button picture,
    .provider-button img {
      display: block;
    }
    .google {
      padding: 0;
      border: 0;
      background: transparent;
    }
    .google img {
      max-width: 100%;
      height: auto;
    }
    .github {
      gap: 8px;
      padding: 0 8px;
      border: 1px solid #747775;
      background: #fff;
      color: #1f2328;
      font:
        600 14px/20px system-ui,
        sans-serif;
    }
    .github img {
      height: auto;
    }
    .github:hover {
      background: #f3f4f6;
    }
    @media (prefers-color-scheme: dark) {
      .github {
        border-color: #8e918f;
        background: #131314;
        color: #fff;
      }
      .github:hover {
        background: #252526;
      }
    }
  `,
})
export class SocialLogin {
  readonly providersUnavailable = signal(false);
  readonly providers$ = inject(HttpClient)
    .get<Provider[]>('/api/auth/social/providers')
    .pipe(
      catchError(() => {
        this.providersUnavailable.set(true);
        return of([]);
      }),
    );
  readonly error =
    new URLSearchParams(window.location.search).get('social_error') ===
    'link_required'
      ? 'This provider could not be connected to the account using this email. Sign in with your existing method.'
      : new URLSearchParams(window.location.search).has('social_error')
        ? 'Provider sign-in could not be completed. Please try again.'
        : '';

  signIn(provider: Provider) {
    const query = new URLSearchParams();
    const redirect = new URLSearchParams(window.location.search).get(
      'redirect',
    );
    if (redirect) query.set('redirect', redirect);
    window.location.assign(`/api/auth/social/${provider}/start?${query}`);
  }
}
