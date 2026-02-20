# UI/UX Design Instructions

## Design System

### Color Palette

```javascript
// Primary Colors
primary: {
  main: '#2563eb',    // Blue 600
  light: '#60a5fa',   // Blue 400
  dark: '#1e40af',    // Blue 700
  contrastText: '#ffffff'
}

// Secondary Colors
secondary: {
  main: '#7c3aed',    // Purple 600
  light: '#a78bfa',   // Purple 400
  dark: '#5b21b6',    // Purple 700
  contrastText: '#ffffff'
}

// Functional Colors
error: {
  main: '#dc2626',    // Red 600
  light: '#f87171',   // Red 400
  dark: '#991b1b'     // Red 800
}

success: {
  main: '#16a34a',    // Green 600
  light: '#4ade80',   // Green 400
  dark: '#15803d'     // Green 700
}

warning: {
  main: '#ea580c',    // Orange 600
  light: '#fb923c',   // Orange 400
  dark: '#c2410c'     // Orange 700
}

info: {
  main: '#0891b2',    // Cyan 600
  light: '#22d3ee',   // Cyan 400
  dark: '#0e7490'     // Cyan 700
}

// Neutral Colors
background: {
  default: '#f8fafc', // Slate 50
  paper: '#ffffff'    // White
}

text: {
  primary: '#1e293b',   // Slate 800
  secondary: '#64748b',  // Slate 500
  disabled: '#cbd5e1'    // Slate 300
}

divider: '#e2e8f0'      // Slate 200
```

### Typography Scale

```javascript
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  
  // Headings
  h1: {
    fontSize: '2.5rem',      // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '2rem',        // 32px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.75rem',     // 28px
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: '1.5rem',      // 24px
    fontWeight: 600,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1.25rem',     // 20px
    fontWeight: 600,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1rem',        // 16px
    fontWeight: 600,
    lineHeight: 1.5
  },
  
  // Body text
  body1: {
    fontSize: '1rem',        // 16px
    lineHeight: 1.6
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    lineHeight: 1.5
  },
  
  // Supporting text
  caption: {
    fontSize: '0.75rem',     // 12px
    lineHeight: 1.4,
    color: 'text.secondary'
  },
  overline: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase'
  },
  
  // Buttons
  button: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 600,
    textTransform: 'none',   // Don't uppercase buttons
    letterSpacing: '0.02em'
  }
}
```

### Spacing Scale

Use Material-UI's spacing function based on 8px unit:

```javascript
spacing(n) => n * 8px

// Common spacing values
0.5 → 4px   // Tight spacing
1   → 8px   // Small spacing
1.5 → 12px  // Small-medium spacing
2   → 16px  // Medium spacing
3   → 24px  // Large spacing
4   → 32px  // Extra large spacing
5   → 40px  // Section spacing
6   → 48px  // Major section spacing
8   → 64px  // Page spacing
```

### Breakpoints

```javascript
breakpoints: {
  values: {
    xs: 0,      // Mobile (portrait)
    sm: 600,    // Mobile (landscape) / Small tablet
    md: 960,    // Tablet
    lg: 1280,   // Desktop
    xl: 1920    // Large desktop
  }
}

// Usage in components:
sx={{
  width: {
    xs: '100%',  // Mobile: full width
    sm: '80%',   // Tablet: 80%
    md: '60%',   // Desktop: 60%
  }
}}
```

### Border Radius

```javascript
shape: {
  borderRadius: 8  // Base border radius in px
}

// Usage:
borderRadius: 1  // theme.shape.borderRadius
borderRadius: 2  // theme.shape.borderRadius * 2
borderRadius: '50%'  // Circle
```

### Shadows and Elevation

```javascript
// Material-UI provides elevation levels 0-24
elevation={0}   // No shadow
elevation={1}   // Subtle (cards at rest)
elevation={2}   // Cards on hover
elevation={3}   // Drawers, modals
elevation={4}   // App bar
elevation={8}   // Dialogs
elevation={16}  // Navigation drawer
elevation={24}  // Maximum elevation

// Or use boxShadow directly:
boxShadow: 0  // theme.shadows[0]
boxShadow: 1  // theme.shadows[1]
```

## Component Design Patterns

### Page Layout Structure

