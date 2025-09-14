import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngx-root',
  imports: [RouterOutlet, MatCard],
  template: `
    <mat-card>
      <router-outlet></router-outlet>
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
        }
      }
    `,
  ],
})
export class App {}
