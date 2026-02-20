# Material-UI Styling Skill

## Purpose

This skill provides patterns for styling components using Material-UI's theming system, sx prop, and styled components.

## Styling Methods

### Using sx Prop (Recommended)

```javascript
import { Box, Typography, Button } from '@mui/material';

const StyledComponent = () => {
  return (
    <Box
      sx={{
        // Basic properties
        p: 2,                    // padding: theme.spacing(2)
        m: 1,                    // margin: theme.spacing(1)
        bgcolor: 'primary.main', // theme.palette.primary.main
        color: 'white',
        borderRadius: 1,         // theme.shape.borderRadius
        
        // Responsive values
        width: {
          xs: '100%',           // mobile
          sm: '80%',            // tablet
          md: '60%',            // desktop
        },
        
        // Pseudo-selectors
        '&:hover': {
          bgcolor: 'primary.dark',
          boxShadow: 2,
        },
        
        // Child selectors
        '& .MuiButton-root': {
          textTransform: 'none',
        },
      }}
    >
      Content
    </Box>
  );
};
```

### Theme Access

```javascript
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

const ThemedComponent = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        // Direct theme access in sx
        color: theme.palette.primary.main,
        p: theme.spacing(2),
        
        // Or use string notation (recommended)
        bgcolor: 'primary.light',
        borderColor: 'divider',
      }}
    >
      Themed content
    </Box>
  );
};
```

### Responsive Styling

```javascript
import { Box, useMediaQuery, useTheme } from '@mui/material';

const ResponsiveComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return (
    <Box
      sx={{
        // Object notation for responsive values
        fontSize: {
          xs: '0.875rem',
          sm: '1rem',
          md: '1.125rem',
        },
        
        // Array notation (xs, sm, md, lg, xl)
        p: [1, 2, 3, 4, 5],
        
        // Conditional styling based on breakpoints
        display: {
          xs: 'block',
          md: 'flex',
        },
        
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </Box>
  );
};
```

## Common Styling Patterns

### Card Styling

```javascript
import { Card, CardContent } from '@mui/material';

const StyledCard = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
        
        // Gradient background
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        
        // Border and shadow
        border: 1,
        borderColor: 'divider',
        boxShadow: 2,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        Content
      </CardContent>
    </Card>
  );
};
```

### Button Variants

```javascript
import { Button, IconButton } from '@mui/material';
import { DeleteIcon } from '@mui/icons-material';

const ButtonExamples = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Primary button */}
      <Button
        variant="contained"
        sx={{
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        Primary
      </Button>
      
      {/* Secondary button */}
      <Button
        variant="outlined"
        sx={{
          borderColor: 'secondary.main',
          color: 'secondary.main',
          '&:hover': {
            borderColor: 'secondary.dark',
            bgcolor: 'secondary.light',
          },
        }}
      >
        Secondary
      </Button>
      
      {/* Icon button */}
      <IconButton
        sx={{
          color: 'error.main',
          '&:hover': {
            bgcolor: 'error.light',
          },
        }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};
```

### Form Styling

```javascript
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const StyledForm = () => {
  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': {
          mb: 2,
        },
        '& .MuiButton-root': {
          mt: 2,
        },
      }}
    >
      <TextField
        fullWidth
        label="Name"
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
          },
        }}
      />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select</InputLabel>
        <Select label="Select">
          <MenuItem value="1">Option 1</MenuItem>
          <MenuItem value="2">Option 2</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
```

### Layout Patterns

```javascript
import { Box, Container, Grid, Stack } from '@mui/material';

// Centered container
const CenteredLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="sm">
        Content
      </Container>
    </Box>
  );
};

// Grid layout
const GridLayout = () => {
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          Item 1
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          Item 2
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          Item 3
        </Grid>
      </Grid>
    </Container>
  );
};

// Stack layout (vertical/horizontal spacing)
const StackLayout = () => {
  return (
    <Stack spacing={2} direction="row" sx={{ p: 2 }}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  );
};

// Split layout
const SplitLayout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 280,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        Sidebar
      </Box>
      
      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        Main content
      </Box>
    </Box>
  );
};
```

## Custom Styling with styled()

```javascript
import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

// Create styled component
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

// With props
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  backgroundColor: isActive ? theme.palette.primary.main : theme.palette.grey[300],
  color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
  
  '&:hover': {
    backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.grey[400],
  },
}));

// Usage
const MyComponent = () => {
  return (
    <>
      <StyledBox>Custom styled box</StyledBox>
      <StyledButton isActive={true}>Active Button</StyledButton>
    </>
  );
};
```

## Theme Customization

```javascript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#7c3aed',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

// Usage
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
};
```

## Color and Typography Shortcuts

```javascript
// Color shortcuts
<Box sx={{
  color: 'primary.main',        // theme.palette.primary.main
  bgcolor: 'secondary.light',   // theme.palette.secondary.light
  borderColor: 'error.main',    // theme.palette.error.main
}}>

// Typography shortcuts
<Typography
  variant="h1"                   // theme.typography.h1
  color="text.primary"           // theme.palette.text.primary
  sx={{
    fontWeight: 'bold',          // 700
    fontWeight: 'medium',        // 500
    fontWeight: 'light',         // 300
  }}
/>

// Spacing shortcuts
<Box sx={{
  p: 2,    // padding: 16px (2 * 8px)
  pt: 3,   // paddingTop: 24px
  px: 2,   // paddingLeft & paddingRight: 16px
  py: 1,   // paddingTop & paddingBottom: 8px
  m: 2,    // margin: 16px
  mt: 1,   // marginTop: 8px
  mx: 'auto', // marginLeft & marginRight: auto
  gap: 2,  // gap: 16px
}}>
```

## Animation and Transitions

```javascript
import { Box, Fade, Slide, Grow, Collapse } from '@mui/material';

// CSS transitions
<Box
  sx={{
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  }}
/>

// Material-UI transitions
<Fade in={visible} timeout={500}>
  <Box>Fades in</Box>
</Fade>

<Slide direction="up" in={open}>
  <Box>Slides up</Box>
</Slide>

<Grow in={visible}>
  <Box>Grows in</Box>
</Grow>

<Collapse in={expanded}>
  <Box>Collapses</Box>
</Collapse>
```

## Common sx Prop Patterns

```javascript
// Flexbox
<Box sx={{
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 2,
}}>

// Grid
<Box sx={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 2,
}}>

// Position
<Box sx={{
  position: 'relative',
  top: 0,
  left: 0,
  zIndex: 10,
}}>

// Overflow
<Box sx={{
  overflow: 'hidden',
  overflowY: 'auto',
  maxHeight: 400,
}}>

// Text
<Typography sx={{
  textAlign: 'center',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}}>

// Border
<Box sx={{
  border: 1,
  borderColor: 'divider',
  borderRadius: 2,
  borderTop: 2,
  borderBottom: 'none',
}}>

// Shadow
<Box sx={{
  boxShadow: 0,  // No shadow
  boxShadow: 1,  // Subtle
  boxShadow: 3,  // Medium
  boxShadow: 8,  // Strong
}}>
```

---

**Use these Material-UI styling patterns for consistent, responsive, and maintainable UI styling.**