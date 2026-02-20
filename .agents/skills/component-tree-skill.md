# Component Tree Management Skill

## Purpose

This skill provides patterns for managing the email template component tree state in the Maily editor. It handles adding, removing, reordering, and updating components in the tree structure.

## Component Tree Structure

```javascript
// Example component tree structure
const componentTree = {
  root: {
    id: 'root',
    type: 'root',
    children: ['comp-1', 'comp-2', 'comp-3'],
  },
  'comp-1': {
    id: 'comp-1',
    type: 'heading',
    parentId: 'root',
    properties: {
      text: 'Welcome',
      level: 1,
      fontSize: 32,
      color: '#333333',
    },
  },
  'comp-2': {
    id: 'comp-2',
    type: 'container',
    parentId: 'root',
    children: ['comp-2-1', 'comp-2-2'],
    properties: {
      backgroundColor: '#f5f5f5',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    },
  },
  'comp-2-1': {
    id: 'comp-2-1',
    type: 'text',
    parentId: 'comp-2',
    properties: {
      text: 'Hello World',
      fontSize: 16,
    },
  },
  'comp-2-2': {
    id: 'comp-2-2',
    type: 'button',
    parentId: 'comp-2',
    properties: {
      text: 'Click me',
      url: 'https://example.com',
    },
  },
  'comp-3': {
    id: 'comp-3',
    type: 'divider',
    parentId: 'root',
    properties: {
      color: '#dddddd',
      height: 1,
    },
  },
};
```

## Context Provider Pattern

### EditorContext

