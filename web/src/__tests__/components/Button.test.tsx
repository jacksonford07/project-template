/**
 * Component Testing Example
 *
 * Demonstrates how to test React components with Testing Library.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Example Button component (replace with your actual component)
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  loading = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant}`}
      data-loading={loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('applies variant class', () => {
      render(<Button variant="secondary">Secondary</Button>);

      expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    });

    it('shows loading state', () => {
      render(<Button loading>Submit</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Loading...');
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await userEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      // fireEvent works with disabled buttons, userEvent doesn't
      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('is focusable when enabled', async () => {
      render(<Button>Focus me</Button>);

      await userEvent.tab();

      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('is not focusable when disabled', async () => {
      render(<Button disabled>Disabled</Button>);

      await userEvent.tab();

      expect(screen.getByRole('button')).not.toHaveFocus();
    });
  });
});

/**
 * Testing Patterns Reference
 *
 * 1. Query priorities (prefer in this order):
 *    - getByRole - most accessible
 *    - getByLabelText - for form inputs
 *    - getByPlaceholderText - fallback for inputs
 *    - getByText - for non-interactive elements
 *    - getByTestId - last resort
 *
 * 2. User interactions:
 *    - userEvent.click() - clicking
 *    - userEvent.type() - typing
 *    - userEvent.tab() - keyboard navigation
 *    - userEvent.hover() - hover states
 *
 * 3. Async testing:
 *    - findBy* - waits for element to appear
 *    - waitFor() - waits for condition
 *    - waitForElementToBeRemoved() - waits for removal
 *
 * 4. Testing hooks:
 *    - Use renderHook from @testing-library/react
 *    - Wrap in act() for state updates
 */
