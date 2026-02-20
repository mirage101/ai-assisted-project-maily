# React Component Generation Prompt

## Purpose

Use this prompt template to generate new React components for the Maily application.

---

## Prompt Template

```
Create a React functional component for [COMPONENT_NAME] with the following requirements:

**Purpose:**
[Describe what the component does]

**Props:**
- [propName1]: [type] - [description]
- [propName2]: [type] - [description]

**State:**
- [Describe any local state needed]

**Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Material-UI Components:**
- [List MUI components to use: Box, Button, TextField, etc.]

**Styling Requirements:**
- [Layout requirements]
- [Responsive behavior]
- [Colors/spacing]

**Behavior:**
- [User interactions]
- [Event handlers]
- [Side effects]

**Context/Hooks:**
- [List any contexts or custom hooks to use]

**File Location:**
client/src/components/[COMPONENT_NAME].js

Generate a complete, production-ready component following Maily conventions:
- Use functional components with hooks
- Apply Material-UI styling with sx prop
- Include PropTypes for validation
- Add JSDoc comments
- Handle loading and error states
- Ensure accessibility (ARIA labels)
```

---

## Example Usage

### Example 1: Template Card Component

```
Create a React functional component for TemplateCard with the following requirements:

**Purpose:**
Display a template preview card in the template gallery. Shows thumbnail, name, description, and action buttons.

**Props:**
- template: Object - Template data (id, name, description, thumbnail, createdAt)
- onEdit: Function - Callback when edit button is clicked
- onDelete: Function - Callback when delete button is clicked
- onDuplicate: Function - Callback when duplicate button is clicked

**State:**
- anchorEl: Element - For action menu positioning
- deleteDialogOpen: Boolean - Controls delete confirmation dialog

**Features:**
- Display template thumbnail with fallback image
- Show template name, description, and creation date
- Action menu with Edit, Duplicate, Delete options
- Delete confirmation dialog
- Hover effect with elevated shadow
- Responsive card layout

**Material-UI Components:**
- Card, CardMedia, CardContent, CardActions
- Typography, IconButton, Menu, MenuItem
- Dialog, DialogTitle, DialogContent, DialogActions
- MoreVert icon for menu
- Edit, Delete, FileCopy icons

**Styling Requirements:**
- Max width 320px
- 16:9 aspect ratio for thumbnail
- 8px border radius
- Elevation 2, increase to 4 on hover
- Description truncated to 2 lines

**Behavior:**
- Click on card opens template in editor
- Click on menu icon (3 dots) shows action menu
- Delete shows confirmation dialog before calling onDelete
- Smooth transitions for hover effects

**Context/Hooks:**
- useNavigate from react-router-dom for navigation

**File Location:**
client/src/components/TemplateCard.js

Generate a complete, production-ready component following Maily conventions:
- Use functional components with hooks
- Apply Material-UI styling with sx prop
- Include PropTypes for validation
- Add JSDoc comments
- Handle loading and error states
- Ensure accessibility (ARIA labels)
```

### Example 2: Property Editor Component

```
Create a React functional component for PropertyEditor with the following requirements:

**Purpose:**
Edit properties of the selected component in the email editor. Shows different input fields based on component type.

**Props:**
- componentId: String - ID of component to edit
- componentType: String - Type of component (text, button, image, etc.)

**State:**
- No local state (uses EditorContext)

**Features:**
- Dynamic form fields based on component type
- Real-time property updates
- Color picker for color properties
- Number input with increment/decrement for sizes
- Padding editor with individual controls for top/right/bottom/left
- Text alignment buttons
- Font size slider
- URL input with validation

**Material-UI Components:**
- Box, Paper, Typography, Divider
- TextField, Slider, Select, MenuItem
- ToggleButton, ToggleButtonGroup
- ColorPicker (custom component)
- FormatAlignLeft, FormatAlignCenter, FormatAlignRight icons

**Styling Requirements:**
- Vertical layout with sections
- Each property group separated by divider
- Labels in caption variant
- Compact spacing (8px between fields)
- Sticky header with component type badge

**Behavior:**
- Update component properties in EditorContext on change
- Debounce text input updates (300ms)
- Validate URLs before updating
- Show error messages for invalid inputs
- Display different fields for each component type

**Context/Hooks:**
- useEditor from '../contexts/EditorContext'
- useDebounce custom hook for text inputs

**File Location:**
client/src/components/PropertyEditor.js

Generate a complete, production-ready component following Maily conventions:
- Use functional components with hooks
- Apply Material-UI styling with sx prop
- Include PropTypes for validation
- Add JSDoc comments
- Handle loading and error states
- Ensure accessibility (ARIA labels)
```

---

## Field Types Reference

Use these field patterns when generating property editors:

### Text Input
```javascript
<TextField
  label="Text"
  value={properties.text}
  onChange={(e) => updateProperty('text', e.target.value)}
  fullWidth
  multiline
  rows={3}
/>
```

### Number Input
```javascript
<TextField
  label="Font Size"
  type="number"
  value={properties.fontSize}
  onChange={(e) => updateProperty('fontSize', Number(e.target.value))}
  inputProps={{ min: 8, max: 72 }}
/>
```

### Color Picker
```javascript
<TextField
  label="Color"
  type="color"
  value={properties.color}
  onChange={(e) => updateProperty('color', e.target.value)}
  fullWidth
/>
```

### Select Dropdown
```javascript
<Select
  value={properties.fontWeight}
  onChange={(e) => updateProperty('fontWeight', e.target.value)}
  fullWidth
>
  <MenuItem value="normal">Normal</MenuItem>
  <MenuItem value="bold">Bold</MenuItem>
</Select>
```

### Toggle Button Group
```javascript
<ToggleButtonGroup
  value={properties.textAlign}
  exclusive
  onChange={(e, value) => updateProperty('textAlign', value)}
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
```

### Slider
```javascript
<Slider
  value={properties.fontSize}
  onChange={(e, value) => updateProperty('fontSize', value)}
  min={8}
  max={72}
  valueLabelDisplay="auto"
/>
```

---

**Fill in the template sections and provide to an AI agent to generate React components following Maily conventions.**