import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Protect routes - require authentication
 * Verifies JWT token and attaches user to request
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid token');
  }
});

/**
 * Verify resource ownership
 * Checks if authenticated user owns the resource
 * 
 * @param {Function} getResourceUserId - Function that returns resource's userId from req
 */
export const verifyOwnership = (getResourceUserId) => {
  return asyncHandler(async (req, res, next) => {
    const resourceUserId = await getResourceUserId(req);

    if (!resourceUserId) {
      res.status(404);
      throw new Error('Resource not found');
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this resource');
    }

    next();
  });
};
