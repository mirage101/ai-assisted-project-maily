# Mongoose Schema Skill

## Purpose

This skill provides patterns for defining MongoDB schemas using Mongoose, including validation, relationships, methods, and best practices.

## Basic Schema Pattern

```javascript
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Create index for faster queries
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Template', templateSchema);
```

## Field Types and Validation

### String Fields

```javascript
name: {
  type: String,
  required: [true, 'Name is required'],
  trim: true,                    // Remove whitespace
  lowercase: true,               // Convert to lowercase
  uppercase: true,               // Convert to uppercase
  minlength: [3, 'Too short'],
  maxlength: [100, 'Too long'],
  match: [/regex/, 'Invalid format'],
  enum: ['option1', 'option2'],  // Allowed values
  default: 'default value',
}
```

### Number Fields

```javascript
age: {
  type: Number,
  required: true,
  min: [0, 'Age cannot be negative'],
  max: [120, 'Age cannot exceed 120'],
  default: 0,
}
```

### Boolean Fields

```javascript
isActive: {
  type: Boolean,
  default: true,
}
```

### Date Fields

```javascript
publishedAt: {
  type: Date,
  default: Date.now,
}
```

### Array Fields

```javascript
tags: {
  type: [String],
  default: [],
}

components: [{
  id: String,
  type: String,
  properties: mongoose.Schema.Types.Mixed,
}]
```

### Mixed/Object Fields

```javascript
metadata: {
  type: mongoose.Schema.Types.Mixed,
  default: {},
}
```

### ObjectId References

```javascript
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
}
```

## User Schema Example

```javascript
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
```

## Template Schema Example

```javascript
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
      id: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['text', 'heading', 'button', 'image', 'divider', 'spacer', 'container'],
      },
      properties: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    }],
    default: [],
  },
  html: {
    type: String,
    default: '',
  },
  thumbnail: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for efficient user-specific queries
templateSchema.index({ userId: 1, createdAt: -1 });

// Text index for search
templateSchema.index({ name: 'text' });

module.exports = mongoose.model('Template', templateSchema);
```

## Schema Methods

### Instance Methods

```javascript
// Instance method - called on a document
templateSchema.methods.isOwnedBy = function(userId) {
  return this.userId.toString() === userId.toString();
};

templateSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

templateSchema.methods.toJSON = function() {
  const obj = this.toObject();
  // Remove sensitive fields
  delete obj.__v;
  return obj;
};

// Usage
const template = await Template.findById(id);
if (template.isOwnedBy(userId)) {
  // ...
}
await template.incrementViews();
```

### Static Methods

```javascript
// Static method - called on the model
templateSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

templateSchema.statics.findPublic = function() {
  return this.find({ isPublic: true }).sort({ views: -1 });
};

templateSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
  });
};

// Usage
const userTemplates = await Template.findByUser(userId);
const publicTemplates = await Template.findPublic();
```

### Query Helpers

```javascript
// Query helper - chainable query methods
templateSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

templateSchema.query.public = function() {
  return this.where({ isPublic: true });
};

templateSchema.query.recent = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where({ createdAt: { $gte: date } });
};

// Usage
const recentTemplates = await Template
  .find()
  .byUser(userId)
  .recent(7)
  .sort({ createdAt: -1 });
```

## Schema Middleware (Hooks)

### Pre Hooks

```javascript
// Pre-save hook
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash password
  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-remove hook
templateSchema.pre('remove', async function(next) {
  // Clean up related data
  console.log(`Deleting template: ${this.name}`);
  // Could delete related files, etc.
  next();
});
```

### Post Hooks

```javascript
// Post-save hook
templateSchema.post('save', function(doc) {
  console.log(`Template saved: ${doc.name}`);
});

// Post-find hook
templateSchema.post('find', function(docs) {
  console.log(`Found ${docs.length} templates`);
});
```

## Virtual Fields

```javascript
// Virtual field - computed property not stored in DB
templateSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString();
});

templateSchema.virtual('componentCount').get(function() {
  return this.components.length;
});

// Virtual populate (reference)
templateSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Usage
const template = await Template.findById(id);
console.log(template.createdAtFormatted);
console.log(template.componentCount);

// With populate
const template = await Template.findById(id).populate('author');
console.log(template.author.username);
```

