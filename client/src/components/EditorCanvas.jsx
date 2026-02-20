import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { Delete, DragIndicator } from '@mui/icons-material';
import { useEditor } from '../contexts/EditorContext';

const ComponentList = ({ parentId, emptyLabel }) => {
  const { getChildren } = useEditor();
  const children = getChildren(parentId);

  if (children.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 1,
          borderColor: 'divider',
          borderStyle: 'dashed',
          borderRadius: 1,
          color: 'text.secondary',
          px: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption">{emptyLabel}</Typography>
      </Box>
    );
  }

  return (
    <SortableContext items={children.map((child) => child.id)} strategy={verticalListSortingStrategy}>
      {children.map((child) => (
        <CanvasItem key={child.id} component={child} parentId={parentId} />
      ))}
    </SortableContext>
  );
};

const ColumnDropZone = ({ column, columnsGap }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${column.id}`,
    data: {
      parentId: column.id,
    },
  });

  const { selectedComponentId, selectComponent } = useEditor();
  const isSelected = selectedComponentId === column.id;
  const columnProps = column.properties || {};

  return (
    <Box
      ref={setNodeRef}
      onClick={(event) => {
        event.stopPropagation();
        selectComponent(column.id);
      }}
      sx={{
        flex: 1,
        minWidth: 0,
        p: `${columnProps.padding?.top ?? 10}px ${columnProps.padding?.right ?? 10}px ${columnProps.padding?.bottom ?? 10}px ${columnProps.padding?.left ?? 10}px`,
        backgroundColor: columnProps.backgroundColor || '#ffffff',
        borderRadius: `${columnProps.borderRadius ?? 0}px`,
        border: isSelected ? 2 : 1,
        borderColor: isOver || isSelected ? 'primary.main' : 'divider',
        transition: 'border-color 0.2s ease',
      }}
    >
      <ComponentList parentId={column.id} emptyLabel="Drop components in this column" />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
        column
      </Typography>
    </Box>
  );
};

const ColumnsPreview = ({ component }) => {
  const { getChildren } = useEditor();
  const columns = getChildren(component.id);
  const props = component.properties || {};

  return (
    <Box
      sx={{
        p: `${props.padding?.top ?? 10}px ${props.padding?.right ?? 10}px ${props.padding?.bottom ?? 10}px ${props.padding?.left ?? 10}px`,
        backgroundColor: props.backgroundColor || '#ffffff',
        borderRadius: `${props.borderRadius ?? 0}px`,
      }}
    >
      <Box sx={{ display: 'flex', gap: `${props.gap ?? 16}px` }}>
        {columns.map((column) => (
          <ColumnDropZone key={column.id} column={column} columnsGap={props.gap ?? 16} />
        ))}
      </Box>
    </Box>
  );
};

const CanvasItem = ({ component, parentId }) => {
  const { removeComponent, selectComponent, selectedComponentId } = useEditor();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
    data: {
      parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedComponentId === component.id;

  const renderComponentPreview = () => {
    const props = component.properties || {};

    switch (component.type) {
      case 'text':
        return (
          <Typography
            style={{
              fontSize: props.fontSize,
              color: props.color,
              fontWeight: props.fontWeight,
              textAlign: props.textAlign,
            }}
          >
            {props.text}
          </Typography>
        );

      case 'heading':
        return (
          <Typography
            variant={`h${props.level || 2}`}
            style={{
              fontSize: props.fontSize,
              color: props.color,
              fontWeight: props.fontWeight,
              textAlign: props.textAlign,
            }}
          >
            {props.text}
          </Typography>
        );

      case 'button':
        return (
          <Box sx={{ textAlign: props.textAlign }}>
            <Box
              component="button"
              sx={{
                px: `${props.padding?.left ?? 24}px`,
                py: `${props.padding?.top ?? 12}px`,
                fontSize: props.fontSize,
                color: props.textColor,
                backgroundColor: props.backgroundColor,
                border: 'none',
                borderRadius: `${props.borderRadius}px`,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {props.text}
            </Box>
          </Box>
        );

      case 'image':
        return (
          <Box sx={{ textAlign: props.textAlign }}>
            <img
              src={props.src}
              alt={props.alt}
              style={{
                width: props.fitToContainer === false ? `${props.width || 600}px` : '100%',
                maxWidth: `${props.width || 600}px`,
                height: 'auto',
                display: 'block',
                margin: props.textAlign === 'center' ? '0 auto' : undefined,
              }}
            />
          </Box>
        );

      case 'divider':
        return (
          <Box
            sx={{
              height: props.height,
              backgroundColor: props.color,
              width: props.width,
              my: `${props.margin?.top ?? 20}px`,
            }}
          />
        );

      case 'spacer':
        return (
          <Box
            sx={{
              height: props.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            ⬍ {props.height}px spacer ⬍
          </Box>
        );

      case 'columns':
        return <ColumnsPreview component={component} />;

      default:
        return <Typography>Unknown component</Typography>;
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isSelected ? 4 : 1}
      onClick={(event) => {
        event.stopPropagation();
        selectComponent(component.id);
      }}
      sx={{
        p: 2,
        mb: 1,
        cursor: 'pointer',
        position: 'relative',
        border: 2,
        borderColor: isSelected ? 'primary.main' : 'transparent',
        backgroundColor: isSelected ? 'primary.50' : 'background.paper',
        boxShadow: isSelected ? '0 0 0 2px rgba(25, 118, 210, 0.18)' : undefined,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        '&:hover': {
          bgcolor: 'action.hover',
          '& .component-actions': {
            display: 'flex',
          },
          '& .drag-handle': {
            opacity: 1,
          },
        },
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        className="drag-handle"
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          cursor: 'grab',
          color: 'action.active',
          opacity: 0.4,
          transition: 'opacity 0.2s',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <DragIndicator fontSize="small" />
      </Box>

      <Box
        className="component-actions"
        sx={{
          display: 'none',
          position: 'absolute',
          top: 8,
          right: 8,
          gap: 0.5,
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(component.id);
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ ml: 4 }}>{renderComponentPreview()}</Box>

      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 4,
          right: 8,
          color: 'text.secondary',
        }}
      >
        {component.type}
      </Typography>
    </Paper>
  );
};

const EditorCanvas = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
    data: {
      parentId: 'root',
    },
  });

  const { getChildren, getComponent } = useEditor();
  const rootChildren = getChildren('root');
  const emailMaxWidth = getComponent('root')?.properties?.maxWidth || 600;

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 500,
        width: `${emailMaxWidth}px`,
        maxWidth: '100%',
        mx: 'auto',
        bgcolor: 'white',
        p: 2,
        borderRadius: 1,
        boxShadow: 2,
        border: 2,
        borderColor: isOver ? 'primary.main' : 'transparent',
      }}
    >
      {rootChildren.length === 0 ? (
        <Box
          sx={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 2,
            borderColor: 'divider',
            borderStyle: 'dashed',
            borderRadius: 1,
            color: 'text.secondary',
          }}
        >
          <Typography>Drag components here to start building</Typography>
        </Box>
      ) : (
        <ComponentList parentId="root" emptyLabel="Drop components here" />
      )}
    </Box>
  );
};

export default EditorCanvas;
