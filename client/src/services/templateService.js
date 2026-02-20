import api from './api';

/**
 * Get all templates (public + user's own)
 * @param {Object} params - Query parameters
 * @returns {Promise} Templates data
 */
export const getTemplates = async (params = {}) => {
  const response = await api.get('/templates', { params });
  return response.data;
};

/**
 * Get user's templates
 * @param {Object} params - Query parameters
 * @returns {Promise} Templates data
 */
export const getMyTemplates = async (params = {}) => {
  const response = await api.get('/templates/my-templates', { params });
  return response.data;
};

/**
 * Get template by ID
 * @param {String} id - Template ID
 * @returns {Promise} Template data
 */
export const getTemplate = async (id) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

/**
 * Create new template
 * @param {Object} templateData - Template data
 * @returns {Promise} Created template
 */
export const createTemplate = async (templateData) => {
  const response = await api.post('/templates', templateData);
  return response.data;
};

/**
 * Update template
 * @param {String} id - Template ID
 * @param {Object} updates - Template updates
 * @returns {Promise} Updated template
 */
export const updateTemplate = async (id, updates) => {
  const response = await api.put(`/templates/${id}`, updates);
  return response.data;
};

/**
 * Delete template
 * @param {String} id - Template ID
 * @returns {Promise} API response
 */
export const deleteTemplate = async (id) => {
  const response = await api.delete(`/templates/${id}`);
  return response.data;
};
