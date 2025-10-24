# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public GitHub issue

Security vulnerabilities should not be reported through public GitHub issues or discussions.

### 2. Email us directly

Send an email to: **albertof@barrahome.org**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes or mitigations
- Your contact information (optional)

### 3. Response timeline

- **Initial response:** Within 48 hours
- **Status update:** Within 7 days
- **Resolution:** Depends on severity and complexity

### 4. What to expect

- We will acknowledge receipt of your report
- We will investigate the vulnerability
- We will provide regular updates on our progress
- We will coordinate the disclosure timeline with you
- We will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

- Keep your server updated to the latest version
- Use strong API keys when authentication is enabled
- Configure proper CORS origins for production
- Use HTTPS in production environments
- Regularly review and rotate API keys
- Monitor server logs for suspicious activity

### For Developers

- Sanitize all user inputs
- Validate URLs before processing
- Use appropriate rate limiting
- Implement proper error handling
- Follow secure coding practices
- Keep dependencies updated

## Security Features

The Readability Server includes several security features:

- **API Key Authentication:** Optional API key protection
- **Rate Limiting:** Prevents abuse and DoS attacks
- **CORS Protection:** Configurable cross-origin requests
- **Security Headers:** Helmet.js for security headers
- **Input Validation:** Request validation and sanitization
- **Content Security Policy:** XSS protection

## Known Security Considerations

### Input Sanitization

The Readability Server processes HTML content from external sources. While we implement basic sanitization, you should:

- Use additional sanitization libraries like [DOMPurify](https://github.com/cure53/DOMPurify) for user-generated content
- Validate and sanitize URLs before processing
- Implement proper output encoding

### Content Processing

- The server fetches content from external URLs
- Malicious websites could potentially serve harmful content
- Consider implementing additional security measures for production use

### API Key Security

- Use strong, unique API keys
- Store API keys securely
- Rotate API keys regularly
- Monitor for unauthorized usage

## Security Updates

Security updates will be:
- Released as patch versions when possible
- Documented in the CHANGELOG.md
- Communicated through GitHub releases
- Prioritized over feature development

## Responsible Disclosure

We follow responsible disclosure practices:
- We will not publicly disclose vulnerabilities until they are fixed
- We will work with security researchers to coordinate disclosure
- We will provide appropriate credit to security researchers
- We will maintain confidentiality during the investigation process

## Contact

For security-related questions or concerns:
- **Email:** albertof@barrahome.org
- **Subject:** [SECURITY] Brief description

Thank you for helping keep the Readability Server secure! 🔒