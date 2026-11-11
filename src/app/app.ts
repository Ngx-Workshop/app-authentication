import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngx-root',
  imports: [RouterOutlet],
  template: `
    <main class="auth-shell">
      <div class="auth-shell__card">
        <router-outlet />
      </div>
    </main>
  `,
})
export class App {}