## Population (References)

```javascript
// Simple populate
const template = await Template.findById(id).populate('userId');

// Populate with field selection
const template = await Template.findById(id)
  .populate('userId', 'username email');

// Multiple populates
const template = await Template.findById(id)
  .populate('userId')
  .populate('category');

// Nested populate
const template = await Template.findById(id)
  .populate({
    path: 'userId',
    select: 'username email',
    populate: {
      path: 'profile',
    },
  });
```

## Indexes

```javascript
// Single field index
templateSchema.index({ userId: 1 });

// Compound index
templateSchema.index({ userId: 1, createdAt: -1 });

// Unique index
userSchema.index({ email: 1 }, { unique: true });

// Text index for search
templateSchema.index({ name: 'text', description: 'text' });

// Sparse index (only index documents that have the field)
userSchema.index({ phoneNumber: 1 }, { sparse: true });
```

## Custom Validation

```javascript
// Custom validator function
const validateEmail = function(email) {
  return /^\S+@\S+\.\S+$/.test(email);
};

email: {
  type: String,
  required: true,
  validate: {
    validator: validateEmail,
    message: 'Invalid email format',
  },
}

// Async validator
const checkEmailExists = async function(email) {
  const count = await mongoose.models.User.countDocuments({ email });
  return count === 0;
};

email: {
  type: String,
  required: true,
  validate: {
    validator: checkEmailExists,
    message: 'Email already exists',
  },
}
```

## Schema Options

```javascript
const schema = new mongoose.Schema({
  // Fields
}, {
  timestamps: true,          // Add createdAt, updatedAt
  collection: 'templates',   // Custom collection name
  toJSON: {
    virtuals: true,          // Include virtuals in JSON
    transform: (doc, ret) => {
      delete ret.__v;        // Remove __v field
      delete ret.password;   // Remove sensitive fields
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
});
```

## Query Operations

```javascript
// Find all
const templates = await Template.find();

// Find with conditions
const templates = await Template.find({ userId: userId });

// Find one
const template = await Template.findOne({ name: 'My Template' });

// Find by ID
const template = await Template.findById(id);

// Find with select
const templates = await Template.find().select('name createdAt');

// Find with sort
const templates = await Template.find().sort({ createdAt: -1 });

// Find with limit and skip
const templates = await Template.find().skip(10).limit(10);

// Find with lean (plain JS object, not mongoose document)
const templates = await Template.find().lean();

// Count
const count = await Template.countDocuments({ userId });

// Create
const template = await Template.create({ name: 'New', userId });

// Update one
const template = await Template.findByIdAndUpdate(
  id,
  { name: 'Updated' },
  { new: true, runValidators: true }
);

// Update many
await Template.updateMany(
  { userId },
  { $set: { isPublic: false } }
);

// Delete one
await Template.findByIdAndDelete(id);

// Delete many
await Template.deleteMany({ userId });
```

## Advanced Queries

```javascript
// Comparison operators
Template.find({ views: { $gt: 100 } });         // Greater than
Template.find({ views: { $gte: 100 } });        // Greater than or equal
Template.find({ views: { $lt: 100 } });         // Less than
Template.find({ views: { $lte: 100 } });        // Less than or equal
Template.find({ views: { $ne: 0 } });           // Not equal

// Logical operators
Template.find({
  $or: [
    { isPublic: true },
    { userId: userId },
  ],
});

Template.find({
  $and: [
    { isPublic: true },
    { views: { $gt: 100 } },
  ],
});

// Element operators
Template.find({ tags: { $exists: true } });
Template.find({ components: { $size: 5 } });

// Array operators
Template.find({ tags: 'email' });                // Contains
Template.find({ tags: { $in: ['email', 'newsletter'] } });
Template.find({ tags: { $all: ['email', 'newsletter'] } });

// Regular expressions
Template.find({ name: /^Email/i });              // Starts with
Template.find({ name: { $regex: 'template', $options: 'i' } });
```

---

**Use these Mongoose schema patterns for robust data modeling and efficient database operations.**