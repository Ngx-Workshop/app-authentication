import { AsyncPipe } from '@angular/common';
import { Component, inject } from "@angular/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { startWith, map, mergeMap, tap, of, lastValueFrom } from 'rxjs';
import { Auth } from './auth';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

export function PasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/) ? null : { invalidPassword: true };
  };
}

export function MatchPasswordValidator(controlName: string, toMatchControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controlOne: AbstractControl|null = control.get(controlName);
    const controlTwo: AbstractControl|null = control.get(toMatchControlName);
    const error: boolean = (controlOne && controlTwo && controlOne?.value !== controlTwo?.value) ?? false;
    let validatorFn = null
    // Keep errors if the control has other validators
    if(error) {
      validatorFn = {
        matchPassword: {
          value: {
            controlOne: controlOne?.value,
            controlTwo: controlTwo?.value
          }
        }
      };
    } else if(controlOne?.errors) {
      validatorFn = controlOne?.errors;
    }

    controlOne?.setErrors(validatorFn);
    return  error ? validatorFn : null;
  };
}

type SignUpModel = {
  signUpForm: FormGroup;
  formErrorMessages: { [key: string]: string };
  errorMessages: { [key: string]: string };
};

@Component({
  selector: 'ngx-sign-up',
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
    @if (signUpModel$ | async; as vm) {
    <form [formGroup]="vm.signUpForm">
      <a routerLink="/login">Already have an account? Log in</a>
      <mat-divider></mat-divider>
      <h1>Create Account</h1>
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input formControlName="email" matInput type="email" />
        @if (vm.signUpForm.get('email')?.errors) {
        <mat-error>{{ vm.formErrorMessages['email'] }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field>
        <mat-label>Password</mat-label>
        <input formControlName="password" matInput type="password" />
        @if (vm.signUpForm.get('password')?.errors) {
        <mat-error>{{ vm.formErrorMessages['password'] }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field>
        <mat-label>Confirm Password</mat-label>
        <input formControlName="confirmPassword" matInput type="password" />
        @if (vm.signUpForm.get('confirmPassword')?.errors) {
        <mat-error>{{ vm.formErrorMessages['confirmPassword'] }}</mat-error>
        }
      </mat-form-field>
      <button
        mat-raised-button
        (click)="signUp(vm)"
        [disabled]="vm.signUpForm.invalid"
      >
        Create Account
      </button>
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
    `
  ]
})
export class SignUp {
  formBuilder = inject(FormBuilder);
  auth = inject(Auth);

  signUpModel$ = of({
    signUpForm: this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, PasswordValidator()]],
      confirmPassword: ['', Validators.required],
    }, { validators: MatchPasswordValidator('confirmPassword', 'password') }),
    errorMessages: {
      required: 'Required',
      email: 'Invalid email',
      invalidPassword: 'Password too weak',
      matchPassword: 'Passwords do not match',
    },
    formErrorMessages: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  }).pipe(
    mergeMap((signUpModel: SignUpModel) =>
      this.watchStatusChanges(signUpModel).pipe(
        startWith(null),
        map(() => signUpModel)
      )
    )
  );

  watchStatusChanges(signUpModel: SignUpModel) {
    return signUpModel.signUpForm.events.pipe(
      tap(() => this.setErrorsMessages(signUpModel))
    );
  }

  setErrorsMessages({
    signUpForm,
    formErrorMessages,
    errorMessages,
  }: SignUpModel): void {
    Object.keys(signUpForm.controls).forEach((element) => {
      const errors = signUpForm.get(element)?.errors;
      if (errors) {
        const error = Object.keys(errors)[0];
        formErrorMessages[element] = errorMessages[error];
      } else {
        formErrorMessages[element] = '';
      }
    });
  }

  signUp(signUpModel: SignUpModel): void {
    if (signUpModel.signUpForm.valid) {
      const formValue = signUpModel.signUpForm.getRawValue();
      const userAuthDto = {
        email: formValue.email,
        password: formValue.password
      };
      lastValueFrom(this.auth.signUp(userAuthDto));
    }
  }
}