# Agent Coding Guidelines

This document provides guidelines for agents operating in this repository.

## Project Overview

<!-- Fill in: project name, type, and purpose -->

## Build/Lint/Test Commands

### Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run typecheck

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run a single test file
npm test -- <test-file-path>

# Run tests in watch mode
npm run test:watch
```

### Testing Framework

- **Framework**: Jest (or Vitest)
- **Run specific test**: `npm test -- src/__tests__/filename.test.ts`
- **Run test matching pattern**: `npm test -- --testNamePattern="pattern"`
- **Update snapshots**: `npm test -- -u`

## Code Style

### Formatting

- **Tool**: Prettier
- **Line length**: 100 characters
- **Semicolons**: Required
- **Single quotes**: For strings
- **Trailing commas**: ES5 style (last element in multiline)

### Imports

```typescript
// Order matters - groups separated by blank lines:
// 1. React / framework imports
// 2. External libraries
// 3. Internal imports (using aliases)
// 4. Relative imports (../, ./)
// 5. Type imports

import React, { useState, useEffect } from 'react';
import { some } from 'external-lib';
import { something } from '@/components/button';
import { helper } from '../utils/helper';
import type { User } from './types';
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `userName`, `isLoading` |
| Constants | UPPER_SNAKE | `MAX_RETRIES`, `API_URL` |
| Functions | camelCase (verb prefix) | `getUser()`, `fetchData()` |
| Classes | PascalCase | `UserService`, `CartManager` |
| Types/Interfaces | PascalCase | `UserData`, `ApiResponse` |
| Files (components) | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Files (utilities) | kebab-case | `date-utils.ts`, `api-helpers.ts` |
| Enums | PascalCase (members UPPER_SNAKE) | `Status.PENDING` |

### TypeScript Guidelines

- **Strict mode**: Always enabled
- **Explicit types**: Required for function parameters and return types
- **Interfaces**: Preferred over `type` for object shapes
- **Avoid `any`**: Use `unknown` when type is truly unknown
- **Generics**: Use when type needs to be flexible

```typescript
// Good
function processData<T>(data: T[]): T | null {
  return data[0] ?? null;
}

// Avoid
function processData(data: any[]): any { }
```

### Component Guidelines

```typescript
// Component file structure:
// 1. Imports
// 2. Types/interfaces
// 3. Component definition
// 4. Styled components (if applicable)
// 5. Helper functions

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

### Error Handling

```typescript
// Always use try/catch for async operations
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Never swallow errors silently
// Bad: catch {} - swallows all errors
// Good: catch (error) { handleError(error); }
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── utils/              # Utility functions
├── types/              # Shared TypeScript types
├── pages/              # Page components
└── App.tsx
```

## Git Workflow

- **Branch naming**: `feature/description` or `fix/description`
- **Commit messages**: Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **PR description**: Required for all pull requests

## Cursor/ Copilot Instructions

<!-- Add any .cursorrules or .github/copilot-instructions.md content here -->

## Additional Notes

<!-- Add project-specific guidelines here -->
