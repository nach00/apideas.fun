/**
 * Security utilities for headers, rate limiting, and protection
 */

import { NextApiRequest, NextApiResponse } from 'next';

// Security headers for API responses
export const setSecurityHeaders = (res: NextApiResponse): void => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CSRF protection
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent information disclosure
  res.setHeader('X-Powered-By', ''); // Remove default Next.js header
  
  // Content Security Policy for API responses
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
};

// Simple in-memory rate limiting (for demonstration - use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (ip: string, windowMs: number, maxRequests: number): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const key = `${ip}_${Math.floor(now / windowMs)}`;
  
  const current = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    // Reset the window
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  
  current.count++;
  requestCounts.set(key, current);
  
  // Clean up old entries
  if (requestCounts.size > 1000) {
    const entries = Array.from(requestCounts.entries());
    for (const [k, v] of entries) {
      if (now > v.resetTime) {
        requestCounts.delete(k);
      }
    }
  }
  
  return {
    allowed: current.count <= maxRequests,
    remaining: Math.max(0, maxRequests - current.count)
  };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

// Email validation with additional security checks
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Basic format check
  if (!emailRegex.test(email)) return false;
  
  // Length checks
  if (email.length > 254) return false;
  
  const [localPart] = email.split('@');
  if (localPart.length > 64) return false;
  
  // Check for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }
  
  return true;
};

// Password strength validation - simplified
export const isStrongPassword = (password: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, issues: ['Password is required'] };
  }
  
  if (password.length < 1) {
    issues.push('Password is required');
  }
  
  if (password.length > 128) {
    issues.push('Password must be less than 128 characters');
  }
  
  return { valid: issues.length === 0, issues };
};

// SQL injection protection (additional layer)
export const containsSQLInjection = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /('|(\\')|(;|%3B)|(--)|(%2D%2D))/i,
    /(\/\*|\*\/|%2F%2A|%2A%2F)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS protection (additional layer)
export const containsXSS = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Comprehensive input validation
export const validateUserInput = (input: string, fieldName: string): { valid: boolean; error?: string } => {
  if (containsSQLInjection(input)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  if (containsXSS(input)) {
    return { valid: false, error: `${fieldName} contains invalid content` };
  }
  
  return { valid: true };
};

// IP-based security checks
export const getClientIP = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.connection.remoteAddress || 'unknown';
    
  return ip;
};

// Check if IP is from suspicious sources (basic implementation)
export const isSuspiciousIP = (ip: string): boolean => {
  // This is a basic implementation - in production, you'd check against
  // threat intelligence feeds, known bad IP lists, etc.
  
  // Block localhost attempts in production
  if (process.env.NODE_ENV === 'production' && (ip === '127.0.0.1' || ip === '::1')) {
    return true;
  }
  
  return false;
};