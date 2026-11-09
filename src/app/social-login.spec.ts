import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SocialLogin } from './social-login';

describe('Social login', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SocialLogin],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('shows configured providers with buttons that do not submit the password form', async () => {
    const fixture = TestBed.createComponent(SocialLogin);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/auth/social/providers').flush(['google', 'apple', 'github']);
    await fixture.whenStable();
    fixture.detectChanges();
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Continue with Google', 'Continue with Apple', 'Continue with GitHub']);
    expect(buttons.every((button) => button.type === 'button')).toBeTrue();
  });
  it('keeps password sign-in available if provider discovery fails', async () => {
    const fixture = TestBed.createComponent(SocialLogin);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/auth/social/providers').flush('', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(0);
  });
});
