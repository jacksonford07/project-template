# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow responsible disclosure practices.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email your findings to: **[security@your-domain.com]** (update this with your actual email)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

### Safe Harbor

We consider security research conducted in accordance with this policy to be:
- Authorized
- Not a violation of any terms of service
- Helpful and conducted in good faith

We will not pursue legal action against researchers who:
- Make a good faith effort to avoid privacy violations
- Avoid data destruction or service disruption
- Report findings promptly and work with us to resolve issues

## Security Measures

This project implements the following security measures:

### Pre-commit Hooks
- **Gitleaks**: Scans for secrets before commits
- **lint-staged**: Ensures code quality

### CI/CD Security
- **npm audit**: Checks for vulnerable dependencies
- **Gitleaks Action**: Scans repository for exposed secrets

### Application Security
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Rate Limiting**: Protects API endpoints from abuse
- **Input Validation**: Zod schemas for all inputs
- **CSRF Protection**: Built into NextAuth
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

### Best Practices
- No default credentials in example files
- Environment variables for all secrets
- Strict TypeScript for type safety
- Regular dependency updates

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No secrets or credentials in code
- [ ] No `console.log` statements with sensitive data
- [ ] Input validation on all user inputs
- [ ] Proper error handling (no stack traces to users)
- [ ] Rate limiting on new API endpoints
- [ ] SQL injection prevention (use Prisma, no raw queries)
- [ ] XSS prevention (sanitize user content)
- [ ] CSRF tokens for state-changing operations

## Dependencies

We use automated tools to monitor dependencies:
- Dependabot (optional - enable in repository settings)
- `pnpm audit` in CI pipeline

To check for vulnerabilities locally:
```bash
cd web && pnpm audit
```

## Contact

For non-security bugs, please open a GitHub issue.
For security vulnerabilities, email: **[security@your-domain.com]**
