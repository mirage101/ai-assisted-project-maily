# Preview Sync Skill

## Purpose

This skill provides patterns for synchronizing the visual editor with the code editor and live preview in Maily. It ensures all three views stay consistent when components are edited.

## Architecture Overview

```
Visual Editor (Component Tree)
        ↕
   EditorContext
        ↕
Code Editor (HTML)  ←→  Live Preview (iframe)
```

## Sync State Management

### PreviewContext

```javascript
// contexts/PreviewContext.js
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useEditor } from './EditorContext';
import { generateEmailHTML } from '../utils/emailGenerator';

const PreviewContext = createContext();

export const PreviewProvider = ({ children }) => {
  const { componentTree, getAllComponents } = useEditor();
  const [htmlCode, setHtmlCode] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [isCodeEditorActive, setIsCodeEditorActive] = useState(false);
  const iframeRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  
  // Generate HTML from component tree
  const syncFromComponents = useCallback(() => {
    const components = getAllComponents();
    const html = generateEmailHTML(components);
    setHtmlCode(html);
    return html;
  }, [getAllComponents]);
  
  // Sync component tree changes to HTML and preview
  useEffect(() => {
    if (!isCodeEditorActive) {
      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Debounce sync to avoid excessive updates
      syncTimeoutRef.current = setTimeout(() => {
        const html = syncFromComponents();
        updatePreview(html);
      }, 300);
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [componentTree, isCodeEditorActive, syncFromComponents]);
  
  // Update preview iframe
  const updatePreview = useCallback((html) => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, []);
  
  // Handle code editor changes
  const handleCodeChange = useCallback((newCode) => {
    setHtmlCode(newCode);
    
    // Update preview immediately
    updatePreview(newCode);
  }, [updatePreview]);
  
  // Toggle preview mode
  const togglePreviewMode = useCallback(() => {
    setPreviewMode((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'));
  }, []);
  
  // Enter code editing mode
  const enterCodeEditMode = useCallback(() => {
    setIsCodeEditorActive(true);
    syncFromComponents(); // Sync current state to code editor
  }, [syncFromComponents]);
  
  // Exit code editing mode
  const exitCodeEditMode = useCallback(() => {
    setIsCodeEditorActive(false);
    // Note: Exiting code mode doesn't sync back to components
    // User must explicitly import/parse HTML if they want that
  }, []);
  
  const value = {
    htmlCode,
    previewMode,
    isCodeEditorActive,
    iframeRef,
    handleCodeChange,
    togglePreviewMode,
    enterCodeEditMode,
    exitCodeEditMode,
    updatePreview,
    syncFromComponents,
  };
  
  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
};

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within PreviewProvider');
  }
  return context;
};
```

## Preview Components

### Live Preview Panel

```javascript
// components/LivePreview.js
import React from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { DesktopWindows, PhoneAndroid } from '@mui/icons-material';
import { usePreview } from '../contexts/PreviewContext';

const LivePreview = () => {
  const { previewMode, togglePreviewMode, iframeRef } = usePreview();
  
  const previewWidth = previewMode === 'desktop' ? '100%' : '375px';
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2">Preview</Typography>
        
        <Box>
          <IconButton
            size="small"
            onClick={togglePreviewMode}
            color={previewMode === 'desktop' ? 'primary' : 'default'}
          >
            <DesktopWindows />
          </IconButton>
          <IconButton
            size="small"
            onClick={togglePreviewMode}
            color={previewMode === 'mobile' ? 'primary' : 'default'}
          >
            <PhoneAndroid />
          </IconButton>
        </Box>
      </Box>
      
      {/* Preview iframe */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            width: previewWidth,
            height: '100%',
            bgcolor: 'white',
            boxShadow: 2,
            transition: 'width 0.3s ease',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Email Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default LivePreview;
```

### Code Editor Panel

```javascript
// components/CodeEditor.js
import React, { useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import Editor from '@monaco-editor/react';
import { usePreview } from '../contexts/PreviewContext';

const CodeEditor = () => {
  const {
    htmlCode,
    isCodeEditorActive,
    handleCodeChange,
    enterCodeEditMode,
    exitCodeEditMode,
    syncFromComponents,
  } = usePreview();
  
  // Sync when entering code mode
  useEffect(() => {
    if (isCodeEditorActive) {
      syncFromComponents();
    }
  }, [isCodeEditorActive, syncFromComponents]);
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2">HTML Code</Typography>
        
        <Box>
          {isCodeEditorActive ? (
            <Button size="small" onClick={exitCodeEditMode}>
              View Only
            </Button>
          ) : (
            <Button size="small" onClick={enterCodeEditMode}>
              Edit Code
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Monaco Editor */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language="html"
          value={htmlCode}
          onChange={isCodeEditorActive ? handleCodeChange : undefined}
          options={{
            readOnly: !isCodeEditorActive,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            theme: 'vs-light',
          }}
        />
      </Box>
      
      {/* Footer info */}
      {isCodeEditorActive && (
        <Box
          sx={{
            p: 1,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'warning.light',
          }}
        >
          <Typography variant="caption" color="warning.dark">
            ⚠️ Manual HTML changes won't sync back to visual editor
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CodeEditor;
```

