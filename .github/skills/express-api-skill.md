# Express API Skill

## Purpose

This skill provides patterns for building RESTful API endpoints with Express.js, including routing, controllers, and middleware.

## Router Pattern

### Basic Router Setup

```javascript
// routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Collection routes
router.route('/')
  .get(getTemplates)        // GET /api/templates
  .post(createTemplate);    // POST /api/templates

// Single resource routes
router.route('/:id')
  .get(getTemplate)         // GET /api/templates/:id
  .put(updateTemplate)      // PUT /api/templates/:id
  .delete(deleteTemplate);  // DELETE /api/templates/:id

// Action route
router.get('/:id/export', exportTemplate);  // GET /api/templates/:id/export

module.exports = router;
```

### Router with Multiple Middleware

```javascript
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateTemplate } = require('../middleware/validate');

router.post(
  '/',
  protect,              // Authentication
  validateTemplate,     // Validation
  createTemplate        // Controller
);

router.put(
  '/:id',
  protect,
  validateTemplate,
  updateTemplate
);
```

## Controller Patterns

### Basic CRUD Controller

```javascript
// controllers/templateController.js
const Template = require('../models/Template');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Private
exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await Template.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('name createdAt updatedAt');
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    // Check ownership
    if (template.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create template
// @route   POST /api/templates
// @access  Private
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, components, html } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }
    
    const template = await Template.create({
      name,
      components: components || [],
      html: html || '',
      userId: req.user.id,
    });
    
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private
exports.updateTemplate = async (req, res, next) => {
  try {
    let template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    // Check ownership
    if (template.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }
    
    template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    // Check ownership
    if (template.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }
    
    await template.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
```

### Controller with Query Parameters

```javascript
// @desc    Get templates with filtering, sorting, pagination
// @route   GET /api/templates?page=1&limit=10&sort=-createdAt&search=email
// @access  Private
exports.getTemplates = async (req, res, next) => {
  try {
    // Build query
    const query = { userId: req.user.id };
    
    // Search
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sort = req.query.sort || '-createdAt';
    
    // Execute query
    const templates = await Template.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Template.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};
```

## Request Validation

### Manual Validation in Controller

```javascript
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, components } = req.body;
    
    // Validation
    const errors = [];
    
    if (!name) {
      errors.push('Name is required');
    } else if (name.length < 3) {
      errors.push('Name must be at least 3 characters');
    } else if (name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
    
    if (!Array.isArray(components)) {
      errors.push('Components must be an array');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }
    
    // Create template
    const template = await Template.create({
      name,
      components,
      userId: req.user.id,
    });
    
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};
```

### Validation Middleware

```javascript
// middleware/validate.js
exports.validateTemplate = (req, res, next) => {
  const { name, components } = req.body;
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (name && name.length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }
  
  if (components && !Array.isArray(components)) {
    errors.push('Components must be an array');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }
  
  next();
};
```

## Error Handling

### Try-Catch in Controllers

```javascript
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    // Handle Mongoose CastError (invalid ObjectId)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    
    // Pass to error handler middleware
    next(error);
  }
};
```

### Async Error Handler Wrapper

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

// Usage in controller
const asyncHandler = require('../utils/asyncHandler');

exports.getTemplates = asyncHandler(async (req, res, next) => {
  // No try-catch needed
  const templates = await Template.find({ userId: req.user.id });
  
  res.status(200).json({
    success: true,
    data: templates,
  });
});
```

## Response Patterns

### Standard Success Response

```javascript
// Single resource
res.status(200).json({
  success: true,
  data: template,
});

// Collection
res.status(200).json({
  success: true,
  count: templates.length,
  data: templates,
});

// Created resource
res.status(201).json({
  success: true,
  data: newTemplate,
});

// Deleted resource
res.status(200).json({
  success: true,
  data: {},
  message: 'Template deleted successfully',
});
```

### Standard Error Response

```javascript
// 400 Bad Request
res.status(400).json({
  success: false,
  error: 'Invalid input',
});

// 401 Unauthorized
res.status(401).json({
  success: false,
  error: 'Not authorized',
});

// 403 Forbidden
res.status(403).json({
  success: false,
  error: 'Access denied',
});

// 404 Not Found
res.status(404).json({
  success: false,
  error: 'Resource not found',
});

// 500 Internal Server Error
res.status(500).json({
  success: false,
  error: 'Server error',
});
```

## Middleware Patterns

### Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  // Extract token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized',
    });
  }
};
```

### Logging Middleware

```javascript
// middleware/logger.js
exports.requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};
```

### Rate Limiting Middleware

```javascript
// Using express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
});

// Apply to routes
app.use('/api/auth', limiter);
```

## File Upload Handling

```javascript
// Using multer
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Route with file upload
router.post('/upload', protect, upload.single('image'), uploadController);

// Controller
exports.uploadController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

---

**Use these Express API patterns to build consistent, robust REST API endpoints.**