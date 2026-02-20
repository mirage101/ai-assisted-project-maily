import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Add,
  Logout,
  Dashboard as DashboardIcon,
  AutoAwesome,
  DesignServices,
  Code,
  RocketLaunch,
  ViewQuilt,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Maily
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Box sx={{ mb: 4.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <AutoAwesome color="primary" />
            <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 0 }}>
              Welcome back, {user?.name}!
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Create and manage your email templates
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Create New Template Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                cursor: 'pointer',
                borderRadius: 3,
                p: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => navigate('/editor')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Add sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">Create New Template</Typography>
                <Typography variant="body2" color="text.secondary">
                  Start with a blank canvas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* My Templates Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                cursor: 'pointer',
                borderRadius: 3,
                p: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => navigate('/gallery')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ViewQuilt sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6">My Templates</Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage your templates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Start Section */}
        <Box sx={{ mt: 6.5 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RocketLaunch color="primary" />
            Getting Started
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Add fontSize="small" />
                    1. Create Template
                  </Typography>
                  <Typography variant="body2">
                    Start with a blank template or choose from pre-built components
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DesignServices fontSize="small" />
                    2. Design & Edit
                  </Typography>
                  <Typography variant="body2">
                    Drag-and-drop components, customize styles, and preview in real-time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Code fontSize="small" />
                    3. Export HTML
                  </Typography>
                  <Typography variant="body2">
                    Download email-safe HTML ready to use with your email service
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
