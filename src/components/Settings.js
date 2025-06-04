import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '1year',
    twoFactorEnabled: false,
    sessionTimeout: 30,
    exportFormat: 'csv',
  });
  const [backupDialog, setBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSettingChange = (name) => (event) => {
    setSettings({
      ...settings,
      [name]: event.target.checked,
    });
  };

  const handleSelectChange = (name) => (event) => {
    setSettings({
      ...settings,
      [name]: event.target.value,
    });
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('New passwords do not match', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      enqueueSnackbar('Password updated successfully', { variant: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      enqueueSnackbar('Failed to update password', { variant: 'error' });
    }
    setLoading(false);
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/settings/backup', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `budget_backup_${new Date().toISOString()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('Backup created successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error creating backup:', error);
      enqueueSnackbar('Failed to create backup', { variant: 'error' });
    }
    setLoading(false);
    setBackupDialog(false);
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('backup', file);
      try {
        await axios.post('/api/settings/restore', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        enqueueSnackbar('Data restored successfully', { variant: 'success' });
        window.location.reload();
      } catch (error) {
        console.error('Error restoring data:', error);
        enqueueSnackbar('Failed to restore data', { variant: 'error' });
      }
      setLoading(false);
      setRestoreDialog(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/settings/export', {
        params: { format: settings.exportFormat },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `budget_data_${new Date().toISOString()}.${settings.exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('Data exported successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error exporting data:', error);
      enqueueSnackbar('Failed to export data', { variant: 'error' });
    }
    setLoading(false);
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
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>

      {/* Security Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Change Password</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorEnabled}
                  onChange={handleSettingChange('twoFactorEnabled')}
                />
              }
              label="Enable Two-Factor Authentication"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sessionTimeout}
                  onChange={handleSettingChange('sessionTimeout')}
                />
              }
              label="Auto-logout after 30 minutes of inactivity"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Data Management */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Data Management</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Automatic Backups"
                  secondary="Daily backup of your financial data"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoBackup}
                        onChange={handleSettingChange('autoBackup')}
                      />
                    }
                    label=""
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Data Retention"
                  secondary="How long to keep your historical data"
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setBackupDialog(true)}
                  >
                    Backup Now
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Export Data"
                  secondary="Download your data in various formats"
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleExportData}
                  >
                    Export
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Restore Data"
                  secondary="Restore from a previous backup"
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setRestoreDialog(true)}
                  >
                    Restore
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Backup Dialog */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a backup of all your financial data. The backup will be downloaded as a JSON file.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancel</Button>
          <Button onClick={handleBackup} variant="contained">
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)}>
        <DialogTitle>Restore Data</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Select a backup file to restore your data. This will overwrite your current data.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Warning: This action cannot be undone. Make sure to backup your current data first.
          </Alert>
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            style={{ display: 'none' }}
            id="restore-file"
          />
          <label htmlFor="restore-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
            >
              Select Backup File
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 