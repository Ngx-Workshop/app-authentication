# App UI Authentication

This project is the UI component for the App Authentication system. It's a standalone Angular application that allows users to log in, register.
Google, Apple and GitHub login buttons are shared by login/sign-up and shown only
for configured providers. See [server setup and rollout](https://github.com/Ngx-Workshop/service-auth/blob/main/docs/social-login.md).
The same-origin public API prefix is /api/auth/social; provider credentials stay on
the server. Existing password accounts confirm their NGX Workshop password before connecting
Google or GitHub. Requested destinations survive navigation between forms.

The auth pages follow the operating system’s light and dark preference. The build
serves the shared design-system stylesheet at `/auth-theme.css` for both Angular
and the account confirmation served by service-auth. Publish the frontend assets
before releasing the server template that references the stylesheet.

Run `npm start` for local development. The dev server reads the enabled provider
list from the hosted auth service and sends provider sign-in to that origin so its
registered callback and cookies work.

Provider artwork comes from the [Google sign-in assets](https://developers.google.com/identity/branding-guidelines)
and the [GitHub Brand Toolkit](https://brand.github.com/foundations/logo).
