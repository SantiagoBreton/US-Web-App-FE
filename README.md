
### 🛠️ Tech Stack & Tools
[![⚛️ React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![📘 TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![⚡ Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?logo=vite)](https://vitejs.dev/)
[![🎨 Tailwind](https://img.shields.io/badge/Tailwind-3.4.14-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![🧪 Vitest](https://img.shields.io/badge/Vitest-2.1.5-6E9F18?logo=vitest)](https://vitest.dev/)
[![📋 ESLint](https://img.shields.io/badge/ESLint-9.13.0-4B32C3?logo=eslint)](https://eslint.org/)

### 📈 Project Metrics
[![📄 License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![💻 Platform](https://img.shields.io/badge/Platform-Web-blue)](https://github.com/SantiagoBreton/US-Web-App)
[![🔄 Maintained](https://img.shields.io/badge/Maintained-Yes-green)](https://github.com/SantiagoBreton/US-Web-App/graphs/commit-activity)

Modern apartment management system with comprehensive testing suite, automated CI/CD pipeline, and advanced metrics visualization.

## 🎯 Project Overview

A modern React TypeScript application for apartment management with user authentication, reservation system, and comprehensive testing coverage. Built with modern development practices including automated testing, continuous integration, deployment, and real-time metrics dashboard.

## 📊 Metrics & Analytics Dashboard

### 📈 Live Metrics
Our GitHub Actions workflows provide comprehensive project metrics:

- **🧪 Test Coverage Dashboard**: Detailed coverage metrics with visual indicators
- **📊 Code Quality Metrics**: Lines of code, component count, file statistics
- **🚀 CI/CD Pipeline Status**: Build success rates and deployment metrics
- **🔍 Test Results**: Pass/fail rates, test count trends, and performance data

### 📋 Available Reports
- **Test Coverage Report**: Detailed line-by-line coverage analysis
- **Metrics Dashboard**: Daily automated project health reports
- **Quality Gates**: Automated quality thresholds and checks
- **Badge Generation**: Dynamic badges for README and documentation

> 💡 **Pro Tip**: Check the [Actions tab](https://github.com/SantiagoBreton/US-Web-App/actions) to see the latest metrics dashboard and test coverage reports!

## 🧪 Testing & Quality Assurance

### 📊 Current Test Stats
- **105 Passing Tests** with 5 skipped tests (110 total)
- **Coverage Metrics**: 26.8% lines, 50.99% functions, 84.42% branches
- **Test Types**: Unit tests, Integration tests, API tests, E2E workflows
- **Modern Testing Stack**: Vitest + React Testing Library + Fetch Mocking
- **Continuous Testing** with GitHub Actions
- **Auto-Generated Reports**: Coverage visualization and metrics

### 🎯 Quality Standards
- **Automated Code Coverage**: Real-time coverage tracking
- **ESLint Integration**: Code quality enforcement
- **TypeScript Strict Mode**: Type safety and reliability
- **Performance Monitoring**: Build time and test execution metrics
- **Dependency Security**: Automated vulnerability scanning

### Test Commands

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Generate coverage badge
npm run coverage:badge
```

## 🚀 Development

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔄 CI/CD Pipeline

### Main Branch Pipeline (`ci.yml`)
- **Triggers**: Push/PR to `main` and `develop` branches
- **Node Versions**: 18.x, 20.x (matrix testing)
- **Steps**:
  1. Code linting with ESLint
  2. Test execution with coverage reporting
  3. Build verification
  4. Coverage upload to Codecov
  5. **Auto-deployment** to GitHub Pages (main branch only)

### Development Pipeline (`dev.yml`)
- **Triggers**: Push/PR to `develop` branch
- **Steps**: Linting, testing, building (no deployment)

### Coverage Reporting
- **Provider**: v8
- **Formats**: Text, JSON, HTML, LCOV
- **Upload**: Codecov integration
- **Thresholds**: 80% minimum coverage required

## 📊 Features

### Core Functionality
- ✅ **User Authentication**: Login/Register with validation
- ✅ **Apartment Management**: CRUD operations for apartments
- ✅ **Reservation System**: Booking and management
- ✅ **Modern UI Components**: Date/Time pickers with animations
- ✅ **Responsive Design**: Mobile-first approach

### Technical Features
- ✅ **TypeScript**: Full type safety
- ✅ **Modern React**: Hooks, Context, Routing
- ✅ **Animation**: Framer Motion integration
- ✅ **API Mocking**: MSW for testing
- ✅ **Code Quality**: ESLint configuration
- ✅ **Build Optimization**: Vite bundling

## 🛠️ Tech Stack

### Frontend Framework
- **React 19** - Modern React with latest features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server

### Styling & UI
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Icons** - Additional icon sets

### Testing
- **Vitest** - Fast test runner
- **React Testing Library** - Component testing utilities
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/jest-dom** - Custom matchers

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **GitHub Actions** - CI/CD automation

## 📁 Project Structure

```
src/
├── api_calls/          # API integration functions
├── assets/             # Static assets (images, icons)
├── components/         # Reusable React components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components (Login, Register, Dashboard)
├── styles/             # Global styles
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── pages/          # Page tests
    ├── integration/    # Integration tests
    └── utils/          # Test utilities and mocks
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with Vitest setup
- `tailwind.config.js` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules and settings
- `.github/workflows/` - CI/CD pipeline definitions

## 📈 Deployment

### GitHub Pages (Automatic)
- **Trigger**: Push to `main` branch
- **Build**: Automatic via GitHub Actions
- **URL**: `https://USERNAME.github.io/REPOSITORY`

### Manual Deployment
```bash
# Build production version
npm run build

# Deploy dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:coverage`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Maintain test coverage above 80%
- Follow TypeScript best practices
- Use ESLint for code consistency
- Write meaningful commit messages
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common CI/CD Issues

#### Tests fail in GitHub Actions but pass locally
- **Cause**: Environment differences between local and CI
- **Solution**: Use `npm run test:ci` which includes Node.js polyfills

#### webidl-conversions or whatwg-url errors
- **Cause**: Missing Node.js polyfills for web APIs
- **Solution**: Our setup includes automatic polyfills in `src/__tests__/setup.ts`

#### MSW (Mock Service Worker) issues in CI
- **Cause**: Missing fetch polyfills in Node.js environment  
- **Solution**: We use `undici` as a fetch polyfill for CI environments

### Development Issues

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/USERNAME/REPOSITORY/issues)
2. Review the test output for specific error messages
3. Ensure all dependencies are properly installed: `npm ci`
4. Verify Node.js version compatibility (18.x or 20.x)
5. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Testing Commands

```bash
# Local development testing
npm test                    # Watch mode
npm run test:run           # Single run
npm run test:coverage      # With coverage
npm run test:ui           # UI interface

# CI-compatible testing
npm run test:ci           # Optimized for CI environments
```

---

**Note**: Replace `USERNAME/REPOSITORY` in badge URLs with your actual GitHub username and repository name.
