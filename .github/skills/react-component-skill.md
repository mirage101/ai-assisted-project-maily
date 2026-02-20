# React Component Skill

## Purpose

This skill provides patterns and templates for creating React functional components with hooks in the Maily project.

## Component Template

### Basic Functional Component

```javascript
import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * ComponentName - Brief description of what the component does
 * @param {Object} props - Component props
 * @param {string} props.title - Title to display
 * @param {Function} props.onAction - Callback function
 */
const ComponentName = ({ title, onAction }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {/* Component content */}
    </Box>
  );
};

export default ComponentName;
```

### Component with State

```javascript
import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

const ComponentWithState = ({ initialValue = '' }) => {
  // State declarations
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  
  // Event handlers
  const handleChange = (event) => {
    setValue(event.target.value);
    setError(null);
  };
  
  const handleSubmit = () => {
    if (!value) {
      setError('Value is required');
      return;
    }
    // Process value
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <TextField
        value={value}
        onChange={handleChange}
        error={!!error}
        helperText={error}
        fullWidth
      />
      <Button onClick={handleSubmit} sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default ComponentWithState;
```

### Component with Effects

```javascript
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import api from '../services/api';

const ComponentWithEffects = ({ id }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [id]); // Re-run when id changes
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/data/${id}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <CircularProgress />;
  if (error) return <Box>Error: {error}</Box>;
  if (!data) return null;
  
  return (
    <Box>
      {/* Render data */}
    </Box>
  );
};

export default ComponentWithEffects;
```

### Component with Multiple Hooks

```javascript
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ComplexComponent = ({ data, onSave }) => {
  // Context hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State hooks
  const [items, setItems] = useState(data);
  const [selectedId, setSelectedId] = useState(null);
  
  // Ref hooks
  const inputRef = useRef(null);
  
  // Memoized computations
  const selectedItem = useMemo(() => {
    return items.find(item => item.id === selectedId);
  }, [items, selectedId]);
  
  const totalCount = useMemo(() => {
    return items.length;
  }, [items]);
  
  // Callback hooks (stable function references)
  const handleAdd = useCallback((newItem) => {
    setItems(prev => [...prev, newItem]);
  }, []);
  
  const handleRemove = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // Effects
  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);
  
  useEffect(() => {
    // Auto-save when items change
    const timer = setTimeout(() => {
      onSave(items);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [items, onSave]);
  
  return (
    <Box>
      <input ref={inputRef} />
      <p>Total: {totalCount}</p>
      {/* Component content */}
    </Box>
  );
};

export default ComplexComponent;
```

## Component Patterns

### Container/Presentational Pattern

```javascript
// Presentational Component (UI only)
const TemplateCardView = ({ template, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent>
        <Typography>{template.name}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => onEdit(template.id)}>Edit</Button>
        <Button onClick={() => onDelete(template.id)}>Delete</Button>
      </CardActions>
    </Card>
  );
};

// Container Component (logic)
const TemplateCard = ({ templateId }) => {
  const [template, setTemplate] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadTemplate();
  }, [templateId]);
  
  const loadTemplate = async () => {
    const data = await templateService.getById(templateId);
    setTemplate(data);
  };
  
  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };
  
  const handleDelete = async (id) => {
    await templateService.delete(id);
    // Refresh data
  };
  
  if (!template) return <CircularProgress />;
  
  return (
    <TemplateCardView
      template={template}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};
```

### Compound Component Pattern

```javascript
// Parent component
const Editor = ({ children }) => {
  const [activeTab, setActiveTab] = useState('visual');
  
  return (
    <EditorContext.Provider value={{ activeTab, setActiveTab }}>
      <Box>{children}</Box>
    </EditorContext.Provider>
  );
};

// Child components
Editor.Tabs = ({ children }) => {
  const { activeTab, setActiveTab } = useContext(EditorContext);
  return <Box>{children}</Box>;
};

Editor.Tab = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(EditorContext);
  return (
    <Button
      variant={activeTab === value ? 'contained' : 'text'}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </Button>
  );
};

Editor.Panel = ({ value, children }) => {
  const { activeTab } = useContext(EditorContext);
  if (activeTab !== value) return null;
  return <Box>{children}</Box>;
};

// Usage
<Editor>
  <Editor.Tabs>
    <Editor.Tab value="visual">Visual</Editor.Tab>
    <Editor.Tab value="code">Code</Editor.Tab>
  </Editor.Tabs>
  <Editor.Panel value="visual">
    <VisualEditor />
  </Editor.Panel>
  <Editor.Panel value="code">
    <CodeEditor />
  </Editor.Panel>
</Editor>
```

## Hook Patterns

### Custom Hook Template

```javascript
import { useState, useEffect } from 'react';

/**
 * useCustomHook - Description of what the hook does
 * @param {any} param - Parameter description
 * @returns {Object} Return value description
 */
export const useCustomHook = (param) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, [param]);
  
  const action = () => {
    // Action logic
  };
  
  return { state, loading, error, action };
};
```

### useFetch Hook Example

```javascript
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        
        if (mounted) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [url]);
  
  return { data, loading, error };
};

// Usage
const MyComponent = () => {
  const { data, loading, error } = useFetch('/api/templates');
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return <div>{/* Render data */}</div>;
};
```

## Performance Optimization

### React.memo for Pure Components

```javascript
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  console.log('Rendering ExpensiveComponent');
  
  return (
    <Box>
      {/* Expensive rendering */}
    </Box>
  );
});

// Component only re-renders if props change
```

### useCallback for Stable Function References

```javascript
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  
  // Without useCallback - new function on every render
  const handleClick = () => {
    console.log('Clicked');
  };
  
  // With useCallback - stable function reference
  const handleClickStable = useCallback(() => {
    console.log('Clicked');
  }, []); // Empty deps = never recreates
  
  return <ChildComponent onClick={handleClickStable} />;
};
```

### useMemo for Expensive Computations

```javascript
const ComponentWithExpensiveCalc = ({ items }) => {
  // Without useMemo - recalculates on every render
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  // With useMemo - only recalculates when items change
  const totalMemoized = useMemo(() => {
    console.log('Calculating total');
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  return <Box>Total: {totalMemoized}</Box>;
};
```

## Error Handling

### Error Boundary Component

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
    console.error('Error caught:', error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## Testing Helpers

### Component with Test IDs

```javascript
const TestableComponent = ({ title, onSave }) => {
  return (
    <Box data-testid="testable-component">
      <Typography data-testid="title">{title}</Typography>
      <Button data-testid="save-button" onClick={onSave}>
        Save
      </Button>
    </Box>
  );
};
```

---

**Use these patterns to create consistent, maintainable React components throughout the Maily project.**