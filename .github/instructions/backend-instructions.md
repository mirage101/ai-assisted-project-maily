# Backend Development Instructions

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── templateController.js # Template CRUD operations
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   ├── error.js             # Error handling middleware
│   └── validate.js          # Request validation middleware
├── models/
│   ├── User.js              # User schema
│   └── Template.js          # Template schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── templateRoutes.js    # Template routes
├── utils/
│   ├── generateToken.js     # JWT token generation
│   └── validators.js        # Validation helpers
├── .env.example             # Environment variables template
├── .gitignore
├── server.js                # Entry point
└── package.json
```

## Naming Conventions

### Files and Modules
- **Controllers**: `camelCase + Controller.js` (e.g., `authController.js`)
- **Routes**: `camelCase + Routes.js` (e.g., `templateRoutes.js`)
- **Models**: `PascalCase.js` (e.g., `User.js`, `Template.js`)
- **Middleware**: `camelCase.js` (e.g., `auth.js`, `error.js`)
- **Utilities**: `camelCase.js` (e.g., `validators.js`)

### Variables and Functions
- **Variables**: `camelCase` (e.g., `userId`, `templateData`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `PORT`, `JWT_SECRET`)
- **Functions**: `camelCase` (e.g., `createTemplate`, `validateInput`)
- **Controller functions**: `actionResource` (e.g., `getTemplates`, `createTemplate`)
- **Middleware**: `descriptive name` (e.g., `protect`, `errorHandler`)

### API Endpoints
- **Collection**: `/api/resource` (e.g., `/api/templates`)
- **Single resource**: `/api/resource/:id` (e.g., `/api/templates/:id`)
- **Action**: `/api/resource/:id/action` (e.g., `/api/templates/:id/export`)
- **Version**: `/api/v1/resource` (optional, for future versioning)

## Express Server Setup

### Main Server File

```javascript
// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');

// Import error handler
const errorHandler = require('./middleware/error');

// Initialize app
const app = express();

// ===== MIDDLEWARE =====
// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== ERROR HANDLING =====
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// ===== DATABASE CONNECTION =====
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Start server after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});
```

## Mongoose Schema Patterns

### User Model

```javascript
// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Instance method to exclude password from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

### Template Model

```javascript
// server/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  components: {
    type: [{
      id: String,
      type: String,
      properties: mongoose.Schema.Types.Mixed,
    }],
    default: [],
  },
  html: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster user queries
  },
}, {
  timestamps: true,
});

// Compound index for efficient user-specific queries
templateSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted date
templateSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method - find by user
templateSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Instance method - check ownership
templateSchema.methods.isOwnedBy = function(userId) {
  return this.userId.toString() === userId.toString();
};

module.exports = mongoose.model('Template', templateSchema);
```

## Controller Patterns

### Authentication Controller

```javascript
// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields',
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken',
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }
    
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### Template Controller (CRUD Operations)

```javascript
// server/controllers/templateController.js
const Template = require('../models/Template');

// @desc    Get all templates for logged-in user
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
        error: 'Not authorized to access this template',
      });
    }
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    next(error);
  }
};

// @desc    Create new template
// @route   POST /api/templates
// @access  Private
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, components, html } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Template name is required',
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
        error: 'Not authorized to update this template',
      });
    }
    
    // Update template
    template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
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
        error: 'Not authorized to delete this template',
      });
    }
    
    await template.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Template deleted successfully',
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    next(error);
  }
};

// @desc    Export template as HTML
// @route   GET /api/templates/:id/export
// @access  Private
exports.exportTemplate = async (req, res, next) => {
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
        error: 'Not authorized to export this template',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        name: template.name,
        html: template.html,
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }
    next(error);
  }
};
```

## Middleware Patterns

### Authentication Middleware

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request object
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
      error: 'Not authorized to access this route',
    });
  }
};
```

### Error Handler Middleware

```javascript
// server/middleware/error.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate value for ${field}`,
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

## Route Patterns

### Authentication Routes

```javascript
// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
```

### Template Routes

```javascript
// server/routes/templateRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  exportTemplate,
} = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

// All template routes require authentication
router.use(protect);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

router.get('/:id/export', exportTemplate);

module.exports = router;
```

## Environment Variables

```bash
# server/.env.example
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/maily

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Bcrypt
BCRYPT_ROUNDS=10

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

## Database Configuration

```javascript
// server/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Hash passwords** - Always use bcrypt with 10+ rounds
3. **Validate input** - Check all user input on server
4. **Use HTTPS** - In production, always use HTTPS
5. **Rate limiting** - Implement rate limiting for auth endpoints
6. **Sanitize data** - Remove potentially harmful data
7. **JWT expiration** - Set reasonable token expiration times
8. **Error messages** - Don't reveal sensitive info in errors
9. **CORS** - Configure CORS to allow only trusted origins
10. **Headers** - Use Helmet for security headers

## Testing with API Clients

### Example Requests

```bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Get templates (requires token)
GET http://localhost:5000/api/templates
Authorization: Bearer <your-jwt-token>

# Create template (requires token)
POST http://localhost:5000/api/templates
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "My First Template",
  "components": [],
  "html": ""
}
```

---

**Follow these patterns for consistent, secure, and maintainable backend code.**