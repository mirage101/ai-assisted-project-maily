# Maily - HTML Email Template Builder

## Project Overview

Maily is a full-stack web application that enables users to design and manage HTML email templates through an intuitive drag-and-drop interface. Users can create email-safe HTML templates with live preview, code editing, and export functionality.

## Technology Stack

### Frontend
- **React** (JavaScript, no TypeScript)
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library and styling
- **@emotion/react & @emotion/styled** - CSS-in-JS for Material-UI
- **React Router** - Client-side routing
- **@dnd-kit** - Drag-and-drop functionality
- **@monaco-editor/react** - Code editor with syntax highlighting
- **axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcrypt** - Password hashing
- **jsonwebtoken (JWT)** - Authentication tokens
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **nodemon** - Backend hot reload

## Project Structure

```
Maily/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React Context providers
│   │   ├── utils/         # Helper functions
│   │   ├── theme/         # Material-UI theme configuration
│   │   ├── App.jsx        # Root component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express application
│   ├── routes/           # API route definitions
│   ├── controllers/      # Route handlers/business logic
│   ├── models/           # Mongoose schemas
│   ├── middleware/       # Custom middleware (auth, error handling)
│   ├── config/           # Configuration files (database, etc.)
│   ├── utils/            # Helper functions
│   ├── server.js         # Entry point
│   └── package.json
│
├── .github/
│   ├── agents/           # Specialized agent definitions
│   ├── instructions/     # Domain-specific guidelines
│   ├── skills/           # Reusable skill templates
│   └── prompts/          # Common task prompts
│
├── .agents/
│   └── skills/           # Maily-specific skills
│
├── copilot-instructions.md
├── .gitignore
└── README.md
```

## Code Style Conventions