```javascript
import { Container, Box, Grid } from '@mui/material';

const PageLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header/AppBar */}
      <AppBar />
      
      {/* Main content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Content */}
        </Grid>
      </Container>
      
      {/* Footer (optional) */}
      <Footer />
    </Box>
  );
};
```

### Card Design

```javascript
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';

const TemplateCard = ({ template, onEdit, onDelete }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 180,
          bgcolor: 'grey.100',
          backgroundImage: `url(${template.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {template.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Updated {formatDate(template.updatedAt)}
        </Typography>
      </CardContent>
      
      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button size="small" onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={onDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};
```

### Form Design

```javascript
import { TextField, Button, Stack } from '@mui/material';

const LoginForm = () => {
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email}
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password}
        />
        
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Stack>
    </Box>
  );
};
```

### Split-Screen Editor Layout

```javascript
import { Box, Grid, Paper } from '@mui/material';

const EditorLayout = () => {
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Left: Component Palette */}
      <Box
        sx={{
          width: 280,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        <ComponentPalette />
      </Box>
      
      {/* Center: Editor Canvas */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <EditorCanvas />
      </Box>
      
      {/* Right: Preview & Properties */}
      <Box
        sx={{
          width: { md: 400, lg: 500 },
          borderLeft: 1,
          borderColor: 'divider',
          overflow: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        <PreviewPane />
        <PropertyPanel />
      </Box>
    </Box>
  );
};
```

## Responsive Design Patterns

### Mobile-First Approach

```javascript
// Start with mobile styles, enhance for larger screens
<Box
  sx={{
    // Mobile (default)
    p: 2,
    fontSize: '0.875rem',
    
    // Tablet and up
    [theme.breakpoints.up('sm')]: {
      p: 3,
      fontSize: '1rem',
    },
    
    // Desktop and up
    [theme.breakpoints.up('md')]: {
      p: 4,
      fontSize: '1.125rem',
    },
  }}
>
```

### Responsive Grid

```javascript
<Grid container spacing={3}>
  {/* Full width on mobile, half on tablet, third on desktop */}
  <Grid item xs={12} sm={6} md={4}>
    <TemplateCard />
  </Grid>
  
  {/* Sidebar: hidden on mobile, 1/4 on tablet+, 1/5 on desktop */}
  <Grid item xs={false} sm={3} md={2}>
    <Sidebar />
  </Grid>
  
  {/* Content: full on mobile, 3/4 on tablet, 4/5 on desktop */}
  <Grid item xs={12} sm={9} md={10}>
    <MainContent />
  </Grid>
</Grid>
```

### Hide/Show at Breakpoints

```javascript
// Hide on mobile, show on tablet+
<Box sx={{ display: { xs: 'none', sm: 'block' } }}>
  Desktop navigation
</Box>

// Show only on mobile
<Box sx={{ display: { xs: 'block', sm: 'none' } }}>
  Mobile menu button
</Box>
```

## Loading States

### Skeleton Loading

```javascript
import { Skeleton, Card, CardContent } from '@mui/material';

const TemplateCardSkeleton = () => {
  return (
    <Card>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton width="40%" />
      </CardContent>
    </Card>
  );
};

// Usage
{loading ? (
  <>
    <TemplateCardSkeleton />
    <TemplateCardSkeleton />
    <TemplateCardSkeleton />
  </>
) : (
  templates.map(t => <TemplateCard key={t.id} template={t} />)
)}
```

### Circular Progress

```javascript
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
      }}
    >
      <CircularProgress />
    </Box>
  );
};
```

### Button Loading State

```javascript
import { Button, CircularProgress } from '@mui/material';

<Button
  variant="contained"
  disabled={loading}
  startIcon={loading ? <CircularProgress size={20} /> : null}
>
  {loading ? 'Saving...' : 'Save Template'}
</Button>
```

## User Feedback Patterns

### Toast Notifications

```javascript
import { Snackbar, Alert } from '@mui/material';

