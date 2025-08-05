# Contributing to AssetAlchemyPrime

Thank you for your interest in contributing to AssetAlchemyPrime! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended with recommended extensions)
- PostgreSQL (optional, for full backend development)

### Development Setup
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/AssetAlchemyPrime/platform.git
   cd platform
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. (Optional) Start with backend:
   ```bash
   npm run dev:full
   ```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure
```typescript
// Component template
import React from 'react';
import { IconName } from 'lucide-react';

interface ComponentProps {
  // Define props with TypeScript
}

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic here
  
  return (
    <div className="component-styles">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Styling Guidelines
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing (4px base unit)
- Use the established color palette
- Ensure dark mode compatibility

### File Organization
- Components in `src/components/`
- Types in `src/types/`
- Hooks in `src/hooks/`
- Data/constants in `src/data/`
- One component per file
- Use descriptive file names

## 🔧 Development Process

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(dashboard): add transaction filtering
fix(auth): resolve 2FA validation issue
docs(readme): update installation instructions
```

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request with:
   - Clear title and description
   - Screenshots for UI changes
   - Testing instructions

## 🧪 Testing

### Manual Testing
- Test on different screen sizes
- Verify dark/light mode compatibility
- Check all interactive elements
- Test form validations
- Verify responsive behavior

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 🎨 Design Guidelines

### UI/UX Principles
- **Consistency**: Use established patterns
- **Accessibility**: Ensure WCAG compliance
- **Performance**: Optimize for speed
- **Security**: Follow security best practices

### Color Usage
- Primary: Teal (#14B8A6) to Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

### Typography
- Headings: Inter font, weights 600-700
- Body: Inter font, weights 400-500
- Code: JetBrains Mono

## 🔒 Security Considerations

### Frontend Security
- Validate all user inputs
- Sanitize data before display
- Use HTTPS for all requests
- Implement proper error handling
- Follow OWASP guidelines

### Data Handling
- Never store sensitive data in localStorage
- Use secure session management
- Implement proper authentication flows
- Validate on both client and server

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

### Tools
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable
- Console errors if any

## 💡 Feature Requests

For feature requests:
- Describe the feature clearly
- Explain the use case and benefits
- Provide mockups or examples if possible
- Consider implementation complexity
- Discuss with maintainers first

## 📞 Getting Help

- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Code review feedback in PRs
- Documentation improvements welcome

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks for major features

Thank you for contributing to AssetAlchemyPrime! 🚀