# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT create a public GitHub issue** for security vulnerabilities
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Response Time**: We aim to respond within 48 hours
- **Updates**: We'll keep you informed of our progress
- **Credit**: We'll credit you in our security advisories (unless you prefer anonymity)

### Scope

The following are in scope:
- The main application and API
- Authentication and authorization systems
- Data handling and storage
- Third-party integrations

### Out of Scope

- Social engineering attacks
- Denial of service attacks
- Issues in dependencies (report to the upstream project)

## Security Best Practices

This project follows security best practices:

- All dependencies are regularly updated
- Secrets are never committed to the repository
- Environment variables are validated at startup
- Input is sanitized and validated
- SQL injection is prevented via Prisma ORM
- XSS is prevented via React's built-in escaping
- CSRF protection is enabled
- Rate limiting is implemented on API routes
