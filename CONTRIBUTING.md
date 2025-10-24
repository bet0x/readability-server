# Contributing to Readability Server

Thank you for your interest in contributing to the Readability Server! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Git

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/readability-server.git
   cd readability-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- Follow the existing code style and patterns
- Use ESLint for JavaScript linting: `npm run lint`
- Use Prettier for code formatting: `npm run lint:fix`
- Write clear, descriptive commit messages

### Testing

Run the test suite before submitting changes:

```bash
# Run all tests
npm test

# Run server tests
npm run test:server

# Run tests in watch mode
npm test -- -w
```

### Project Structure

The project follows a clean architecture:

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic
├── utils/           # Utility functions
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## Types of Contributions

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant logs or error messages

### Feature Requests

For new features, please:

- Describe the feature clearly
- Explain the use case and benefits
- Consider backward compatibility
- Provide examples if applicable

### Code Contributions

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes:**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes:**
   ```bash
   git commit -m "Add: brief description of changes"
   ```

5. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

### Before Submitting

- [ ] Run `npm test` and ensure all tests pass
- [ ] Run `npm run lint` and fix any issues
- [ ] Update documentation if needed
- [ ] Add tests for new functionality
- [ ] Ensure your changes don't break existing functionality

### Pull Request Template

When creating a pull request, please include:

- **Description:** What changes does this PR make?
- **Type:** Bug fix, feature, documentation, etc.
- **Testing:** How was this tested?
- **Breaking Changes:** Are there any breaking changes?

### Review Process

- All pull requests require review
- Maintainers will review code quality, tests, and documentation
- Address feedback promptly
- Keep pull requests focused and reasonably sized

## API Development

### Adding New Endpoints

1. **Create route handler** in `src/routes/`
2. **Add business logic** in `src/services/`
3. **Update Swagger documentation** in `src/config/swagger.js`
4. **Add tests** in `test/`
5. **Update API documentation** in `docs/API.md`

### Middleware Development

- Place custom middleware in `src/middleware/`
- Follow the existing middleware patterns
- Add proper error handling
- Include JSDoc comments

## Documentation

### Updating Documentation

- Keep `README.md` up to date
- Update `docs/` files for significant changes
- Add JSDoc comments for new functions
- Update API documentation for endpoint changes

### Documentation Structure

```
docs/
├── API.md           # API reference
├── ARCHITECTURE.md  # Project architecture
└── DEPLOYMENT.md    # Deployment guide
```

## Security

### Reporting Security Issues

**Do not** report security vulnerabilities through public GitHub issues.

Instead, please email security concerns to: albertof@barrahome.org

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fixes (if any)

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (backward compatible)

### Changelog

Update `CHANGELOG.md` for significant changes:
- New features
- Bug fixes
- Breaking changes
- Deprecations

## Community

### Getting Help

- **Issues:** Use GitHub Issues for bugs and feature requests
- **Discussions:** Use GitHub Discussions for questions and ideas
- **Email:** Contact albertof@barrahome.org for direct communication

### Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). Please read and follow it in all interactions.

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache-2.0 License.

## Recognition

Contributors will be recognized in:
- `CHANGELOG.md` for significant contributions
- GitHub contributors list
- Project documentation

Thank you for contributing to the Readability Server! 🚀