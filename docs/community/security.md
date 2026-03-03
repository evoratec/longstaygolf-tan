---
title: Security Policy
description: How to report vulnerabilities and our security response process
---

# Security Policy

Cadence takes security seriously. This document covers how to report vulnerabilities and our process for handling them responsibly.

For deployment hardening, configuration security, and operational best practices, see the [Security Best Practices](/docs/reference/operations/security) guide.

## Reporting a Vulnerability

If you discover a security vulnerability in Cadence, please **do not open a public GitHub issue**. Public disclosure can put users at risk before a fix is available.

### How to Report

**Preferred Method - Private Security Advisory:**

1. Go to [GitHub Security Advisories](https://github.com/TryCadence/Cadence/security/advisories/new)
2. Click "Report a vulnerability"
3. Fill out the form with details
4. Submit privately

**Alternative - Email:**

Send details to [security@noslop.tech](mailto:security@noslop.tech) with:
- Subject line: "SECURITY: [Brief Description]"
- Detailed description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact assessment
- Any proposed fixes (optional)

**Social Media (Urgent Only):**

For critical, time-sensitive issues: [@NoSlopTech](https://x.com/NoSlopTech) on Twitter/X

### What to Include

When reporting a vulnerability, please provide:

1. **Description**: Clear explanation of the vulnerability
2. **Impact**: Potential consequences if exploited
3. **Steps to Reproduce**: Detailed instructions to verify the issue
4. **Environment**: Cadence version, OS, Go version
5. **Proof of Concept**: Code or commands demonstrating the issue (if safe)
6. **Suggested Fix**: Your ideas for remediation (optional)
7. **Disclosure Timeline**: When you plan to disclose publicly (if at all)

**Example Report:**

```markdown
**Vulnerability:** Command injection in repository URL parsing

**Impact:** Attacker can execute arbitrary commands on the server 
by crafting malicious repository URLs.

**Steps to Reproduce:**
1. Run: cadence analyze "https://evil.com/repo; rm -rf /"
2. Observe shell command execution

**Environment:**
- Cadence: v0.3.0
- OS: Linux
- Go: 1.24.0

**Suggested Fix:** Sanitize URL input and use exec.Command 
with separate arguments instead of shell execution.
```

### Response Timeline

We aim to respond within:

- **48 hours**: Acknowledge receipt of your report
- **7 days**: Initial assessment and severity classification
- **30 days**: Patch development and testing (for non-critical issues)
- **Immediate**: Emergency patch for critical vulnerabilities

You'll receive updates on vulnerability confirmation, fix development progress, expected release date, and public disclosure timeline.

## Supported Versions

| Version | Status | Support Level |
|---------|--------|---------------|
| v0.3.x  | Current | Full support with security fixes, bug fixes, and features |
| v0.2.x  | Maintenance | Security fixes only, no new features |
| v0.1.x  | EOL | Not supported, please upgrade |
| < v0.1  | EOL | Not supported, please upgrade |

Always use the latest stable release for the best security posture.

## Severity Levels

We classify vulnerabilities using CVSS scores:

| Severity | CVSS Score | Response Time | Examples |
|----------|------------|---------------|----------|
| **Critical** | 9.0–10.0 | Immediate | Remote code execution, auth bypass |
| **High** | 7.0–8.9 | 7 days | Privilege escalation, data exposure |
| **Medium** | 4.0–6.9 | 30 days | DoS, information disclosure |
| **Low** | 0.1–3.9 | Next release | Minor info leaks, low-impact issues |

Critical and High severity issues trigger immediate patch releases.

## Security Notifications

Stay informed about security updates:

- **GitHub Security Advisories** — [View advisories](https://github.com/TryCadence/Cadence/security/advisories)
- **Release Notes** — Check `CHANGELOG.md` for security fixes tagged `security`
- **GitHub Watch** — Watch the repository and select "Releases" for notifications

## Responsible Disclosure

We ask that you:

- Give us reasonable time to address the issue before public disclosure
- Avoid accessing or modifying user data beyond what is needed to demonstrate the vulnerability
- Do not exploit the vulnerability beyond what's needed for a proof of concept
- Keep details private until we have released a fix

We commit to:

- Acknowledging reports promptly
- Keeping you informed throughout the process
- Not pursuing legal action against researchers acting in good faith
- Crediting your contribution publicly (unless you prefer anonymity)

### Recognition

If you'd like:

- **Credit in Security Advisory** — We'll acknowledge your contribution
- **Listed as Reporter** — Your name or handle in release notes
- **Anonymity** — We'll keep your identity private if requested

## Contact

For security-related questions (not vulnerability reports):

- **Security**: [security@noslop.tech](mailto:security@noslop.tech)
- **Support**: [support@noslop.tech](mailto:support@noslop.tech)
- **Discussions**: [GitHub Discussions](https://github.com/TryCadence/Cadence/discussions)

For vulnerability reports, use the [reporting process](#reporting-a-vulnerability) above.

---

**Last Updated**: March 2026

