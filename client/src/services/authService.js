import api from './api';

/**
 * Register new user
 * @param {Object} userData - User data (name, email, password)
 * @returns {Promise} API response
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} API response
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get current user
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Promise} Updated user data
 */
export const updateProfile = async (updates) => {
  const response = await api.put('/auth/profile', updates);
  return response.data;
};

/**
 * Update password
 * @param {Object} passwords - Current and new password
 * @returns {Promise} API response
 */
export const updatePassword = async (passwords) => {
  const response = await api.put('/auth/password', passwords);
  return response.data;
};