```javascript
// contexts/EditorContext.js
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const EditorContext = createContext();

// Initial state
const initialState = {
  componentTree: {
    root: {
      id: 'root',
      type: 'root',
      children: [],
    },
  },
  selectedComponentId: null,
  history: [],
  historyIndex: -1,
};

// Action types
const ACTIONS = {
  ADD_COMPONENT: 'ADD_COMPONENT',
  REMOVE_COMPONENT: 'REMOVE_COMPONENT',
  UPDATE_COMPONENT: 'UPDATE_COMPONENT',
  REORDER_COMPONENTS: 'REORDER_COMPONENTS',
  SELECT_COMPONENT: 'SELECT_COMPONENT',
  UNDO: 'UNDO',
  REDO: 'REDO',
  LOAD_TEMPLATE: 'LOAD_TEMPLATE',
  RESET: 'RESET',
};

// Reducer
const editorReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_COMPONENT: {
      const { component, parentId, index } = action.payload;
      const newTree = { ...state.componentTree };
      
      // Add component to tree
      newTree[component.id] = {
        ...component,
        parentId,
      };
      
      // Update parent's children array
      const parent = newTree[parentId];
      const newChildren = [...parent.children];
      
      if (index !== undefined) {
        newChildren.splice(index, 0, component.id);
      } else {
        newChildren.push(component.id);
      }
      
      newTree[parentId] = {
        ...parent,
        children: newChildren,
      };
      
      return {
        ...state,
        componentTree: newTree,
        selectedComponentId: component.id,
      };
    }
    
    case ACTIONS.REMOVE_COMPONENT: {
      const { componentId } = action.payload;
      const newTree = { ...state.componentTree };
      const component = newTree[componentId];
      
      if (!component) return state;
      
      // Remove from parent's children
      const parent = newTree[component.parentId];
      newTree[component.parentId] = {
        ...parent,
        children: parent.children.filter((id) => id !== componentId),
      };
      
      // Recursively remove children
      const removeRecursively = (id) => {
        const comp = newTree[id];
        if (comp?.children) {
          comp.children.forEach(removeRecursively);
        }
        delete newTree[id];
      };
      
      removeRecursively(componentId);
      
      return {
        ...state,
        componentTree: newTree,
        selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
      };
    }
    
    case ACTIONS.UPDATE_COMPONENT: {
      const { componentId, updates } = action.payload;
      const component = state.componentTree[componentId];
      
      if (!component) return state;
      
      return {
        ...state,
        componentTree: {
          ...state.componentTree,
          [componentId]: {
            ...component,
            ...updates,
            properties: {
              ...component.properties,
              ...updates.properties,
            },
          },
        },
      };
    }
    
    case ACTIONS.REORDER_COMPONENTS: {
      const { parentId, oldIndex, newIndex } = action.payload;
      const parent = state.componentTree[parentId];
      
      if (!parent || !parent.children) return state;
      
      const newChildren = [...parent.children];
      const [movedId] = newChildren.splice(oldIndex, 1);
      newChildren.splice(newIndex, 0, movedId);
      
      return {
        ...state,
        componentTree: {
          ...state.componentTree,
          [parentId]: {
            ...parent,
            children: newChildren,
          },
        },
      };
    }
    
    case ACTIONS.SELECT_COMPONENT: {
      return {
        ...state,
        selectedComponentId: action.payload.componentId,
      };
    }
    
    case ACTIONS.LOAD_TEMPLATE: {
      return {
        ...state,
        componentTree: action.payload.componentTree,
        selectedComponentId: null,
      };
    }
    
    case ACTIONS.RESET: {
      return initialState;
    }
    
    default:
      return state;
  }
};

// Provider component
export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  
  // Actions
  const addComponent = useCallback((type, parentId = 'root', index) => {
    const component = {
      id: uuidv4(),
      type,
      properties: getDefaultProperties(type),
      children: canHaveChildren(type) ? [] : undefined,
    };
    
    dispatch({
      type: ACTIONS.ADD_COMPONENT,
      payload: { component, parentId, index },
    });
    
    return component.id;
  }, []);
  
  const removeComponent = useCallback((componentId) => {
    dispatch({
      type: ACTIONS.REMOVE_COMPONENT,
      payload: { componentId },
    });
  }, []);
  
  const updateComponent = useCallback((componentId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_COMPONENT,
      payload: { componentId, updates },
    });
  }, []);
  
  const reorderComponents = useCallback((parentId, oldIndex, newIndex) => {
    dispatch({
      type: ACTIONS.REORDER_COMPONENTS,
      payload: { parentId, oldIndex, newIndex },
    });
  }, []);
  
  const selectComponent = useCallback((componentId) => {
    dispatch({
      type: ACTIONS.SELECT_COMPONENT,
      payload: { componentId },
    });
  }, []);
  
  const loadTemplate = useCallback((componentTree) => {
    dispatch({
      type: ACTIONS.LOAD_TEMPLATE,
      payload: { componentTree },
    });
  }, []);
  
  const resetEditor = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
  }, []);
  
  // Selectors
  const getComponent = useCallback((componentId) => {
    return state.componentTree[componentId];
  }, [state.componentTree]);
  
  const getChildren = useCallback((parentId) => {
    const parent = state.componentTree[parentId];
    if (!parent || !parent.children) return [];
    
    return parent.children.map((id) => state.componentTree[id]);
  }, [state.componentTree]);
  
  const getAllComponents = useCallback(() => {
    const components = [];
    
    const traverse = (id) => {
      const component = state.componentTree[id];
      if (!component || component.type === 'root') return;
      
      components.push(component);
      
      if (component.children) {
        component.children.forEach(traverse);
      }
    };
    
    const root = state.componentTree.root;
    if (root?.children) {
      root.children.forEach(traverse);
    }
    
    return components;
  }, [state.componentTree]);
  
  const value = {
    componentTree: state.componentTree,
    selectedComponentId: state.selectedComponentId,
    addComponent,
    removeComponent,
    updateComponent,
    reorderComponents,
    selectComponent,
    loadTemplate,
    resetEditor,
    getComponent,
    getChildren,
    getAllComponents,
  };
  
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

// Hook to use editor context
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};
```

## Helper Functions

### Default Properties

