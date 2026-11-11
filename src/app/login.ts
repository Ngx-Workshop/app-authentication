import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import {
  NgxButton,
  NgxInlineStatus,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { finalize } from 'rxjs';
import { Auth } from './auth';
import { SocialLogin } from './social-login';

@Component({
  selector: 'ngx-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    MatButton,
    RouterLink,
    NgxButton,
    NgxInlineStatus,
    NgxPanel,
    SocialLogin,
  ],
  template: `
    <ngx-panel
      role="region"
      aria-label="Sign in"
      heading="Sign in"
      eyebrow="NGX Workshop"
      background="solid"
      motion="none"
    >
      <form class="auth-form" [formGroup]="form" (ngSubmit)="signIn()">
        <ngx-social-login />
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Email</mat-label>
          <input
            matInput
            formControlName="email"
            type="email"
            autocomplete="username"
          />
          <mat-error>{{
            form.controls.email.hasError('required')
              ? 'Enter your email.'
              : 'Enter a valid email.'
          }}</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Password</mat-label>
          <input
            matInput
            formControlName="password"
            type="password"
            autocomplete="current-password"
          />
          <mat-error>Enter your password.</mat-error>
        </mat-form-field>
        @if (error() && !pending()) {
          <ngx-inline-status
            tone="error"
            [announce]="true"
            [label]="
              error() === 401
                ? 'Check your email and password.'
                : 'Could not sign in. Please try again.'
            "
          />
        }
        <button
          mat-flat-button
          ngxButton
          shape="chamfered"
          motion="none"
          type="submit"
          [disabled]="pending()"
        >
          {{ pending() ? 'Signing in…' : 'Sign in' }}
        </button>
        <p class="auth-form__switch">
          New to NGX Workshop?
          <a routerLink="/sign-up" queryParamsHandling="preserve"
            >Create an account</a
          >
        </p>
      </form>
    </ngx-panel>
  `,
})
export class Login {
  private readonly auth = inject(Auth);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly error = toSignal(this.auth.signInFormError$, {
    initialValue: 0,
  });
  protected readonly pending = signal(false);

  protected signIn() {
    if (this.pending()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    this.auth
      .signIn(this.form.getRawValue())
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe();
  }
}
