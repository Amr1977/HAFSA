# Contributing to Hafsa (حفصة)

Thank you for your interest in contributing! This project aims to build an Islamic marriage platform rooted in traditional values. All contributions should align with this mission.

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the linter and type checker
5. Commit with a clear message
6. Push and open a Pull Request

## Commit Convention

We use conventional commit messages:

```
feat: add new feature
fix: correct a bug
refactor: restructure code without changing behavior
i18n: add or update translations
style: visual/design changes (not code formatting)
docs: documentation changes
chore: build, CI, or tooling changes
```

## Code Guidelines

- **Arabic-first**: All UI text must have Arabic translations. English, French, and Urdu updates are strongly encouraged.
- **RTL support**: Ensure new components work correctly in RTL mode. Use Tailwind's `rtl:` variants where needed.
- **Dark mode**: New components should include `dark:` Tailwind variants.
- **No hardcoded secrets**: Environment variables only. Never commit API keys, tokens, or credentials.
- **TypeScript**: Use strict typing. Avoid `any`.
- **No comments in code** unless the logic is non-obvious.

## Pull Request Process

1. Ensure your code builds: `cd frontend && npm run build`
2. Update documentation if adding new features
3. Add translations for any new UI strings
4. The PR will be reviewed for code quality, security, and Islamic content accuracy

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Specify your environment (browser, OS, Node version)

## Code of Conduct

All contributors must maintain respect and professionalism. This project serves an Islamic purpose, and all interactions should reflect Islamic manners (أخلاق إسلامية).

جزاكم الله خيراً
