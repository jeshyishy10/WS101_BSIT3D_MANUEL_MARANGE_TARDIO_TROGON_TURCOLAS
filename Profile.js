import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Button,
  Avatar
} from "@mui/material";
import {
  Person,
  Email,
  Business,
  Badge,
  CalendarToday,
  ArrowBack,
  Edit,
  Save,
  Cancel
} from "@mui/icons-material";
import UserService from "../../services/UserService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [details, setDetails] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    registeredDate: '',
  });

  const [originalDetails, setOriginalDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserDetails();
  }, [userId, token]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await UserService.profile(userId, token);
      console.log("API Response:", response);

      if (response && response.success !== false) {
        const userData = {
          name: response.name || '',
          email: response.email || '',
          department: response.department || 'Not specified',
          role: response.role || 'User',
          registeredDate: response.registeredDate ?
            new Date(response.registeredDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Not available',
        };

        setDetails(userData);
        setOriginalDetails(userData);
        toast.success('Profile loaded successfully');
      } else {
        setError(response?.message || 'Failed to load profile');
        toast.error(response?.message || 'Failed to load profile');
      }
    } catch (error) {
      setError('Failed to fetch user details');
      toast.error('Failed to fetch user details');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDetails({ ...details });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await UserService.updateProfile(userId, editedDetails, token);

      if (response && response.success) {
        setDetails(editedDetails);
        setOriginalDetails(editedDetails);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response?.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDetails({});
  };

  const handleChange = (field, value) => {
    if (isEditing) {
      setEditedDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': '#ff6b6b',
      'Manager': '#4ecdc4',
      'User': '#45b7d1',
      'Staff': '#96ceb4',
      'default': '#618cd2'
    };
    return colors[role] || colors.default;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0a1929',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress sx={{ color: '#618cd2' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a1929',
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="md">
        {/* Header with Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              color: '#618cd2',
              bgcolor: 'rgba(97, 140, 210, 0.1)',
              mr: 2,
              '&:hover': {
                bgcolor: 'rgba(97, 140, 210, 0.2)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #618cd2, #4ecdc4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            User Profile
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(244, 67, 54, 0.2)'
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1a2b3c',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(97, 140, 210, 0.2)',
            position: 'relative'
          }}
        >
          {/* Profile Header */}
          <Box
            sx={{
              bgcolor: 'rgba(97, 140, 210, 0.1)',
              p: 4,
              display: 'flex',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: getRoleColor(details.role),
                fontSize: '2rem',
                fontWeight: 'bold',
                mb: { xs: 2, sm: 0 },
                mr: { sm: 3 }
              }}
            >
              {getInitials(details.name)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                {details.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge sx={{ color: getRoleColor(details.role), mr: 1, fontSize: '1rem' }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: getRoleColor(details.role),
                    fontWeight: 500,
                    px: 2,
                    py: 0.5,
                    bgcolor: 'rgba(97, 140, 210, 0.1)',
                    borderRadius: 2,
                    display: 'inline-block'
                  }}
                >
                  {details.role}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ color: '#a0aec0', mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                  Member since {details.registeredDate}
                </Typography>
              </Box>
            </Box>

            {/* Edit/Save/Cancel Buttons */}
            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  variant="outlined"
                  sx={{
                    color: '#618cd2',
                    borderColor: '#618cd2',
                    '&:hover': {
                      borderColor: '#4ecdc4',
                      bgcolor: 'rgba(97, 140, 210, 0.1)'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: '#4caf50',
                      '&:hover': {
                        bgcolor: '#388e3c'
                      }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    variant="outlined"
                    sx={{
                      color: '#ff6b6b',
                      borderColor: '#ff6b6b',
                      '&:hover': {
                        borderColor: '#ff5252',
                        bgcolor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {/* Profile Details */}
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Name Field */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ color: '#618cd2', mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#a0aec0' }}>
                    Full Name
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={isEditing ? editedDetails.name : details.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(97, 140, 210, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#618cd2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4ecdc4',
                      },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#ffffff',
                    },
                  }}
                />
              </Grid>

              {/* Department Field */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business sx={{ color: '#618cd2', mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#a0aec0' }}>
                    Department
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={isEditing ? editedDetails.department : details.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(97, 140, 210, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#618cd2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4ecdc4',
                      },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#ffffff',
                    },
                  }}
                />
              </Grid>

              {/* Email Field */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ color: '#618cd2', mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#a0aec0' }}>
                    Email Address
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="email"
                  value={isEditing ? editedDetails.email : details.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(97, 140, 210, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#618cd2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4ecdc4',
                      },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#ffffff',
                    },
                  }}
                />
              </Grid>

              {/* Role Field */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Badge sx={{ color: '#618cd2', mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#a0aec0' }}>
                    User Type
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={isEditing ? editedDetails.role : details.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  disabled={!isEditing}
                  select={isEditing}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': {
                        borderColor: 'rgba(97, 140, 210, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#618cd2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4ecdc4',
                      },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#ffffff',
                    },
                  }}
                >
                  {isEditing ? (
                    <>
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </>
                  ) : null}
                </TextField>
              </Grid>

              {/* Registered Date Field */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ color: '#618cd2', mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ color: '#a0aec0' }}>
                    Registered Date
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={details.registeredDate}
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#a0aec0',
                      '& fieldset': {
                        borderColor: 'rgba(97, 140, 210, 0.3)',
                      },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#a0aec0',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Additional Info Section */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#1a2b3c',
            borderRadius: 3,
            p: 3,
            mt: 3,
            border: '1px solid rgba(97, 140, 210, 0.2)'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 24,
                bgcolor: '#618cd2',
                borderRadius: 2,
                mr: 2
              }}
            />
            Profile Information
          </Typography>

          <Typography variant="body2" sx={{ color: '#a0aec0', lineHeight: 1.8 }}>
            This profile displays all the user information stored in our system.
            {isEditing ? ' You are currently in edit mode. Make your changes and click Save to update the profile.' : ' Click the Edit Profile button to modify user details.'}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default UserProfile;