import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, Typography, Paper } from '@mui/material';
import {
  TextFields,
  Title,
  SmartButton,
  Image,
  HorizontalRule,
  SpaceBar,
  ViewColumn,
  Extension,
} from '@mui/icons-material';

const componentTypes = [
  { type: 'text', label: 'Text', icon: <TextFields /> },
  { type: 'heading', label: 'Heading', icon: <Title /> },
  { type: 'button', label: 'Button', icon: <SmartButton /> },
  { type: 'image', label: 'Image', icon: <Image /> },
  { type: 'divider', label: 'Divider', icon: <HorizontalRule /> },
  { type: 'spacer', label: 'Spacer', icon: <SpaceBar /> },
  { type: 'columns', label: 'Columns', icon: <ViewColumn /> },
];

const PaletteItem = ({ type, label, icon }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type,
      isNew: true,
    },
  });

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: 2,
        m: 1,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          bgcolor: 'action.hover',
          elevation: 2,
        },
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="body2">{label}</Typography>
    </Paper>
  );
};

const ComponentPalette = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Extension color="primary" fontSize="small" />
        Drag Components
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drop on canvas or inside columns
      </Typography>
      {componentTypes.map((item) => (
        <PaletteItem key={item.type} {...item} />
      ))}
    </Box>
  );
};

export default ComponentPalette;
