import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('Authentication forms', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  async function open(path: string) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(path);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/social/providers').flush(['google', 'github']);
    await fixture.whenStable();
    return { fixture, http, host: fixture.nativeElement as HTMLElement };
  }

  function fill(host: HTMLElement, field: string, value: string) {
    const input = host.querySelector<HTMLInputElement>(
      `[formControlName="${field}"]`,
    )!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function submit(host: HTMLElement) {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  it('signs in through the existing API from a design-system panel and shows credential errors', async () => {
    const { fixture, http, host } = await open(
      '/login?redirect=https%3A%2F%2Fadmin.ngx-workshop.io%2F',
    );
    expect(
      host.querySelector('ngx-panel mat-card-title')?.textContent?.trim(),
    ).toBe('Sign in');
    expect(host.querySelector('ngx-theme-picker')).toBeNull();
    const signUpLink = host.querySelector<HTMLAnchorElement>(
      'a[href^="/sign-up"]',
    )!;
    expect(new URL(signUpLink.href).searchParams.get('redirect')).toBe(
      'https://admin.ngx-workshop.io/',
    );

    fill(host, 'email', 'member@example.test');
    fill(host, 'password', 'SamplePassword1');
    submit(host);
    const request = http.expectOne('/api/sign-in');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'member@example.test',
      password: 'SamplePassword1',
    });
    request.flush(null, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(host.querySelector('ngx-inline-status')?.textContent).toContain(
      'Check your email and password.',
    );
  });

  it('prevents signup with mismatched passwords and submits only email and password', async () => {
    const { fixture, http, host } = await open('/sign-up');
    fill(host, 'email', 'member@example.test');
    fill(host, 'password', 'SamplePassword1');
    fill(host, 'confirmPassword', 'SamplePassword2');
    submit(host);
    http.expectNone('/api/sign-up');
    await fixture.whenStable();
    expect(host.querySelector('ngx-inline-status')?.textContent).toContain(
      'Passwords do not match.',
    );

    fill(host, 'confirmPassword', 'SamplePassword1');
    submit(host);
    const request = http.expectOne('/api/sign-up');
    expect(request.request.body).toEqual({
      email: 'member@example.test',
      password: 'SamplePassword1',
    });
    request.flush(null, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    expect(host.querySelector('ngx-inline-status')?.textContent).toContain(
      'An account already uses this email.',
    );
  });
});
