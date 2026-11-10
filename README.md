# App UI Authentication

This project is the UI component for the App Authentication system. It's a standalone Angular application that allows users to log in, register.
Google, Apple and GitHub login buttons are shared by login/sign-up and shown only
for configured providers. See [server setup and rollout](https://github.com/Ngx-Workshop/service-auth/blob/main/docs/social-login.md).
The same-origin public API prefix is /api/auth/social; provider credentials stay on
the server. Existing password accounts confirm their NGX Workshop password before connecting
Google or GitHub. Requested destinations survive navigation between forms.
