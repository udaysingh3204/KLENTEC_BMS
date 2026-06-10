/**
 * Authentication utilities for user login/registration
 */

export type UserRole = 'admin' | 'employee' | 'delivery';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  return { valid: true };
}

/**
 * Validate phone number (basic)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Generate user ID
 */
export function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Hash password (simple - for demo; use bcrypt in production)
 */
export function hashPassword(password: string): string {
  // In production, use bcrypt or argon2
  // For now, using a simple hash
  return btoa(password); // base64 encoding (NOT SECURE - demo only)
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Get role display label
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Administrator',
    employee: 'Employee',
    delivery: 'Delivery Staff',
  };
  return labels[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full access to all features and settings',
    employee: 'Can manage inventory, billing, and customer operations',
    delivery: 'Can view and update assigned deliveries only',
  };
  return descriptions[role];
}
