import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('process', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
    // Add other test env vars as needed
  },
}));
