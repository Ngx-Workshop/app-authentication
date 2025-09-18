import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { startWith, map, mergeMap, tap, of, lastValueFrom } from 'rxjs';
import { Auth } from './auth';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

type LoginModel = {
  loginForm: FormGroup;
  formErrorMessages: { [key: string]: string };
  errorMessages: { [key: string]: string };
};

@Component({
  selector: 'ngx-login',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    MatButton,
    RouterLink,
    MatDivider
  ],
  template: `
    @if (loginModel$ | async; as vm) {
    <form [formGroup]="vm.loginForm">
      <a routerLink="/sign-up">Don't have an account? Sign up</a>
      <mat-divider></mat-divider>
      <h1>Sign In</h1>
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input formControlName="email" matInput type="email"/>
        @if (vm.loginForm.get('email')?.errors) {
        <mat-error>{{ vm.formErrorMessages['email'] }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field>
        <mat-label>Password</mat-label>
        <input formControlName="password" matInput type="password"/>
        @if (vm.loginForm.get('password')?.errors) {
        <mat-error>{{ vm.formErrorMessages['password'] }}</mat-error>
        }
      </mat-form-field>
      <button mat-button (click)="login(vm)">Sign In</button>

    </form>
    }
  `,
  styles: [
    `
      :host {
        width: 100%;
        form {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
        h1 {
          margin: 0 0 1em 0;
          font-weight: 200;
        }
        a {
          align-self: flex-end;
          text-decoration: none;
        }
      }
    `,
  ],
})
export class Login {
  formBuilder = inject(FormBuilder);
  auth = inject(Auth);

  loginModel$ = of({
    loginForm: this.formBuilder.nonNullable.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    }),
    errorMessages: {
      required: 'Required',
    },
    formErrorMessages: {
      email: '',
      password: '',
    },
  }).pipe(
    mergeMap((loginModel: LoginModel) =>
      this.watchStatusChanges(loginModel).pipe(
        startWith(null),
        map(() => loginModel)
      )
    )
  );

  watchStatusChanges(loginModel: LoginModel) {
    return loginModel.loginForm.events.pipe(
      tap(() => this.setErrorsMessages(loginModel))
    );
  }

  setErrorsMessages({
    loginForm,
    formErrorMessages,
    errorMessages,
  }: LoginModel): void {
    Object.keys(loginForm.controls).forEach((element) => {
      const errors = loginForm.get(element)?.errors;
      if (errors) {
        const error = Object.keys(errors)[0];
        formErrorMessages[element] = errorMessages[error];
      }
    });
  }

  login(loginModel: LoginModel): void {
    lastValueFrom(this.auth.signIn(loginModel.loginForm.getRawValue()));
  }
}
