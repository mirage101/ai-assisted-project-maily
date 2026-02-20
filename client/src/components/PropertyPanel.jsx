import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Tune,
  ViewColumn,
  WarningAmber,
} from '@mui/icons-material';
import { useEditor } from '../contexts/EditorContext';

const PropertyPanel = () => {
  const { selectedComponentId, getComponent, updateComponent, setColumnsCount } = useEditor();
  const [localProperties, setLocalProperties] = useState({});
  const rootComponent = getComponent('root');
  const rootProperties = rootComponent?.properties || { maxWidth: 600 };

  const selectedComponent = selectedComponentId ? getComponent(selectedComponentId) : null;

  useEffect(() => {
    if (selectedComponent) {
      setLocalProperties(selectedComponent.properties);
    }
  }, [selectedComponent]);

  const handleTemplateSettingChange = (property, value) => {
    const nextRootProperties = {
      ...rootProperties,
      [property]: value,
    };
    updateComponent('root', { properties: nextRootProperties });
  };

  const handlePropertyChange = (property, value) => {
    const newProperties = { ...localProperties, [property]: value };
    setLocalProperties(newProperties);
    updateComponent(selectedComponentId, { properties: newProperties });
  };

  const handleNestedPropertyChange = (parent, property, value) => {
    const newNested = { ...localProperties[parent], [property]: value };
    handlePropertyChange(parent, newNested);
  };

  const hasContentInRemovedColumns = (columnsComponentId, nextCount) => {
    const columnsComponent = getComponent(columnsComponentId);
    if (!columnsComponent || !Array.isArray(columnsComponent.children)) return false;

    const removedColumnIds = columnsComponent.children.slice(nextCount);
    return removedColumnIds.some((columnId) => {
      const column = getComponent(columnId);
      return Array.isArray(column?.children) && column.children.length > 0;
    });
  };

  const renderTextProperties = () => (
    <>
      <TextField
        fullWidth
        label="Text"
        multiline
        rows={3}
        value={localProperties.text || ''}
        onChange={(e) => handlePropertyChange('text', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Font Size"
        value={localProperties.fontSize || 16}
        onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
        InputProps={{ inputProps: { min: 8, max: 72 } }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="color"
        label="Text Color"
        value={localProperties.color || '#333333'}
        onChange={(e) => handlePropertyChange('color', e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Font Weight</InputLabel>
        <Select
          value={localProperties.fontWeight || 'normal'}
          onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="bold">Bold</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" gutterBottom>
          Text Align
        </Typography>
        <ToggleButtonGroup
          value={localProperties.textAlign || 'left'}
          exclusive
          onChange={(e, value) => value && handlePropertyChange('textAlign', value)}
          fullWidth
        >
          <ToggleButton value="left">
            <FormatAlignLeft />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenter />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRight />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </>
  );

  const renderHeadingProperties = () => (
    <>
      <TextField
        fullWidth
        label="Text"
        value={localProperties.text || ''}
        onChange={(e) => handlePropertyChange('text', e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Heading Level</InputLabel>
        <Select
          value={localProperties.level || 2}
          onChange={(e) => handlePropertyChange('level', e.target.value)}
        >
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <MenuItem key={level} value={level}>
              H{level}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        type="number"
        label="Font Size"
        value={localProperties.fontSize || 28}
        onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
        InputProps={{ inputProps: { min: 12, max: 72 } }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="color"
        label="Text Color"
        value={localProperties.color || '#333333'}
        onChange={(e) => handlePropertyChange('color', e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" gutterBottom>
          Text Align
        </Typography>
        <ToggleButtonGroup
          value={localProperties.textAlign || 'left'}
          exclusive
          onChange={(e, value) => value && handlePropertyChange('textAlign', value)}
          fullWidth
        >
          <ToggleButton value="left">
            <FormatAlignLeft />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenter />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRight />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </>
  );

  const renderButtonProperties = () => (
    <>
      <TextField
        fullWidth
        label="Button Text"
        value={localProperties.text || ''}
        onChange={(e) => handlePropertyChange('text', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Link URL"
        value={localProperties.url || ''}
        onChange={(e) => handlePropertyChange('url', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="color"
        label="Background Color"
        value={localProperties.backgroundColor || '#007bff'}
        onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="color"
        label="Text Color"
        value={localProperties.textColor || '#ffffff'}
        onChange={(e) => handlePropertyChange('textColor', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Border Radius"
        value={localProperties.borderRadius || 4}
        onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value))}
        InputProps={{ inputProps: { min: 0, max: 50 } }}
        sx={{ mb: 2 }}
      />
    </>
  );

  const renderImageProperties = () => (
    <>
      <TextField
        fullWidth
        label="Image URL"
        value={localProperties.src || ''}
        onChange={(e) => handlePropertyChange('src', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Alt Text"
        value={localProperties.alt || ''}
        onChange={(e) => handlePropertyChange('alt', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Width (px)"
        value={localProperties.width || 600}
        onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
        InputProps={{ inputProps: { min: 100, max: 800 } }}
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={localProperties.fitToContainer ?? true}
            onChange={(e) => handlePropertyChange('fitToContainer', e.target.checked)}
          />
        }
        label="Fit to container width"
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        When enabled, image scales to available column/template width.
      </Typography>
      <TextField
        fullWidth
        label="Link URL (optional)"
        value={localProperties.href || ''}
        onChange={(e) => handlePropertyChange('href', e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        fullWidth
        variant="outlined"
        component="label"
        sx={{ mb: 2, fontWeight: 600 }}
      >
        Upload Image from Computer
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                handlePropertyChange('src', reader.result);
              }
            };
            reader.readAsDataURL(file);

            event.target.value = '';
          }}
        />
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Selected image is embedded in the template for export
      </Typography>
    </>
  );

  const renderDividerProperties = () => (
    <>
      <TextField
        fullWidth
        type="color"
        label="Color"
        value={localProperties.color || '#dddddd'}
        onChange={(e) => handlePropertyChange('color', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Height (px)"
        value={localProperties.height || 1}
        onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
        InputProps={{ inputProps: { min: 1, max: 10 } }}
        sx={{ mb: 2 }}
      />
    </>
  );

  const renderSpacerProperties = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" gutterBottom>
        Height: {localProperties.height || 20}px
      </Typography>
      <Slider
        value={localProperties.height || 20}
        onChange={(e, value) => handlePropertyChange('height', value)}
        min={10}
        max={100}
        valueLabelDisplay="auto"
      />
    </Box>
  );

  const renderColumnsProperties = () => (
    <>
      <TextField
        fullWidth
        type="number"
        label="Column Count"
        value={localProperties.columns || 2}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (Number.isNaN(value)) {
            return;
          }

          const boundedValue = Math.min(4, Math.max(2, value));
          const currentCount = localProperties.columns || 2;

          if (boundedValue < currentCount && hasContentInRemovedColumns(selectedComponentId, boundedValue)) {
            const confirmed = window.confirm(
              'Reducing column count will remove content in the extra columns. Do you want to continue?'
            );
            if (!confirmed) {
              return;
            }
          }

          handlePropertyChange('columns', boundedValue);
          setColumnsCount(selectedComponentId, boundedValue);
        }}
        InputProps={{ inputProps: { min: 2, max: 4 } }}
        sx={{ mb: 2 }}
      />
      <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.5 }}>
        <WarningAmber fontSize="inherit" />
        Lowering count can remove content from deleted columns
      </Typography>
      <TextField
        fullWidth
        type="number"
        label="Column Gap (px)"
        value={localProperties.gap || 16}
        onChange={(e) => handlePropertyChange('gap', Number(e.target.value))}
        InputProps={{ inputProps: { min: 0, max: 60 } }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="color"
        label="Background Color"
        value={localProperties.backgroundColor || '#ffffff'}
        onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Border Radius"
        value={localProperties.borderRadius || 0}
        onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value))}
        InputProps={{ inputProps: { min: 0, max: 50 } }}
        sx={{ mb: 2 }}
      />
    </>
  );

  const renderColumnProperties = () => (
    <>
      <TextField
        fullWidth
        type="color"
        label="Background Color"
        value={localProperties.backgroundColor || '#ffffff'}
        onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        type="number"
        label="Border Radius"
        value={localProperties.borderRadius || 0}
        onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value))}
        InputProps={{ inputProps: { min: 0, max: 50 } }}
        sx={{ mb: 2 }}
      />
    </>
  );

  const renderProperties = () => {
    switch (selectedComponent.type) {
      case 'text':
        return renderTextProperties();
      case 'heading':
        return renderHeadingProperties();
      case 'button':
        return renderButtonProperties();
      case 'image':
        return renderImageProperties();
      case 'divider':
        return renderDividerProperties();
      case 'spacer':
        return renderSpacerProperties();
      case 'columns':
        return renderColumnsProperties();
      case 'column':
        return renderColumnProperties();
      default:
        return <Typography>No properties available</Typography>;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tune fontSize="small" />
        Template Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField
        fullWidth
        type="number"
        label="Email Max Width (px)"
        value={rootProperties.maxWidth || 600}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (!Number.isNaN(value)) {
            const bounded = Math.min(1200, Math.max(320, value));
            handleTemplateSettingChange('maxWidth', bounded);
          }
        }}
        InputProps={{ inputProps: { min: 320, max: 1200 } }}
        sx={{ mb: 1.5 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
        This controls responsive email container width during preview and export.
      </Typography>

      {selectedComponent ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Tune fontSize="small" />
            Properties
          </Typography>
          <Typography variant="caption" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {(selectedComponent.type === 'columns' || selectedComponent.type === 'column') && (
              <ViewColumn fontSize="inherit" />
            )}
            {selectedComponent.type.toUpperCase()}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {renderProperties()}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a component to edit its individual properties.
        </Typography>
      )}
    </Box>
  );
};

export default PropertyPanel;