### Naming Conventions
- **Components**: PascalCase (e.g., `ComponentPalette.jsx`, `TemplateEditor.jsx`)
- **Functions/Variables**: camelCase (e.g., `handleDragEnd`, `userId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `TOKEN_KEY`)
- **Files**: Match component/module name
- **Folders**: lowercase with hyphens (e.g., `drag-drop`, `email-components`)

### Import Organization
```javascript
// 1. React and core libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { Box, Button, TextField } from '@mui/material';
import axios from 'axios';

// 3. Local components
import ComponentPalette from '../components/ComponentPalette';

// 4. Services and utilities
import api from '../services/api';
import { generateEmailHTML } from '../utils/emailGenerator';

// 5. Styles (if separate)
import './styles.css';
```

### Component Structure
```javascript
// Functional component with hooks
const MyComponent = ({ prop1, prop2 = 'default' }) => {
  // 1. Hooks at the top
  const [state, setState] = useState(initialValue);
  const context = useContext(MyContext);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 2. Event handlers and helper functions
  const handleClick = () => {
    // Logic
  };

  // 3. JSX return
  return (
    <Box>
      {/* Component content */}
    </Box>
  );
};

export default MyComponent;
```

### API Response Format
```javascript
// Success
{
  success: true,
  data: { /* response data */ },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: "Error message",
  details: { /* additional error info */ }
}
```

## Email HTML Generation Requirements

### Email-Safe Practices
1. **Inline Styles**: All CSS must be inline (no external stylesheets or `<style>` tags)
2. **Table Layouts**: Use `<table>` elements for layout structure (not `<div>` with flexbox/grid)
3. **Absolute URLs**: All image sources must be absolute URLs
4. **Font Stacks**: Use web-safe font fallbacks
5. **Width Constraints**: Max-width of 600px for email body
6. **No JavaScript**: Remove all JavaScript from generated HTML
7. **Specific tags**: Don`t use <p>, <h1>,<h2>,<h3>,<h4>,<h5>,<h6>, <ul>, <li>, <ol>
### HTML Template Structure
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <!-- Email content here -->
  </table>
</body>
</html>
```

## Authentication Pattern

### JWT Flow
1. **Registration**: User submits email/password → hash password with bcrypt → save to DB → return JWT
2. **Login**: User submits credentials → verify password → generate JWT → return token
3. **Protected Routes**: Extract JWT from `Authorization: Bearer <token>` header → verify → attach user to `req.user`

### User Ownership Model
- Each template belongs to a specific user (via `userId` reference)
- API endpoints verify ownership before allowing read/update/delete operations
- Users can only access their own templates

## Component Types for Email Templates

### Available Components
1. **Text Block**: Paragraph text with styling (font, size, color, alignment)
2. **Heading**: H1-H6 headings with styling options
3. **Button**: CTA button with text, link, colors, padding
4. **Image**: Image with URL, alt text, width, alignment
5. **Divider**: Horizontal rule with color, thickness
6. **Spacer**: Empty space with configurable height
7. **Container**: Wrapper for grouping components with background/padding

### Component Data Structure
```javascript
{
  id: 'unique-id',
  type: 'text' | 'heading' | 'button' | 'image' | 'divider' | 'spacer' | 'container',
  properties: {
    // Type-specific properties
    text: 'Content',
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#ffffff',
    padding: { top: 10, right: 20, bottom: 10, left: 20 },
    alignment: 'left' | 'center' | 'right',
    // ... more properties
  }
}
```

## Environment Variables

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maily
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user info (protected)

### Templates
- `GET /api/templates` - List user's templates (protected)
- `POST /api/templates` - Create new template (protected)
- `GET /api/templates/:id` - Get single template (protected)
- `PUT /api/templates/:id` - Update template (protected)
- `DELETE /api/templates/:id` - Delete template (protected)
- `GET /api/templates/:id/export` - Export template as HTML (protected)

## Development Workflow

### Starting Development
```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

### Before Committing
1. Run linter: `npm run lint`
2. Format code: `npm run format`
3. Test authentication flow
4. Test CRUD operations for templates
5. Verify email HTML output

## Key Features Architecture

### Drag-and-Drop System
- **@dnd-kit/core**: DndContext, sensors, collision detection
- **Component Palette**: Draggable source components
- **Editor Canvas**: Droppable area with sortable list
- **State Management**: Component tree in React state with add/remove/reorder operations

### Live Preview
- **Iframe Rendering**: Isolated preview environment
- **Real-time Updates**: Preview updates on component property changes
- **Responsive Toggle**: Desktop (600px) and mobile (320px) preview modes

### Code Editor
- **Monaco Editor**: VS Code editor component
- **Syntax Highlighting**: HTML/CSS highlighting
- **Two-way Sync**: Visual editor ↔ code editor synchronization
- **Validation**: HTML validation with error indicators

### Template Management
- **Dashboard View**: Grid of template cards with thumbnails
- **Auto-save**: Debounced save every 3 seconds when changes detected
- **Export**: Generate downloadable .html file with complete email template

## Security Considerations

1. **Password Security**: bcrypt with 10+ rounds
2. **JWT Security**: Sign with strong secret, reasonable expiration
3. **Input Validation**: Validate all user input on server
4. **XSS Prevention**: Sanitize HTML content if allowing user HTML input
5. **CORS Configuration**: Allow only trusted origins in production
6. **Rate Limiting**: Protect API endpoints from abuse
7. **Helmet**: Security headers for Express

## Testing Checklist

### Functional Testing
- [ ] User registration and login
- [ ] JWT token storage and refresh
- [ ] Create new template
- [ ] Drag components to canvas
- [ ] Edit component properties
- [ ] Reorder components
- [ ] Delete components
- [ ] Save template
- [ ] Load existing template
- [ ] Export as HTML
- [ ] Switch between visual and code editor
- [ ] Responsive preview toggle

### Email Compatibility Testing
- [ ] Gmail (web and mobile)
- [ ] Outlook (desktop and web)
- [ ] Apple Mail
- [ ] Yahoo Mail
- [ ] Mobile email clients

## Common Patterns

### Protected Route (Frontend)
```javascript
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <CircularProgress />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};
```

### API Call with Auth
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Mongoose Schema
```javascript
const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  components: [{ type: mongoose.Schema.Types.Mixed }],
  html: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

## Accessibility Standards

- Use semantic HTML elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works throughout the app
- Maintain sufficient color contrast (WCAG AA minimum)
- Add alt text for all images
- Support screen readers

## Performance Considerations

- Debounce auto-save operations
- Lazy load Monaco Editor
- Optimize re-renders with React.memo when appropriate
- Use indexes on MongoDB queries (userId, createdAt)
- Compress API responses
- Implement pagination for template list

---

**For specialized assistance, refer to:**
- Frontend Agent: `.github/agents/frontend-agent.md`
- Backend Agent: `.github/agents/backend-agent.md`
- UI/UX Agent: `.github/agents/uiux-agent.md`