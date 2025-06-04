import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      transaction: true,
      goal: true,
      report: true,
    },
    theme: 'light',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currency: user.currency || 'USD',
        language: user.language || 'en',
        timezone: user.timezone || 'UTC',
        notifications: user.notifications || {
          email: true,
          push: true,
          transaction: true,
          goal: true,
          report: true,
        },
        theme: user.theme || 'light',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleNotificationChange = (name) => (event) => {
    setProfileData({
      ...profileData,
      notifications: {
        ...profileData.notifications,
        [name]: event.target.checked,
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put('/api/users/profile', profileData);
      updateUser(response.data);
      setEditMode(false);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        await axios.delete('/api/users/profile');
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
        enqueueSnackbar('Failed to delete account', { variant: 'error' });
      }
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const response = await axios.post('/api/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        updateUser(response.data);
        enqueueSnackbar('Profile picture updated successfully', { variant: 'success' });
      } catch (error) {
        console.error('Error updating avatar:', error);
        enqueueSnackbar('Failed to update profile picture', { variant: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Profile Settings</Typography>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              {editMode && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper',
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCameraIcon />
                </IconButton>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Preferences</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={profileData.currency}
                name="currency"
                onChange={handleInputChange}
                disabled={!editMode}
                label="Currency"
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="JPY">JPY (¥)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={profileData.language}
                name="language"
                onChange={handleInputChange}
                disabled={!editMode}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={profileData.timezone}
                name="timezone"
                onChange={handleInputChange}
                disabled={!editMode}
                label="Timezone"
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="GMT">GMT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Notifications</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.notifications.email}
                  onChange={handleNotificationChange('email')}
                  disabled={!editMode}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.notifications.push}
                  onChange={handleNotificationChange('push')}
                  disabled={!editMode}
                />
              }
              label="Push Notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.notifications.transaction}
                  onChange={handleNotificationChange('transaction')}
                  disabled={!editMode}
                />
              }
              label="Transaction Alerts"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.notifications.goal}
                  onChange={handleNotificationChange('goal')}
                  disabled={!editMode}
                />
              }
              label="Goal Updates"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileData.notifications.report}
                  onChange={handleNotificationChange('report')}
                  disabled={!editMode}
                />
              }
              label="Monthly Reports"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>Danger Zone</Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Deleting your account will permanently remove all your data and cannot be undone.
        </Alert>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          Delete Account
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile; 