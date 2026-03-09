# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.x.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

As an open-source project handling authentication and RBAC, security is our top priority.

If you discover any security-related issues (e.g., authentication bypass, data leak, CSRF execution), please **DO NOT** create a public GitHub issue.

Instead, please report it privately by sending an email to: **[Masukkan Email Anda di Sini]** atau menggunakan fitur **GitHub Security Advisories** di tab "Security" repositori ini.

All security vulnerabilities will be promptly addressed. We will:
1. Acknowledge your report within 48 hours.
2. Provide an estimated timeline for a patch.
3. Credit you in our vulnerability disclosure (if you desire).

## Secure Configuration

If you are a user deploying this template, please ensure that:
1. `BETTER_AUTH_SECRET` is set to a strong, random 32+ character string.
2. `NODE_ENV` is strictly set to `production` when deployed to enforce secure/encrypted cookies.
3. You never commit your `.env` file to version control.
