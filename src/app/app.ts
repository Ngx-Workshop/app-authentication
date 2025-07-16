import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { Login } from './login';

@Component({
  selector: 'ngx-root',
  imports: [Login, MatCard],
  template: `
    <mat-card>
      <h1>Sign In</h1>
      <ngx-login></ngx-login>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        mat-card {
          padding: 24px;
          width: 425px;
          h1 {
            font-weight: 200;
          }
        }
      }
    `,
  ],
})
export class App {}
