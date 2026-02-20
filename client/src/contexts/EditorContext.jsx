import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getDefaultProperties, canHaveChildren, generateComponentId } from '../utils/componentDefaults';

const EditorContext = createContext();

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};

const initialState = {
  componentTree: {
    root: {
      id: 'root',
      type: 'root',
      properties: getDefaultProperties('root'),
      children: [],
    },
  },
  selectedComponentId: null,
};

const ACTIONS = {
  ADD_COMPONENT: 'ADD_COMPONENT',
  REMOVE_COMPONENT: 'REMOVE_COMPONENT',
  UPDATE_COMPONENT: 'UPDATE_COMPONENT',
  REORDER_COMPONENTS: 'REORDER_COMPONENTS',
  MOVE_COMPONENT: 'MOVE_COMPONENT',
  SET_COLUMNS_COUNT: 'SET_COLUMNS_COUNT',
  SELECT_COMPONENT: 'SELECT_COMPONENT',
  LOAD_TEMPLATE: 'LOAD_TEMPLATE',
  RESET: 'RESET',
};

const removeRecursively = (tree, componentId) => {
  const component = tree[componentId];
  if (!component) return;

  if (component.children?.length) {
    component.children.forEach((childId) => removeRecursively(tree, childId));
  }

  delete tree[componentId];
};

const normalizeComponentTree = (componentTree) => {
  const rootDefaults = getDefaultProperties('root');

  if (!componentTree || !componentTree.root) {
    return {
      root: {
        id: 'root',
        type: 'root',
        properties: rootDefaults,
        children: [],
      },
    };
  }

  return {
    ...componentTree,
    root: {
      ...componentTree.root,
      id: 'root',
      type: 'root',
      properties: {
        ...rootDefaults,
        ...(componentTree.root.properties || {}),
      },
      children: Array.isArray(componentTree.root.children) ? componentTree.root.children : [],
    },
  };
};

const editorReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_COMPONENT: {
      const { component, parentId, index } = action.payload;
      const newTree = { ...state.componentTree };

      newTree[component.id] = { ...component, parentId };

      const parent = newTree[parentId];
      const newChildren = [...parent.children];

      if (index !== undefined) {
        newChildren.splice(index, 0, component.id);
      } else {
        newChildren.push(component.id);
      }

      newTree[parentId] = { ...parent, children: newChildren };

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

      const parent = newTree[component.parentId];
      newTree[component.parentId] = {
        ...parent,
        children: parent.children.filter((id) => id !== componentId),
      };

      removeRecursively(newTree, componentId);

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

    case ACTIONS.MOVE_COMPONENT: {
      const { componentId, targetParentId, targetIndex } = action.payload;
      const component = state.componentTree[componentId];
      const sourceParent = component ? state.componentTree[component.parentId] : null;
      const targetParent = state.componentTree[targetParentId];

      if (!component || !sourceParent || !targetParent || !Array.isArray(targetParent.children)) {
        return state;
      }

      const newTree = { ...state.componentTree };

      const sourceChildren = sourceParent.children.filter((id) => id !== componentId);
      const targetChildren = [...targetParent.children];

      if (targetIndex !== undefined && targetIndex >= 0) {
        targetChildren.splice(targetIndex, 0, componentId);
      } else {
        targetChildren.push(componentId);
      }

      newTree[sourceParent.id] = {
        ...sourceParent,
        children: sourceChildren,
      };

      newTree[targetParentId] = {
        ...targetParent,
        children: targetChildren,
      };

      newTree[componentId] = {
        ...component,
        parentId: targetParentId,
      };

      return {
        ...state,
        componentTree: newTree,
      };
    }

    case ACTIONS.SET_COLUMNS_COUNT: {
      const { componentId, count } = action.payload;
      const columnsComponent = state.componentTree[componentId];
      if (!columnsComponent || columnsComponent.type !== 'columns') return state;

      const safeCount = Math.min(4, Math.max(2, Math.floor(count)));
      const currentChildren = Array.isArray(columnsComponent.children) ? columnsComponent.children : [];
      const currentCount = currentChildren.length;

      const newTree = { ...state.componentTree };
      const nextChildren = [...currentChildren];

      if (safeCount > currentCount) {
        const toAdd = safeCount - currentCount;
        for (let i = 0; i < toAdd; i += 1) {
          const newColumnId = generateComponentId();
          newTree[newColumnId] = {
            id: newColumnId,
            type: 'column',
            properties: getDefaultProperties('column'),
            children: [],
            parentId: componentId,
          };
          nextChildren.push(newColumnId);
        }
      } else if (safeCount < currentCount) {
        const removedIds = nextChildren.splice(safeCount);
        removedIds.forEach((id) => removeRecursively(newTree, id));
      }

      newTree[componentId] = {
        ...columnsComponent,
        properties: {
          ...(columnsComponent.properties || {}),
          columns: safeCount,
        },
        children: nextChildren,
      };

      return {
        ...state,
        componentTree: newTree,
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
        componentTree: normalizeComponentTree(action.payload.componentTree),
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

export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const addComponent = useCallback((type, parentId = 'root', index) => {
    if (type === 'columns') {
      const columnsComponentId = generateComponentId();
      const columnsComponent = {
        id: columnsComponentId,
        type: 'columns',
        properties: getDefaultProperties('columns'),
        children: [],
      };

      dispatch({
        type: ACTIONS.ADD_COMPONENT,
        payload: { component: columnsComponent, parentId, index },
      });

      const defaultColumnsCount = columnsComponent.properties.columns || 2;
      for (let i = 0; i < defaultColumnsCount; i += 1) {
        const columnComponent = {
          id: generateComponentId(),
          type: 'column',
          properties: getDefaultProperties('column'),
          children: [],
        };

        dispatch({
          type: ACTIONS.ADD_COMPONENT,
          payload: { component: columnComponent, parentId: columnsComponentId },
        });
      }

      dispatch({
        type: ACTIONS.SELECT_COMPONENT,
        payload: { componentId: columnsComponentId },
      });

      return columnsComponentId;
    }

    const component = {
      id: generateComponentId(),
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

  const moveComponent = useCallback((componentId, targetParentId, targetIndex) => {
    dispatch({
      type: ACTIONS.MOVE_COMPONENT,
      payload: { componentId, targetParentId, targetIndex },
    });
  }, []);

  const setColumnsCount = useCallback((componentId, count) => {
    dispatch({
      type: ACTIONS.SET_COLUMNS_COUNT,
      payload: { componentId, count },
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

  const getComponent = useCallback(
    (componentId) => {
      return state.componentTree[componentId];
    },
    [state.componentTree]
  );

  const getChildren = useCallback(
    (parentId) => {
      const parent = state.componentTree[parentId];
      if (!parent || !parent.children) return [];

      return parent.children.map((id) => state.componentTree[id]);
    },
    [state.componentTree]
  );

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
    moveComponent,
    setColumnsCount,
    selectComponent,
    loadTemplate,
    resetEditor,
    getComponent,
    getChildren,
    getAllComponents,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
