# Drag-and-Drop Skill (@dnd-kit)

## Purpose

This skill provides patterns for implementing drag-and-drop functionality using @dnd-kit library in React applications.

## Installation

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Basic Drag-and-Drop Setup

### Simple Draggable and Droppable

```javascript
import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import {
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

// Draggable Component
const Draggable = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

// Droppable Component
const Droppable = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });
  
  const style = {
    backgroundColor: isOver ? '#e0e0e0' : 'transparent',
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

// Main Component
const DragDropExample = () => {
  const [parent, setParent] = useState(null);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over) {
      setParent(over.id);
    }
  };
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Draggable id="draggable">
        Drag me
      </Draggable>
      
      <Droppable id="droppable">
        {parent === 'droppable' ? <Draggable id="draggable">Drag me</Draggable> : 'Drop here'}
      </Droppable>
    </DndContext>
  );
};
```

## Sortable List Pattern

### Basic Sortable List

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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    padding: '16px',
    margin: '8px 0',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

// Sortable List Component
const SortableList = () => {
  const [items, setItems] = useState(['1', '2', '3', '4', '5']);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
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
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => (
          <SortableItem key={id} id={id}>
            Item {id}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};
```

## Email Editor Drag-and-Drop Pattern

### Component Palette (Draggable Source)

```javascript
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';

const PaletteItem = ({ type, icon, label }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type,
      isNew: true,
    },
  });
  
  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        p: 2,
        m: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {icon}
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
};

const ComponentPalette = () => {
  const componentTypes = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ];
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Components
      </Typography>
      {componentTypes.map((item) => (
        <PaletteItem key={item.type} {...item} />
      ))}
    </Box>
  );
};
```

### Editor Canvas (Droppable + Sortable)

```javascript
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';

// Sortable Canvas Item
const CanvasItem = ({ id, component, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        m: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        position: 'relative',
        '&:hover .delete-button': {
          display: 'block',
        },
      }}
    >
      {/* Drag handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          cursor: 'grab',
          position: 'absolute',
          top: 8,
          left: 8,
        }}
      >
        ⋮⋮
      </Box>
      
      {/* Component content */}
      <Box sx={{ ml: 4 }}>
        {renderComponent(component)}
      </Box>
      
      {/* Delete button */}
      <Box
        className="delete-button"
        onClick={() => onRemove(id)}
        sx={{
          display: 'none',
          position: 'absolute',
          top: 8,
          right: 8,
          cursor: 'pointer',
        }}
      >
        ❌
      </Box>
    </Box>
  );
};

// Editor Canvas
const EditorCanvas = () => {
  const [components, setComponents] = useState([]);
  const [activeId, setActiveId] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    // Adding new component from palette
    if (active.data.current?.isNew) {
      const newComponent = {
        id: `component-${Date.now()}`,
        type: active.data.current.type,
        properties: getDefaultProperties(active.data.current.type),
      };
      
      setComponents((prev) => [...prev, newComponent]);
    }
    // Reordering existing components
    else if (active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };
  
  const handleRemove = (id) => {
    setComponents((prev) => prev.filter((item) => item.id !== id));
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          minHeight: 400,
          p: 2,
          border: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
          borderRadius: 1,
        }}
      >
        {components.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
            Drag components here to start building
          </Box>
        ) : (
          <SortableContext
            items={components.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {components.map((component) => (
              <CanvasItem
                key={component.id}
                id={component.id}
                component={component}
                onRemove={handleRemove}
              />
            ))}
          </SortableContext>
        )}
      </Box>
      
      <DragOverlay>
        {activeId ? <Box sx={{ p: 2 }}>Dragging...</Box> : null}
      </DragOverlay>
    </DndContext>
  );
};

// Helper functions
const getDefaultProperties = (type) => {
  const defaults = {
    text: { text: 'Enter text', fontSize: 16, color: '#000000' },
    button: { text: 'Click me', url: '#', backgroundColor: '#007bff' },
    image: { src: '', alt: '', width: '100%' },
    divider: { color: '#cccccc', height: 1 },
  };
  return defaults[type] || {};
};

const renderComponent = (component) => {
  switch (component.type) {
    case 'text':
      return <div style={{ fontSize: component.properties.fontSize }}>{component.properties.text}</div>;
    case 'button':
      return <button style={{ background: component.properties.backgroundColor }}>{component.properties.text}</button>;
    case 'image':
      return <img src={component.properties.src} alt={component.properties.alt} width={component.properties.width} />;
    case 'divider':
      return <hr style={{ borderColor: component.properties.color, height: component.properties.height }} />;
    default:
      return null;
  }
};
```

## Advanced Patterns

### Drag Handle (Only Drag from Specific Area)

```javascript
const { attributes, listeners, setNodeRef } = useSortable({ id });

return (
  <div ref={setNodeRef}>
    {/* Only this part is draggable */}
    <div {...attributes} {...listeners} style={{ cursor: 'grab' }}>
      ⋮⋮ Drag Handle
    </div>
    
    {/* This part is not draggable */}
    <div>
      Content (not draggable)
    </div>
  </div>
);
```

### Drag Constraints

```javascript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Minimum distance before drag starts
      delay: 250, // Delay before drag starts
      tolerance: 5, // Tolerance in pixels
    },
  })
);
```

### Multiple Drop Zones

```javascript
const handleDragEnd = (event) => {
  const { active, over } = event;
  
  if (!over) return;
  
  // Determine which drop zone
  if (over.id === 'canvas') {
    // Add to canvas
    setCanvasItems((prev) => [...prev, active.id]);
  } else if (over.id === 'trash') {
    // Remove item
    setCanvasItems((prev) => prev.filter((id) => id !== active.id));
  }
};
```

### Visual Feedback During Drag

```javascript
const SortableItem = ({ id }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });
  
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        backgroundColor: isOver ? '#e3f2fd' : 'white',
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
      }}
      {...attributes}
      {...listeners}
    >
      Content
    </div>
  );
};
```

---

**Use these @dnd-kit patterns to implement intuitive drag-and-drop interfaces in your React applications.**