# Mongoose Schema Design Prompt

## Purpose

Use this prompt template to design and generate new Mongoose schemas for the Maily application.

---

## Prompt Template

```
Create a Mongoose schema for [MODEL_NAME] with the following requirements:

**Purpose:**
[Describe what this model represents]

**Fields:**
| Field Name | Type | Required | Default | Validation | Description |
|------------|------|----------|---------|------------|-------------|
| [field1] | [type] | [yes/no] | [value] | [rules] | [description] |
| [field2] | [type] | [yes/no] | [value] | [rules] | [description] |

**Relationships:**
- [field]: References [OtherModel] (one-to-one / one-to-many / many-to-many)

**Indexes:**
- [field1]: [index type] - [reason]
- [field1, field2]: Compound index - [reason]

**Instance Methods:**
- [methodName]([params]): [description of what it does]

**Static Methods:**
- [methodName]([params]): [description of what it does]

**Virtuals:**
- [virtualName]: [description of what it computes]

**Middleware:**
- [pre/post] [hook]: [description of what it does]

**Options:**
- timestamps: [true/false]
- toJSON: [transform options]
- Other schema options

**Business Rules:**
1. [Rule 1]
2. [Rule 2]

**File Location:**
server/models/[ModelName].js

Generate a complete, production-ready Mongoose schema following Maily conventions:
- Use appropriate field types and validators
- Add indexes for frequently queried fields
- Include helpful instance and static methods
- Add JSDoc comments
- Export as ES6 module
- Follow naming conventions (PascalCase for model name)
```

---

## Example Usage

### Example 1: User Schema

```
Create a Mongoose schema for User with the following requirements:

**Purpose:**
Store user account information for authentication and template ownership

**Fields:**
| Field Name | Type | Required | Default | Validation | Description |
|------------|------|----------|---------|------------|-------------|
| name | String | Yes | - | min: 2, max: 50, trim | User's full name |
| email | String | Yes | - | unique, lowercase, trim, valid email | User's email address |
| password | String | Yes | - | min: 6 | Hashed password (bcrypt) |
| avatar | String | No | '' | - | URL to user's avatar image |
| role | String | No | 'user' | enum: ['user', 'admin'] | User role |
| isVerified | Boolean | No | false | - | Email verification status |
| resetPasswordToken | String | No | - | - | Password reset token |
| resetPasswordExpire | Date | No | - | - | Token expiration time |

**Relationships:**
- None (User is referenced by Template)

**Indexes:**
- email: unique index - Fast email lookup for login
- resetPasswordToken: index - Fast token lookup for password reset

**Instance Methods:**
- matchPassword(enteredPassword): Compare entered password with hashed password using bcrypt
- getSignedJwtToken(): Generate and return JWT token for this user

**Static Methods:**
- None

**Virtuals:**
- None

**Middleware:**
- pre('save'): Hash password with bcrypt before saving (only if password is modified)

**Options:**
- timestamps: true
- toJSON: { virtuals: true, transform: remove password from JSON }

**Business Rules:**
1. Password must be hashed before storing
2. Email must be unique and lowercase
3. Password field should not be returned in responses by default
4. JWT token should be signed with user ID

**File Location:**
server/models/User.js

Generate a complete, production-ready Mongoose schema following Maily conventions:
- Use appropriate field types and validators
- Add indexes for frequently queried fields
- Include helpful instance and static methods
- Add JSDoc comments
- Export as ES6 module
- Follow naming conventions (PascalCase for model name)
```

### Example 2: SharedTemplate Schema

```
Create a Mongoose schema for SharedTemplate with the following requirements:

**Purpose:**
Store information about templates shared with other users, allowing collaboration and access control

**Fields:**
| Field Name | Type | Required | Default | Validation | Description |
|------------|------|----------|---------|------------|-------------|
| templateId | ObjectId | Yes | - | ref: 'Template' | Reference to template |
| ownerId | ObjectId | Yes | - | ref: 'User' | Template owner |
| sharedWithId | ObjectId | Yes | - | ref: 'User' | User template is shared with |
| permission | String | Yes | 'view' | enum: ['view', 'edit'] | Access level |
| shareToken | String | No | - | unique | Public share link token |
| shareTokenExpires | Date | No | - | - | Share token expiration |
| message | String | No | '' | max: 500, trim | Message from owner |

**Relationships:**
- templateId: References Template (many-to-one)
- ownerId: References User (many-to-one)
- sharedWithId: References User (many-to-one)

**Indexes:**
- templateId: index - Fast template lookup
- sharedWithId: index - Find all templates shared with user
- shareToken: unique index - Fast public link lookup
- [ownerId, sharedWithId, templateId]: Compound unique index - Prevent duplicate shares

**Instance Methods:**
- isExpired(): Check if share token has expired
- canEdit(): Check if user has edit permission

**Static Methods:**
- findByShareToken(token): Find share by public token if not expired
- getSharedTemplates(userId): Get all templates shared with user

**Virtuals:**
- isActive: Boolean - Whether share is currently active (not expired)

**Middleware:**
- pre('save'): Generate shareToken if not provided

**Options:**
- timestamps: true
- toJSON: { virtuals: true }

**Business Rules:**
1. Cannot share same template with same user multiple times
2. Share token must be unique and secure (use crypto.randomBytes)
3. Expired tokens should not grant access
4. Owner can always edit their templates
5. Default permission is 'view'

**File Location:**
server/models/SharedTemplate.js

Generate a complete, production-ready Mongoose schema following Maily conventions:
- Use appropriate field types and validators
- Add indexes for frequently queried fields
- Include helpful instance and static methods
- Add JSDoc comments
- Export as ES6 module
- Follow naming conventions (PascalCase for model name)
```

---

## Field Type Reference

Common Mongoose field types:

```javascript
{
  // Primitives
  stringField: String,
  numberField: Number,
  booleanField: Boolean,
  dateField: Date,
  
  // Complex types
  arrayField: [String],
  objectField: {
    nestedField1: String,
    nestedField2: Number,
  },
  mixedField: mongoose.Schema.Types.Mixed,
  
  // References
  refField: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModelName',
  },
  
  // With validation
  validatedField: {
    type: String,
    required: [true, 'Error message'],
    unique: true,
    trim: true,
    lowercase: true,
    uppercase: true,
    minlength: [3, 'Too short'],
    maxlength: [100, 'Too long'],
    min: [0, 'Must be positive'],
    max: [100, 'Too large'],
    enum: {
      values: ['option1', 'option2'],
      message: 'Invalid value',
    },
    match: [/regex/, 'Does not match pattern'],
    default: 'default value',
  },
}
```

## Index Type Reference

```javascript
// Single field index
schemaName.index({ field: 1 }); // Ascending
schemaName.index({ field: -1 }); // Descending

// Compound index
schemaName.index({ field1: 1, field2: -1 });

// Unique index
schemaName.index({ email: 1 }, { unique: true });

// Text index (for search)
schemaName.index({ name: 'text', description: 'text' });

// Sparse index (only index documents with field)
schemaName.index({ optionalField: 1 }, { sparse: true });

// TTL index (auto-delete after time)
schemaName.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

---

**Fill in the template sections and provide to an AI agent to generate Mongoose schemas following Maily conventions.**