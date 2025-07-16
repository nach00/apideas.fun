import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/database'
import { 
  ApplicationError,
  ErrorCodes,
  createValidationError,
  createErrorResponse, 
  handleAsyncError
} from '@/lib/errors'
import { validateRegisterForm } from '@/lib/validation'
import { 
  setSecurityHeaders, 
  isValidEmail, 
  isStrongPassword, 
  validateUserInput,
  getClientIP,
  isSuspiciousIP
} from '@/lib/security'
import { ApiResponse, User } from '@/types'

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<{ user: User }>>
): Promise<void> {
  setSecurityHeaders(res)
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    })
  }

  // Basic IP security check
  const clientIP = getClientIP(req)
  if (isSuspiciousIP(clientIP)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Request blocked for security reasons'
    })
  }

  const [result, error] = await handleAsyncError(async () => {
    const { email, username, password } = req.body

    // Input validation
    const formValidation = validateRegisterForm({ email, username, password, confirmPassword: password })
    if (!formValidation.isValid) {
      throw createValidationError('Invalid form data', formValidation.errors)
    }

    // Additional security validation
    if (!isValidEmail(email)) {
      throw createValidationError('Invalid email format')
    }


    // Check for malicious input
    const emailValidation = validateUserInput(email, 'Email')
    const usernameValidation = validateUserInput(username, 'Username')
    
    if (!emailValidation.valid) {
      throw createValidationError(emailValidation.error!)
    }
    
    if (!usernameValidation.valid) {
      throw createValidationError(usernameValidation.error!)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      throw new ApplicationError(
        ErrorCodes.VALIDATION_ERROR,
        existingUser.email === email.toLowerCase() ? 'Email already exists' : 'Username already exists'
      )
    }

    // Hash password with high cost factor for security
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with sanitized data
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        hashedPassword,
        coinBalance: 200,
        role: 'user',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        coinBalance: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return { 
      user: {
        ...user,
        role: user.role as 'user' | 'admin',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    }
  }, 'USER_REGISTRATION')

  if (error) {
    const statusCode = error.code === ErrorCodes.VALIDATION_ERROR ? 400 : 500
    return res.status(statusCode).json(createErrorResponse(error))
  }

  if (!result) {
    return res.status(500).json({ 
      success: false, 
      error: 'Registration failed',
      message: 'An unexpected error occurred during registration'
    })
  }

  return res.status(201).json({ 
    success: true,
    data: result,
    message: 'User registered successfully'
  })
}