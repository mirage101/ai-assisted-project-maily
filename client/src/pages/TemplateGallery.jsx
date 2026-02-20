import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Collections, AddCircleOutline, Description } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getMyTemplates, deleteTemplate } from '../services/templateService';

const TemplateGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await getMyTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete template');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, ml: 2 }}>
            <Collections />
            <Typography variant="h6" component="div">
              My Templates
            </Typography>
          </Stack>
          <Typography variant="body1">{user?.name}</Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Description color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No templates yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first email template to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              sx={{ py: 1.25, px: 2.25, fontWeight: 600 }}
              onClick={() => navigate('/editor')}
            >
              Create Template
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="h6" color="text.secondary">
                        No Preview
                      </Typography>
                    )}
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom noWrap>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {template.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      sx={{ fontWeight: 600 }}
                      startIcon={<Edit />}
                      onClick={() => handleEdit(template.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      sx={{ fontWeight: 600 }}
                      startIcon={<Delete />}
                      onClick={() => handleDelete(template.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default TemplateGallery;
