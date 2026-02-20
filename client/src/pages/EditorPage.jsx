import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  GetApp,
  AutoAwesome,
  Widgets,
  Preview,
  Tune,
} from '@mui/icons-material';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { EditorProvider, useEditor } from '../contexts/EditorContext';
import ComponentPalette from '../components/ComponentPalette';
import EditorCanvas from '../components/EditorCanvas';
import PropertyPanel from '../components/PropertyPanel';
import { getTemplate, createTemplate, updateTemplate } from '../services/templateService';
import { generateEmailHTML } from '../utils/emailGenerator';

const EditorContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { componentTree, loadTemplate, reorderComponents, addComponent, moveComponent } = useEditor();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [currentTemplateId, setCurrentTemplateId] = useState(id || null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (id) {
      loadExistingTemplate(id);
    }
  }, [id]);

  const loadExistingTemplate = async (templateId) => {
    try {
      setLoading(true);
      const response = await getTemplate(templateId);
      const template = response.data;
      loadTemplate(template.componentTree);
      setTemplateName(template.name);
      setTemplateDescription(template.description);
      setCurrentTemplateId(templateId);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load template',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overId = String(over.id);

    const resolveDropTarget = () => {
      if (overId === 'canvas') {
        return { parentId: 'root' };
      }

      if (overId.startsWith('drop-')) {
        return { parentId: overId.replace('drop-', '') };
      }

      const overComponent = componentTree[over.id];
      if (!overComponent) return { parentId: 'root' };

      const parentId = overComponent.parentId || 'root';
      const parent = componentTree[parentId];
      const index = parent?.children?.indexOf(over.id);

      return {
        parentId,
        index: index !== -1 ? index : undefined,
      };
    };

    const target = resolveDropTarget();

    // Adding new component from palette
    if (activeData?.isNew) {
      addComponent(activeData.type, target.parentId, target.index);
      return;
    }

    if (active.id === over.id) return;

    const sourceParentId = activeData?.parentId || componentTree[active.id]?.parentId;
    if (!sourceParentId) return;

    const sourceParent = componentTree[sourceParentId];
    const targetParent = componentTree[target.parentId];
    if (!sourceParent || !targetParent) return;

    const oldIndex = sourceParent.children.indexOf(active.id);
    if (oldIndex === -1) return;

    if (sourceParentId === target.parentId) {
      const newIndex =
        target.index !== undefined ? target.index : Math.max(targetParent.children.length - 1, 0);

      if (newIndex !== -1 && oldIndex !== newIndex) {
        reorderComponents(sourceParentId, oldIndex, newIndex);
      }
      return;
    }

    moveComponent(active.id, target.parentId, target.index);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a template name',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const templateData = {
        name: templateName,
        description: templateDescription,
        componentTree,
        category: 'other',
        tags: [],
        isPublic: false,
      };

      if (currentTemplateId) {
        await updateTemplate(currentTemplateId, templateData);
        setSnackbar({
          open: true,
          message: 'Template updated successfully',
          severity: 'success',
        });
      } else {
        const response = await createTemplate(templateData);
        setCurrentTemplateId(response.data.id);
        setSnackbar({
          open: true,
          message: 'Template created successfully',
          severity: 'success',
        });
      }

      setSaveDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save template',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportHTML = () => {
    const html = generateEmailHTML(componentTree);

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName || 'email-template'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'HTML downloaded successfully',
      severity: 'success',
    });
  };

  if (loading && id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, ml: 2 }}>
            <AutoAwesome color="primary" fontSize="small" />
            <Typography variant="h6">{templateName || 'New Template'}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Save />}
              onClick={() => setSaveDialogOpen(true)}
              variant="contained"
              size="medium"
              sx={{ fontWeight: 600 }}
            >
              Save
            </Button>
            <Button
              startIcon={<GetApp />}
              onClick={handleExportHTML}
              variant="outlined"
              size="medium"
              sx={{ fontWeight: 600 }}
            >
              Export HTML
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Editor Layout */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Component Palette */}
          <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
            <Box sx={{ px: 2.5, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Widgets fontSize="small" color="primary" />
                Components
              </Typography>
            </Box>
            <ComponentPalette />
          </Box>

          {/* Center: Editor Canvas */}
          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'grey.100', p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Preview fontSize="small" color="primary" />
              Canvas
            </Typography>
            <EditorCanvas />
          </Box>

          {/* Right: Property Panel */}
          <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', overflowY: 'auto' }}>
            <Box sx={{ px: 2.5, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tune fontSize="small" color="primary" />
                Inspector
              </Typography>
            </Box>
            <PropertyPanel />
          </Box>
        </Box>
      </DndContext>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)} size="medium" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="medium"
            sx={{ fontWeight: 600 }}
            disabled={loading || !templateName.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

const EditorPage = () => {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
};

export default EditorPage;
