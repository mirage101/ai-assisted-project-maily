# Template Serialization Skill

## Purpose

This skill provides patterns for converting component trees to/from database format for persistence in MongoDB and API transport.

## Data Models

### Database Schema (Template)

```javascript
// models/Template.js
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      minlength: [1, 'Name cannot be empty'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    thumbnail: {
      type: String, // URL to thumbnail image
    },
    componentTree: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ['newsletter', 'promotional', 'transactional', 'announcement', 'other'],
      default: 'other',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
templateSchema.index({ userId: 1, createdAt: -1 });
templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ tags: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
```

## Serialization Functions

### Component Tree to Database Format

```javascript
// utils/serialization.js

/**
 * Serialize component tree for database storage
 * Converts component tree object to a plain object suitable for MongoDB
 * 
 * @param {Object} componentTree - Component tree from EditorContext
 * @returns {Object} Serialized tree ready for database
 */
export const serializeComponentTree = (componentTree) => {
  // MongoDB can store objects directly, but we ensure clean structure
  const serialized = {};
  
  for (const [id, component] of Object.entries(componentTree)) {
    serialized[id] = {
      id: component.id,
      type: component.type,
      parentId: component.parentId,
      properties: component.properties || {},
      children: component.children || undefined,
    };
  }
  
  return serialized;
};

/**
 * Deserialize component tree from database
 * Converts database format back to EditorContext format
 * 
 * @param {Object} serializedTree - Tree from database
 * @returns {Object} Component tree for EditorContext
 */
export const deserializeComponentTree = (serializedTree) => {
  if (!serializedTree) {
    // Return default empty tree
    return {
      root: {
        id: 'root',
        type: 'root',
        children: [],
      },
    };
  }
  
  // If tree is a Map (from MongoDB), convert to plain object
  if (serializedTree instanceof Map) {
    const tree = {};
    for (const [key, value] of serializedTree.entries()) {
      tree[key] = value;
    }
    return tree;
  }
  
  return serializedTree;
};
```

### Template to API Response

```javascript
/**
 * Format template for API response
 * Removes sensitive data and formats for client consumption
 * 
 * @param {Object} template - Mongoose template document
 * @returns {Object} Formatted template
 */
export const formatTemplateForResponse = (template) => {
  return {
    id: template._id,
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
    componentTree: deserializeComponentTree(template.componentTree),
    category: template.category,
    tags: template.tags,
    isPublic: template.isPublic,
    userId: template.userId,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
};

/**
 * Format multiple templates for API response
 * 
 * @param {Array} templates - Array of Mongoose template documents
 * @returns {Array} Formatted templates
 */
export const formatTemplatesForResponse = (templates) => {
  return templates.map(formatTemplateForResponse);
};
```

### API Request to Database Format

```javascript
/**
 * Prepare template data from API request for database save
 * Validates and sanitizes data before saving
 * 
 * @param {Object} data - Request body from client
 * @param {String} userId - ID of user creating/updating template
 * @returns {Object} Data ready for database save
 */
export const prepareTemplateForSave = (data, userId) => {
  const {
    name,
    description,
    thumbnail,
    componentTree,
    category,
    tags,
    isPublic,
  } = data;
  
  // Validate component tree
  if (!componentTree || typeof componentTree !== 'object') {
    throw new Error('Invalid component tree');
  }
  
  // Ensure root exists
  if (!componentTree.root) {
    throw new Error('Component tree must have a root');
  }
  
  return {
    name: name?.trim(),
    description: description?.trim() || '',
    thumbnail: thumbnail || '',
    componentTree: serializeComponentTree(componentTree),
    category: category || 'other',
    tags: Array.isArray(tags) ? tags.map((tag) => tag.trim()).filter(Boolean) : [],
    isPublic: Boolean(isPublic),
    userId,
  };
};
```

## Controller Examples

### Save Template

```javascript
// controllers/templateController.js
import Template from '../models/Template.js';
import { prepareTemplateForSave, formatTemplateForResponse } from '../utils/serialization.js';

/**
 * Create new template
 * POST /api/templates
 */
export const createTemplate = async (req, res) => {
  try {
    const templateData = prepareTemplateForSave(req.body, req.user._id);
    
    const template = await Template.create(templateData);
    
    res.status(201).json({
      success: true,
      data: formatTemplateForResponse(template),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update template
 * PUT /api/templates/:id
 */
export const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    // Check ownership
    if (template.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this template',
      });
    }
    
    const updates = prepareTemplateForSave(req.body, req.user._id);
    
    Object.assign(template, updates);
    await template.save();
    
    res.json({
      success: true,
      data: formatTemplateForResponse(template),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get template by ID
 * GET /api/templates/:id
 */
export const getTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    // Check authorization (own template or public)
    if (
      template.userId.toString() !== req.user._id.toString() &&
      !template.isPublic
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this template',
      });
    }
    
    res.json({
      success: true,
      data: formatTemplateForResponse(template),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
```

## Frontend API Integration

### Template Service

```javascript
// services/templateService.js
import api from './api';

/**
 * Save template (create or update)
 * @param {Object} template - Template data
 * @returns {Promise} API response
 */
export const saveTemplate = async (template) => {
  if (template.id) {
    // Update existing
    const response = await api.put(`/templates/${template.id}`, template);
    return response.data;
  } else {
    // Create new
    const response = await api.post('/templates', template);
    return response.data;
  }
};

/**
 * Load template by ID
 * @param {String} id - Template ID
 * @returns {Promise} Template data
 */
export const loadTemplate = async (id) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

/**
 * Get user's templates
 * @returns {Promise} Array of templates
 */
export const getUserTemplates = async () => {
  const response = await api.get('/templates/my-templates');
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
```

### React Hook for Template Operations

```javascript
// hooks/useTemplate.js
import { useState, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { saveTemplate, loadTemplate } from '../services/templateService';

export const useTemplate = () => {
  const { componentTree, loadTemplate: loadIntoEditor, resetEditor } = useEditor();
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const save = useCallback(
    async (metadata) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const templateData = {
          id: currentTemplateId,
          ...metadata,
          componentTree,
        };
        
        const response = await saveTemplate(templateData);
        
        setCurrentTemplateId(response.data.id);
        
        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [componentTree, currentTemplateId]
  );
  
  const load = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loadTemplate(id);
      const template = response.data;
      
      loadIntoEditor(template.componentTree);
      setCurrentTemplateId(template.id);
      
      return template;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadIntoEditor]);
  
  const createNew = useCallback(() => {
    resetEditor();
    setCurrentTemplateId(null);
  }, [resetEditor]);
  
  return {
    save,
    load,
    createNew,
    currentTemplateId,
    isLoading,
    error,
  };
};
```

## Usage Example

```javascript
// components/TemplateEditor.js
import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTemplate } from '../hooks/useTemplate';

const TemplateEditor = () => {
  const { save, load, isLoading } = useTemplate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  const handleSave = async () => {
    try {
      await save({
        name: templateName,
        description: templateDescription,
        category: 'newsletter',
        tags: [],
        isPublic: false,
      });
      
      setSaveDialogOpen(false);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };
  
  return (
    <Box>
      <Button onClick={() => setSaveDialogOpen(true)} disabled={isLoading}>
        Save Template
      </Button>
      
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!templateName.trim() || isLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;
```

---

**Use these patterns to serialize and persist email templates in Maily.**