/**
 * Validation utilities for form inputs and API requests
 */

import { LoginForm, RegisterForm } from '@/types';
import { createValidationError } from './errors';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements - simplified
const PASSWORD_MIN_LENGTH = 1;

// Username requirements
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/; // Alphanumeric, underscore, hyphen only

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Individual field validators
export const validators = {
  email: (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email address is too long';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
    }
    return null;
  },

  username: (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < USERNAME_MIN_LENGTH) {
      return `Username must be at least ${USERNAME_MIN_LENGTH} characters long`;
    }
    if (username.length > USERNAME_MAX_LENGTH) {
      return `Username must be no more than ${USERNAME_MAX_LENGTH} characters long`;
    }
    if (!USERNAME_REGEX.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
  },

  number: (value: string, fieldName: string, min?: number, max?: number): string | null => {
    if (!value) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must be no more than ${max}`;
    return null;
  },

  coinAmount: (amount: string): string | null => {
    const error = validators.number(amount, 'Amount', 1, 100000);
    if (error) return error;
    
    const num = Number(amount);
    if (num % 1 !== 0) return 'Amount must be a whole number';
    return null;
  },
};

// Form validators
export const validateLoginForm = (data: LoginForm): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validators.email(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validators.required(data.password, 'Password');
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (data: RegisterForm): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validators.email(data.email);
  if (emailError) errors.email = emailError;

  const usernameError = validators.username(data.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validators.password(data.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validators.confirmPassword(data.password, data.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// API request validators
export const validateApiRequest = (data: unknown, requiredFields: string[]): void => {
  if (!data || typeof data !== 'object') {
    throw createValidationError('Request body must be a valid object');
  }

  const obj = data as Record<string, unknown>;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw createValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    );
  }
};

// Sanitization helpers
export const sanitize = {
  string: (value: unknown): string => {
    if (typeof value !== 'string') return '';
    return value.trim();
  },

  email: (value: unknown): string => {
    const email = sanitize.string(value);
    return email.toLowerCase();
  },

  username: (value: unknown): string => {
    const username = sanitize.string(value);
    return username.toLowerCase();
  },

  number: (value: unknown): number | null => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const num = Number(value.trim());
      return isNaN(num) ? null : num;
    }
    return null;
  },
};

// Safe parsing helpers
export const safeParseInt = (value: string | undefined, defaultValue = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseFloat = (value: string | undefined, defaultValue = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Environment variable validation
export const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
};

export const validateOptionalEnvVar = (name: string, value: string | undefined, defaultValue: string): string => {
  return value || defaultValue;
};