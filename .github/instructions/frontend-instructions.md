# Frontend Development Instructions

## Project Structure

```
client/src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── ConfirmDialog.jsx
│   ├── editor/              # Editor-specific components
│   │   ├── ComponentPalette.jsx
│   │   ├── EditorCanvas.jsx
│   │   ├── PropertyPanel.jsx
│   │   ├── PreviewPane.jsx
│   │   └── CodeEditor.jsx
│   ├── template/            # Email component renderers
│   │   ├── TextBlock.jsx
│   │   ├── ButtonBlock.jsx
│   │   ├── ImageBlock.jsx
│   │   └── DividerBlock.jsx
│   └── layout/              # Layout components
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       └── PrivateRoute.jsx
├── pages/                   # Page-level components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   └── Editor.jsx
├── context/                 # React Context providers
│   └── AuthContext.jsx
├── services/                # API integration layer
│   ├── api.js               # Axios instance
│   ├── authService.js       # Auth API calls
│   └── templateService.js   # Template API calls
├── utils/                   # Helper functions
│   ├── emailGenerator.js    # Component tree → HTML
│   ├── validators.js        # Form validation
│   └── constants.js         # Constants
├── theme/                   # Material-UI theme
│   └── theme.js
├── hooks/                   # Custom hooks
│   ├── useDebounce.js
│   └── useAutoSave.js
├── App.jsx                  # Root component with routing
└── main.jsx                 # Entry point
```

## Naming Conventions

### Files and Components
- **React Components**: `PascalCase.jsx` (e.g., `ComponentPalette.jsx`)
- **Utility files**: `camelCase.js` (e.g., `emailGenerator.js`)
- **Services**: `camelCase.js` (e.g., `authService.js`)
- **Contexts**: `PascalCase.jsx` (e.g., `AuthContext.jsx`)
- **Hooks**: `useCamelCase.js` (e.g., `useDebounce.js`)

### Variables and Functions
- **Variables**: `camelCase` (e.g., `userId`, `templateList`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `TOKEN_KEY`)
- **Functions**: `camelCase` (e.g., `handleSubmit`, `generateHTML`)
- **Event handlers**: `handle + Event` (e.g., `handleClick`, `handleDragEnd`)
- **Boolean variables**: Start with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)

## Import Organization

Always organize imports in this order:

```javascript
// 1. React and core libraries
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 2. Third-party libraries
import { Box, Button, TextField, Grid } from '@mui/material';
import { DndContext, closestCenter } from '@dnd-kit/core';

// 3. Local components (internal first, then external scope)
import ComponentPalette from './ComponentPalette';
import PropertyPanel from './PropertyPanel';

// 4. Services and utilities
import api from '../services/api';
import { generateEmailHTML } from '../utils/emailGenerator';

// 5. Context and hooks
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

// 6. Assets/styles (if any)
import './Editor.css';
```

## React Component Patterns

### Functional Component Structure

```javascript
import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';

/**
 * ComponentName - Brief description
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @param {Function} props.onSave - Save handler
 */
const MyComponent = ({ title, onSave, initialData = null }) => {
  // ===== 1. HOOKS =====
  // State hooks
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Context hooks
  const { user } = useAuth();
  
  // Router hooks
  const navigate = useNavigate();
  
  // Custom hooks
  const debouncedData = useDebounce(data, 500);
  
  // Effect hooks
  useEffect(() => {
    // Side effects
    loadData();
  }, []);
  
  useEffect(() => {
    // Effect dependent on debounced data
    if (debouncedData) {
      autoSave();
    }
  }, [debouncedData]);
  
  // ===== 2. HELPER FUNCTIONS =====
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/data');
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ===== 3. EVENT HANDLERS =====
  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (event) => {
    setData(event.target.value);
  };
  
  // ===== 4. CONDITIONAL RENDERS =====
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  // ===== 5. MAIN RENDER =====
  return (
    <Box sx={{ p: 2 }}>
      <h2>{title}</h2>
      <TextField value={data} onChange={handleChange} />
      <Button onClick={handleSave} disabled={loading}>
        Save
      </Button>
    </Box>
  );
};

export default MyComponent;
```

### Custom Hooks Pattern

```javascript
import { useState, useEffect } from 'react';

/**
 * useDebounce - Debounces a value
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage:
// const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

## State Management

### Context API Pattern

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    checkAuth,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Component State Pattern

```javascript
// For email editor component tree
const [components, setComponents] = useState([]);

// Add component
const addComponent = (type, position) => {
  const newComponent = {
    id: Date.now().toString(),
    type,
    properties: getDefaultProperties(type),
  };
  
  const newComponents = [...components];
  newComponents.splice(position, 0, newComponent);
  setComponents(newComponents);
};

