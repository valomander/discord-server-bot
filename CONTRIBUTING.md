# Contributing to Discord Server Creator Bot

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Ollama or OpenRouter API access
- Discord Bot Token

### Development Setup
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run setup: `npm run setup`
5. Start development: `npm run dev`

## 📝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Follow the bug report template
- Include reproduction steps
- Add relevant logs/screenshots

### Suggesting Features
- Use the feature request template
- Describe the use case clearly
- Consider backward compatibility

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit with descriptive messages
6. Push to your fork
7. Open a pull request

## 🎯 Development Guidelines

### Code Style
- Use ESLint configuration
- Follow existing naming conventions
- Add JSDoc comments for functions
- Keep functions small and focused

### Commit Messages
Follow conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation updates
- `refactor:` code refactoring
- `test:` adding tests

### Testing
- Test all new features manually
- Verify commands work on multiple servers
- Check error handling
- Test with different AI providers

## 🏗️ Project Structure

```
src/
├── commands/     # Slash commands
├── events/       # Discord events
├── services/     # Business logic
├── ai/          # AI integration
├── database/    # Database operations
└── utils/       # Helper functions
```

## 🔧 AI Integration

When working with AI features:
- Maintain fallback configurations
- Handle JSON parsing errors gracefully
- Test with different AI models
- Document prompt changes

## 🌐 Multi-Server Support

Ensure changes work across multiple servers:
- Use server-specific configurations
- Test permission systems
- Verify database isolation

## 📊 Database Changes

For database modifications:
- Update migration scripts
- Maintain backward compatibility
- Document schema changes
- Test with existing data

## 🚀 Deployment

The project uses Docker for deployment:
- Test Docker builds locally
- Verify environment variables
- Check health endpoints
- Monitor resource usage

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🆘 Getting Help

- Open an issue for bugs/questions
- Join our Discord server (link in README)
- Check existing documentation

## 🙏 Recognition

Contributors will be added to the README and recognized for their efforts.

Thank you for making this project better! 🎉