const Notification = ({ open, onClose, severity, message }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Usage
<Notification
  open={showSuccess}
  onClose={() => setShowSuccess(false)}
  severity="success"
  message="Template saved successfully!"
/>
```

### Confirmation Dialog

```javascript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Form Validation Feedback

```javascript
<TextField
  fullWidth
  label="Email"
  value={email}
  onChange={handleChange}
  error={!!errors.email}
  helperText={errors.email || 'Enter your email address'}
  // Success state (custom)
  sx={{
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: isValid ? 'success.main' : undefined,
      },
    },
  }}
/>
```

## Accessibility Guidelines

### Keyboard Navigation

```javascript
// Ensure all interactive elements are keyboard accessible
<Button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click Me
</Button>

// Add visible focus indicators
<Button
  sx={{
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
  }}
>
  Accessible Button
</Button>
```

### ARIA Labels

```javascript
// Icon-only buttons
<IconButton aria-label="Delete template" onClick={handleDelete}>
  <DeleteIcon />
</IconButton>

// Form labels
<TextField
  label="Email"
  inputProps={{
    'aria-label': 'Email address',
    'aria-required': 'true',
    'aria-invalid': !!errors.email,
    'aria-describedby': errors.email ? 'email-error' : undefined,
  }}
/>

// Loading states
<CircularProgress aria-label="Loading templates" />
```

### Color Contrast

```javascript
// Ensure text meets WCAG AA standards (4.5:1 for normal text)
// Good: Dark text on light background
<Typography sx={{ color: 'text.primary', bgcolor: 'background.paper' }}>
  High contrast text
</Typography>

// Good: Light text on dark background
<Typography sx={{ color: '#ffffff', bgcolor: 'primary.main' }}>
  High contrast text
</Typography>

// Bad: Low contrast
// Don't use text.secondary on colored backgrounds without checking contrast
```

### Semantic HTML

```javascript
// Use semantic elements
<Box component="main" role="main">
  <Box component="nav" role="navigation" aria-label="Main navigation">
    <Button>Dashboard</Button>
    <Button>Templates</Button>
  </Box>
  
  <Box component="article">
    <Typography component="h1" variant="h4">
      Page Title
    </Typography>
  </Box>
</Box>

// Form accessibility
<Box component="form" role="form" aria-label="Login form">
  {/* Form fields */}
</Box>
```

## Animation and Transitions

### Hover Effects

```javascript
<Card
  sx={{
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4,
    },
  }}
>
```

### Fade In

```javascript
import { Fade } from '@mui/material';

<Fade in={visible} timeout={500}>
  <Box>Content that fades in</Box>
</Fade>
```

### Slide Transition

```javascript
import { Slide } from '@mui/material';

<Slide direction="up" in={open} mountOnEnter unmountOnExit>
  <Paper>Content that slides in</Paper>
</Slide>
```

## Empty States

```javascript
import { Box, Typography, Button } from '@mui/material';
import { InboxIcon } from '@mui/icons-material';

const EmptyState = ({ onCreateNew }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <InboxIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No templates yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create your first email template to get started
      </Typography>
      <Button variant="contained" size="large" onClick={onCreateNew}>
        Create Template
      </Button>
    </Box>
  );
};
```

## Error States

```javascript
import { Alert, AlertTitle, Button } from '@mui/material';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>Error</AlertTitle>
      {error || 'Something went wrong. Please try again.'}
    </Alert>
  );
};
```

## Mobile Considerations

### Touch Targets

```javascript
// Minimum 44x44px for touch targets
<IconButton
  sx={{
    minWidth: 44,
    minHeight: 44,
  }}
>
  <Icon />
</IconButton>
```

### Mobile Navigation

```javascript
import { Drawer, IconButton } from '@mui/material';
import { MenuIcon } from '@mui/icons-material';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        sx={{ display: { md: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
      >
        <NavigationMenu />
      </Drawer>
    </>
  );
};
```

## Design Checklist

### Before Implementing a Feature
- [ ] Sketch basic layout and user flow
- [ ] Identify reusable components
- [ ] Plan responsive behavior
- [ ] Consider loading and error states
- [ ] Check accessibility requirements

### After Implementation
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify keyboard navigation works
- [ ] Check color contrast ratios
- [ ] Test with screen reader
- [ ] Verify loading states appear
- [ ] Confirm error handling works
- [ ] Check that all images have alt text
- [ ] Validate ARIA labels are present

---

**These patterns ensure a consistent, accessible, and delightful user experience throughout Maily.**