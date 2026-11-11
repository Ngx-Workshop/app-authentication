import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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

const passwordPattern = /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/;
const matchPasswords: ValidatorFn = (form) =>
  form.get('password')?.value === form.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };

@Component({
  selector: 'ngx-sign-up',
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
      aria-label="Create an account"
      heading="Create an account"
      eyebrow="NGX Workshop"
      background="solid"
      motion="none"
    >
      <form class="auth-form" [formGroup]="form" (ngSubmit)="signUp()">
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
            autocomplete="new-password"
          />
          <mat-error>{{
            form.controls.password.hasError('required')
              ? 'Enter a password.'
              : 'Password does not meet the requirements.'
          }}</mat-error>
        </mat-form-field>
        <p class="auth-form__hint">
          Use 6–100 letters, numbers or !&#64;#$%^&amp;*, including at least one
          number.
        </p>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Confirm password</mat-label>
          <input
            matInput
            formControlName="confirmPassword"
            type="password"
            autocomplete="new-password"
          />
          <mat-error>Enter your password again.</mat-error>
        </mat-form-field>
        @if (
          form.hasError('passwordMismatch') &&
          form.controls.confirmPassword.touched &&
          form.controls.confirmPassword.valid
        ) {
          <ngx-inline-status
            tone="error"
            [announce]="true"
            label="Passwords do not match."
          />
        }
        @if (error() && !pending()) {
          <ngx-inline-status
            tone="error"
            [announce]="true"
            [label]="
              error() === 409
                ? 'An account already uses this email.'
                : 'Could not create your account. Please try again.'
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
          {{ pending() ? 'Creating account…' : 'Create account' }}
        </button>
        <p class="auth-form__switch">
          Already have an account?
          <a routerLink="/login" queryParamsHandling="preserve">Sign in</a>
        </p>
      </form>
    </ngx-panel>
  `,
})
export class SignUp {
  private readonly auth = inject(Auth);
  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(passwordPattern)],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchPasswords },
  );
  protected readonly error = toSignal(this.auth.signUpFormError$, {
    initialValue: 0,
  });
  protected readonly pending = signal(false);

  protected signUp() {
    if (this.pending()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.pending.set(true);
    this.auth
      .signUp({ email, password })
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe();
  }
}
