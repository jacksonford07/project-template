'use client';

import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { z, type ZodSchema, type ZodError } from 'zod';

/**
 * useForm Hook
 *
 * A lightweight form management hook with Zod validation.
 * For complex forms, consider React Hook Form: pnpm add react-hook-form @hookform/resolvers
 *
 * @example
 * ```tsx
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * function LoginForm() {
 *   const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm({
 *     schema: loginSchema,
 *     initialValues: { email: '', password: '' },
 *     onSubmit: async (data) => {
 *       await login(data);
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         name="email"
 *         value={values.email}
 *         onChange={handleChange}
 *         onBlur={handleBlur}
 *       />
 *       {touched.email && errors.email && <span>{errors.email}</span>}
 *       <button type="submit" disabled={isSubmitting}>
 *         {isSubmitting ? 'Loading...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */

type FormErrors<T> = Partial<Record<keyof T, string>>;
type FormTouched<T> = Partial<Record<keyof T, boolean>>;

interface UseFormOptions<T extends Record<string, unknown>> {
  schema: ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  onError?: (errors: FormErrors<T>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  reset: (newValues?: T) => void;
  validate: () => boolean;
}

export function useForm<T extends Record<string, unknown>>({
  schema,
  initialValues,
  onSubmit,
  onError,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty (values differ from initial)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T, value: unknown): string | undefined => {
      try {
        // Create a partial schema for single field validation
        const fieldSchema = z.object({ [field]: schema.shape[field as string] });
        fieldSchema.parse({ [field]: value });
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message;
        }
        return 'Validation error';
      }
    },
    [schema]
  );

  // Validate entire form
  const validate = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors<T> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T;
          if (!newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
        onError?.(newErrors);
        return false;
      }
      return false;
    }
  }, [schema, values, onError]);

  // Check if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0;

  // Handle input change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));

      if (validateOnChange) {
        const fieldError = validateField(name as keyof T, newValue);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }
    },
    [validateOnChange, validateField]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const fieldError = validateField(name as keyof T, value);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }
    },
    [validateOnBlur, validateField]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as FormTouched<T>
      );
      setTouched(allTouched);

      // Validate
      if (!validate()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  // Set a single field value
  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set a single field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set a single field touched state
  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form
  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    reset,
    validate,
  };
}

/**
 * Form Field Component Helper
 *
 * A wrapper component for form fields with built-in error display.
 */
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  name,
  error,
  touched,
  required,
  children,
}: FormFieldProps): React.ReactElement {
  const showError = touched && error;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {showError && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
