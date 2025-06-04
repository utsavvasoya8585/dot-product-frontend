import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  IconButton,
  useTheme,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Goals = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuGoalId, setMenuGoalId] = useState(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    amount: '',
    goal_type: 'save',
    target_date: '',
    category: '',
  });

  useEffect(() => {
    fetchGoals();
    fetchCategories();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('/api/goals/');
      // Handle paginated or non-paginated response
      let data = response.data;
      if (Array.isArray(data)) {
        setGoals(data);
      } else if (Array.isArray(data.results)) {
        setGoals(data.results);
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      enqueueSnackbar('Failed to fetch goals', { variant: 'error' });
      setGoals([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/');
      let data = response.data;
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.results)) {
        setCategories(data.results);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleOpenMenu = (event, goalId) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuGoalId(goalId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuGoalId(null);
  };

  const handleEditClick = (goal) => {
    setSelectedGoal(goal);
    setGoalForm({
      name: goal.name,
      amount: goal.amount,
      goal_type: goal.goal_type,
      target_date: goal.target_date.split('T')[0],
      category: goal.category,
    });
    setEditMode(true);
    setOpen(true);
    handleCloseMenu();
  };

  const handleDeleteClick = async (goalId) => {
    try {
      await axios.delete(`/api/goals/${goalId}/`);
      fetchGoals();
      enqueueSnackbar('Goal deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      enqueueSnackbar('Failed to delete goal', { variant: 'error' });
    }
    handleCloseMenu();
  };

  const handleCreateGoal = async () => {
    try {
      if (editMode) {
        await axios.put(`/api/goals/${selectedGoal.id}/`, goalForm);
        enqueueSnackbar('Goal updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/goals/', goalForm);
        enqueueSnackbar('Goal created successfully', { variant: 'success' });
      }
      setOpen(false);
      setEditMode(false);
      setSelectedGoal(null);
      setGoalForm({
        name: '',
        amount: '',
        goal_type: 'save',
        target_date: '',
        category: '',
      });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      enqueueSnackbar(`Failed to ${editMode ? 'update' : 'create'} goal`, { variant: 'error' });
    }
  };

  const activeGoals = goals.filter(goal => goal.is_active);
  const completedGoals = goals.filter(goal => !goal.is_active);

  const GoalProgress = ({ goal }) => {
    const progress = (goal.current_amount / goal.amount) * 100;
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          color={progress >= 100 ? 'success' : 'primary'}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          ${goal.current_amount} / ${goal.amount} ({progress.toFixed(1)}%)
        </Typography>
      </Box>
    );
  };

  const GoalItem = ({ goal }) => (
    <ListItem
      sx={{
        bgcolor: theme.palette.background.paper,
        mb: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
      }}
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="more"
          onClick={(e) => handleOpenMenu(e, goal.id)}
        >
          <MoreVertIcon />
        </IconButton>
      }
    >
      <ListItemIcon>
        <FlagIcon color={goal.goal_type === 'save' ? 'success' : 'primary'} />
      </ListItemIcon>
      <ListItemText
        primary={goal.name}
        secondary={
          <>
            <Typography component="span" variant="body2" color="text.primary">
              {goal.goal_type === 'save' ? 'Save' : 'Spend'} ${goal.amount} by{' '}
              {new Date(goal.target_date).toLocaleDateString()}
            </Typography>
            <GoalProgress goal={goal} />
          </>
        }
      />
    </ListItem>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditMode(false);
            setSelectedGoal(null);
            setGoalForm({
              name: '',
              amount: '',
              goal_type: 'save',
              target_date: '',
              category: '',
            });
            setOpen(true);
          }}
        >
          New Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Active Goals */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Goals
            </Typography>
            <List>
              {activeGoals.map((goal) => (
                <GoalItem key={goal.id} goal={goal} />
              ))}
              {activeGoals.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No active goals
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Goals Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Goals Overview
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: activeGoals.length },
                    { name: 'Completed', value: completedGoals.length },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Completed Goals */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Completed Goals
            </Typography>
            <List>
              {completedGoals.map((goal) => (
                <GoalItem key={goal.id} goal={goal} />
              ))}
              {completedGoals.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No completed goals
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Goal Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditClick(goals.find(g => g.id === menuGoalId))}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(menuGoalId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Goal Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Goal Name"
            fullWidth
            value={goalForm.name}
            onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={goalForm.amount}
            onChange={(e) => setGoalForm({ ...goalForm, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Goal Type"
            fullWidth
            value={goalForm.goal_type}
            onChange={(e) => setGoalForm({ ...goalForm, goal_type: e.target.value })}
          >
            <MenuItem value="save">Save</MenuItem>
            <MenuItem value="spend">Spend</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Target Date"
            type="date"
            fullWidth
            value={goalForm.target_date}
            onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            select
            label="Category"
            fullWidth
            value={goalForm.category}
            onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
          >
            {(Array.isArray(categories) ? categories : []).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGoal} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Goals; 