```javascript
// utils/componentDefaults.js

/**
 * Get default properties for a component type
 * @param {String} type - Component type
 * @returns {Object} Default properties
 */
export const getDefaultProperties = (type) => {
  const defaults = {
    text: {
      text: 'Enter your text here',
      fontSize: 16,
      color: '#333333',
      fontWeight: 'normal',
      textAlign: 'left',
      lineHeight: 1.6,
      padding: { top: 10, right: 20, bottom: 10, left: 20 },
    },
    heading: {
      text: 'Heading',
      level: 2,
      fontSize: 28,
      color: '#333333',
      fontWeight: 'bold',
      textAlign: 'left',
      padding: { top: 20, right: 20, bottom: 10, left: 20 },
    },
    button: {
      text: 'Click me',
      url: '#',
      backgroundColor: '#007bff',
      textColor: '#ffffff',
      fontSize: 16,
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
      borderRadius: 4,
      textAlign: 'center',
    },
    image: {
      src: '',
      alt: '',
      width: 600,
      href: null,
      textAlign: 'center',
    },
    divider: {
      color: '#dddddd',
      height: 1,
      width: '100%',
      margin: { top: 20, bottom: 20 },
    },
    spacer: {
      height: 20,
    },
    container: {
      backgroundColor: 'transparent',
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    },
  };
  
  return defaults[type] || {};
};

/**
 * Check if component type can have children
 * @param {String} type - Component type
 * @returns {Boolean}
 */
export const canHaveChildren = (type) => {
  return ['root', 'container'].includes(type);
};
```

### Tree Traversal

```javascript
// utils/treeHelpers.js

/**
 * Find component by ID in tree
 * @param {Object} tree - Component tree
 * @param {String} id - Component ID
 * @returns {Object|null} Component or null
 */
export const findComponent = (tree, id) => {
  return tree[id] || null;
};

/**
 * Get all descendants of a component
 * @param {Object} tree - Component tree
 * @param {String} id - Parent component ID
 * @returns {Array} Array of component IDs
 */
export const getDescendants = (tree, id) => {
  const component = tree[id];
  if (!component || !component.children) return [];
  
  const descendants = [];
  
  const traverse = (compId) => {
    const comp = tree[compId];
    if (!comp) return;
    
    descendants.push(compId);
    
    if (comp.children) {
      comp.children.forEach(traverse);
    }
  };
  
  component.children.forEach(traverse);
  
  return descendants;
};

/**
 * Get ancestors of a component
 * @param {Object} tree - Component tree
 * @param {String} id - Component ID
 * @returns {Array} Array of component IDs from root to parent
 */
export const getAncestors = (tree, id) => {
  const ancestors = [];
  let current = tree[id];
  
  while (current && current.parentId && current.parentId !== 'root') {
    ancestors.unshift(current.parentId);
    current = tree[current.parentId];
  }
  
  return ancestors;
};

/**
 * Clone component with new IDs
 * @param {Object} tree - Component tree
 * @param {String} id - Component ID to clone
 * @returns {Object} New component subtree
 */
export const cloneComponent = (tree, id) => {
  const component = tree[id];
  if (!component) return null;
  
  const newId = uuidv4();
  const cloned = {
    ...component,
    id: newId,
    properties: { ...component.properties },
  };
  
  if (component.children) {
    cloned.children = component.children.map((childId) => {
      const childClone = cloneComponent(tree, childId);
      return childClone.id;
    });
  }
  
  return cloned;
};
```

## Usage Example

```javascript
// components/Editor.js
import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { Box, Button } from '@mui/material';

const Editor = () => {
  const {
    componentTree,
    selectedComponentId,
    addComponent,
    removeComponent,
    updateComponent,
    selectComponent,
    getChildren,
  } = useEditor();
  
  const handleAddText = () => {
    addComponent('text', 'root');
  };
  
  const handleAddButton = () => {
    addComponent('button', 'root');
  };
  
  const handleRemove = (id) => {
    removeComponent(id);
  };
  
  const handleUpdate = (id, property, value) => {
    updateComponent(id, {
      properties: {
        [property]: value,
      },
    });
  };
  
  const rootChildren = getChildren('root');
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button onClick={handleAddText}>Add Text</Button>
        <Button onClick={handleAddButton}>Add Button</Button>
      </Box>
      
      <Box>
        {rootChildren.map((component) => (
          <Box
            key={component.id}
            onClick={() => selectComponent(component.id)}
            sx={{
              p: 2,
              border: selectedComponentId === component.id ? 2 : 1,
              borderColor: selectedComponentId === component.id ? 'primary.main' : 'divider',
              mb: 1,
            }}
          >
            <div>Type: {component.type}</div>
            <Button size="small" onClick={() => handleRemove(component.id)}>
              Remove
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Editor;
```

---

**Use these patterns to manage component tree state in the Maily editor.**