## Export Functionality

### HTML Export Hook

```javascript
// hooks/useExport.js
import { useCallback } from 'react';
import { usePreview } from '../contexts/PreviewContext';

export const useExport = () => {
  const { htmlCode, syncFromComponents } = usePreview();
  
  /**
   * Export HTML to clipboard
   */
  const copyToClipboard = useCallback(async () => {
    try {
      // Ensure HTML is up to date
      const html = syncFromComponents();
      
      await navigator.clipboard.writeText(html);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, [syncFromComponents]);
  
  /**
   * Download HTML as file
   */
  const downloadHTML = useCallback((filename = 'email-template.html') => {
    // Ensure HTML is up to date
    const html = syncFromComponents();
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [syncFromComponents]);
  
  /**
   * Get current HTML
   */
  const getHTML = useCallback(() => {
    return syncFromComponents();
  }, [syncFromComponents]);
  
  return {
    htmlCode,
    copyToClipboard,
    downloadHTML,
    getHTML,
  };
};
```

### Export Dialog Component

```javascript
// components/ExportDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { ContentCopy, Download } from '@mui/icons-material';
import { useExport } from '../hooks/useExport';

const ExportDialog = ({ open, onClose }) => {
  const { htmlCode, copyToClipboard, downloadHTML } = useExport();
  const [filename, setFilename] = useState('email-template.html');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      setSnackbar({
        open: true,
        message: 'HTML copied to clipboard!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error',
      });
    }
  };
  
  const handleDownload = () => {
    downloadHTML(filename);
    setSnackbar({
      open: true,
      message: 'HTML file downloaded!',
      severity: 'success',
    });
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Export HTML</DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your email template HTML is ready to export. You can copy it to clipboard or download as a file.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              helperText="Enter the filename for download"
            />
          </Box>
          
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto',
            }}
          >
            <Typography
              variant="body2"
              component="pre"
              sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}
            >
              {htmlCode}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button startIcon={<ContentCopy />} onClick={handleCopy}>
            Copy to Clipboard
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleDownload}>
            Download File
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default ExportDialog;
```

## Sync Patterns

### Debounced Sync

```javascript
// utils/syncHelpers.js

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {Number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Usage
const debouncedSync = debounce(() => {
  syncFromComponents();
}, 300);
```

### Throttled Sync

```javascript
/**
 * Create a throttled function
 * @param {Function} func - Function to throttle
 * @param {Number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Usage for live preview updates
const throttledUpdate = throttle((html) => {
  updatePreview(html);
}, 100);
```

## Complete Editor Layout

```javascript
// pages/EditorPage.js
import React from 'react';
import { Box, Grid } from '@mui/material';
import { EditorProvider } from '../contexts/EditorContext';
import { PreviewProvider } from '../contexts/PreviewContext';
import ComponentPalette from '../components/ComponentPalette';
import EditorCanvas from '../components/EditorCanvas';
import PropertiesPanel from '../components/PropertiesPanel';
import LivePreview from '../components/LivePreview';
import CodeEditor from '../components/CodeEditor';

const EditorPage = () => {
  return (
    <EditorProvider>
      <PreviewProvider>
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Top toolbar would go here */}
          
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Grid container spacing={1} sx={{ height: '100%' }}>
              {/* Left: Component Palette */}
              <Grid item xs={2}>
                <ComponentPalette />
              </Grid>
              
              {/* Center: Editor Canvas */}
              <Grid item xs={4}>
                <EditorCanvas />
              </Grid>
              
              {/* Center-Right: Properties Panel */}
              <Grid item xs={2}>
                <PropertiesPanel />
              </Grid>
              
              {/* Right: Preview & Code */}
              <Grid item xs={4}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <LivePreview />
                  </Box>
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <CodeEditor />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </PreviewProvider>
    </EditorProvider>
  );
};

export default EditorPage;
```

---

**Use these patterns to keep visual editor, code editor, and live preview synchronized in Maily.**