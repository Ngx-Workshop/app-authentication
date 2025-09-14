import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./sign-up').then((c) => c.SignUp)
  },
  {
    path: 'login',
    loadComponent: () => import('./login').then((c) => c.Login)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