// Update component
const updateComponent = (id, properties) => {
  setComponents(prevComponents =>
    prevComponents.map(comp =>
      comp.id === id
        ? { ...comp, properties: { ...comp.properties, ...properties } }
        : comp
    )
  );
};

// Remove component
const removeComponent = (id) => {
  setComponents(prevComponents =>
    prevComponents.filter(comp => comp.id !== id)
  );
};

// Reorder components
const reorderComponents = (startIndex, endIndex) => {
  const result = Array.from(components);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  setComponents(result);
};
```

## API Integration

### Axios Instance Configuration

```javascript
// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Layer Pattern

```javascript
// client/src/services/templateService.js
import api from './api';

export const templateService = {
  // Get all templates
  getAll: async () => {
    const { data } = await api.get('/templates');
    return data;
  },
  
  // Get single template
  getById: async (id) => {
    const { data } = await api.get(`/templates/${id}`);
    return data;
  },
  
  // Create template
  create: async (templateData) => {
    const { data } = await api.post('/templates', templateData);
    return data;
  },
  
  // Update template
  update: async (id, templateData) => {
    const { data } = await api.put(`/templates/${id}`, templateData);
    return data;
  },
  
  // Delete template
  delete: async (id) => {
    const { data } = await api.delete(`/templates/${id}`);
    return data;
  },
  
  // Export template as HTML
  export: async (id) => {
    const { data } = await api.get(`/templates/${id}/export`);
    return data;
  },
};
```

## Routing Patterns

### Router Setup

```javascript
// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './context/AuthContext';
import theme from './theme/theme';
import PrivateRoute from './components/layout/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/editor/:id?"
              element={
                <PrivateRoute>
                  <Editor />
                </PrivateRoute>
              }
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 - Not found */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

### Private Route Component

```javascript
// client/src/components/layout/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;
```

## Material-UI Styling

### Using sx Prop

```javascript
import { Box, Button, Typography } from '@mui/material';

const StyledComponent = () => {
  return (
    <Box
      sx={{
        // Basic styling
        p: 2,                    // padding: theme.spacing(2)
        m: 1,                    // margin: theme.spacing(1)
        bgcolor: 'primary.main', // theme.palette.primary.main
        color: 'white',
        borderRadius: 1,         // theme.shape.borderRadius
        
        // Responsive styling
        width: {
          xs: '100%',           // 0-600px
          sm: '80%',            // 600-960px
          md: '60%',            // 960-1280px
        },
        
        // Pseudo-selectors
        '&:hover': {
          bgcolor: 'primary.dark',
          boxShadow: 2,
        },
        
        // Nested selectors
        '& .MuiButton-root': {
          textTransform: 'none',
        },
      }}
    >
      <Typography variant="h6">Hello World</Typography>
      <Button variant="contained">Click Me</Button>
    </Box>
  );
};
```

### Theme Access

```javascript
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const ResponsiveComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  return (
    <Box>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {!isMobile && !isTablet && <DesktopView />}
    </Box>
  );
};
```

## Drag-and-Drop with @dnd-kit

### Basic Setup

```javascript
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const EditorCanvas = () => {
  const [components, setComponents] = useState([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={components}
        strategy={verticalListSortingStrategy}
      >
        {components.map((component) => (
          <SortableItem key={component.id} id={component.id} component={component} />
        ))}
      </SortableContext>
    </DndContext>
  );
};
```

## Form Handling

### Controlled Form Pattern

```javascript
import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      setError(null);
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        disabled={loading}
        sx={{ mb: 2 }}
      />
      
      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Box>
  );
};
```

## Error Handling

### Error Boundary

```javascript
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>
            Try Again
          </Button>
        </Box>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Performance Optimization

### Memoization

```javascript
import React, { useState, useMemo, useCallback, memo } from 'react';

// Memoize expensive computations
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => /* expensive operation */);
  }, [data]);
  
  return <div>{/* render processedData */}</div>;
};

// Memoize callback functions
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Stable reference
  
  return <ChildComponent onClick={handleClick} />;
};

// Memoize component to prevent unnecessary re-renders
const ChildComponent = memo(({ onClick }) => {
  return <button onClick={onClick}>Click me</button>;
});
```

### Lazy Loading

```javascript
import React, { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load Monaco Editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const CodeEditorPage = () => {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      <MonacoEditor height="600px" language="html" />
    </Suspense>
  );
};
```

## Environment Variables

```javascript
// Access Vite environment variables
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// .env file structure
// VITE_API_BASE_URL=http://localhost:5000/api
// VITE_APP_NAME=Maily
```

## Testing Considerations

```javascript
// Add data-testid for testing
<Button data-testid="save-button" onClick={handleSave}>
  Save
</Button>

// Use aria-labels for accessibility and testing
<IconButton aria-label="Delete template" onClick={handleDelete}>
  <DeleteIcon />
</IconButton>
```

---

**Follow these patterns consistently to maintain code quality and project structure.**