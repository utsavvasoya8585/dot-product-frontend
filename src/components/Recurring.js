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
  IconButton,
  Chip,
  useTheme,
  Menu,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Repeat as RepeatIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format, addMonths, isAfter } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const Recurring = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuTransactionId, setMenuTransactionId] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    category: '',
    is_income: false,
    description: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/recurring-transactions/');
      let data = response.data;
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data.results)) {
        setTransactions(data.results);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      enqueueSnackbar('Failed to fetch recurring transactions', { variant: 'error' });
      setTransactions([]);
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

  const handleOpenMenu = (event, transactionId) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTransactionId(transactionId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuTransactionId(null);
  };

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionForm({
      name: transaction.name,
      amount: transaction.amount,
      frequency: transaction.frequency,
      start_date: transaction.start_date.split('T')[0],
      end_date: transaction.end_date ? transaction.end_date.split('T')[0] : '',
      category: transaction.category,
      is_income: transaction.is_income,
      description: transaction.description || '',
    });
    setEditMode(true);
    setOpen(true);
    handleCloseMenu();
  };

  const handleDeleteClick = async (transactionId) => {
    try {
      await axios.delete(`/api/recurring-transactions/${transactionId}/`);
      fetchTransactions();
      enqueueSnackbar('Recurring transaction deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      enqueueSnackbar('Failed to delete recurring transaction', { variant: 'error' });
    }
    handleCloseMenu();
  };

  const handleSaveTransaction = async () => {
    try {
      if (editMode) {
        await axios.put(`/api/recurring-transactions/${selectedTransaction.id}/`, transactionForm);
        enqueueSnackbar('Recurring transaction updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/recurring-transactions/', transactionForm);
        enqueueSnackbar('Recurring transaction created successfully', { variant: 'success' });
      }
      setOpen(false);
      setEditMode(false);
      setSelectedTransaction(null);
      setTransactionForm({
        name: '',
        amount: '',
        frequency: 'monthly',
        start_date: '',
        end_date: '',
        category: '',
        is_income: false,
        description: '',
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      enqueueSnackbar(`Failed to ${editMode ? 'update' : 'create'} recurring transaction`, { variant: 'error' });
    }
  };

  const getNextOccurrence = (transaction) => {
    const startDate = new Date(transaction.start_date);
    const now = new Date();
    let nextDate = startDate;

    while (isAfter(now, nextDate)) {
      switch (transaction.frequency) {
        case 'daily':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'weekly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'yearly':
          nextDate = addMonths(nextDate, 12);
          break;
        default:
          nextDate = addMonths(nextDate, 1);
      }
    }

    return format(nextDate, 'MMM d, yyyy');
  };

  const TransactionItem = ({ transaction }) => (
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
          onClick={(e) => handleOpenMenu(e, transaction.id)}
        >
          <MoreVertIcon />
        </IconButton>
      }
    >
      <ListItemIcon>
        <MoneyIcon color={transaction.is_income ? 'success' : 'primary'} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {transaction.name}
            <Chip
              size="small"
              label={transaction.frequency}
              color="primary"
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <>
            <Typography component="span" variant="body2" color="text.primary">
              ${transaction.amount} {transaction.is_income ? 'income' : 'expense'}
            </Typography>
            <br />
            <Typography component="span" variant="body2" color="text.secondary">
              Next: {getNextOccurrence(transaction)}
            </Typography>
            {transaction.description && (
              <Typography component="span" variant="body2" color="text.secondary" display="block">
                {transaction.description}
              </Typography>
            )}
          </>
        }
      />
    </ListItem>
  );

  const activeTransactions = (Array.isArray(transactions) ? transactions : []).filter(t => !t.end_date || new Date(t.end_date) > new Date());
  const expiredTransactions = (Array.isArray(transactions) ? transactions : []).filter(t => t.end_date && new Date(t.end_date) <= new Date());

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Recurring Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditMode(false);
            setSelectedTransaction(null);
            setTransactionForm({
              name: '',
              amount: '',
              frequency: 'monthly',
              start_date: '',
              end_date: '',
              category: '',
              is_income: false,
              description: '',
            });
            setOpen(true);
          }}
        >
          New Recurring Transaction
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Active Transactions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Recurring Transactions
            </Typography>
            <List>
              {activeTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
              {activeTransactions.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No active recurring transactions
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="success.main">
                Monthly Income: ${activeTransactions
                  .filter(t => t.is_income)
                  .reduce((sum, t) => sum + Number(t.amount), 0)
                  .toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" color="error.main" sx={{ mt: 1 }}>
                Monthly Expenses: ${activeTransactions
                  .filter(t => !t.is_income)
                  .reduce((sum, t) => sum + Number(t.amount), 0)
                  .toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Expired Transactions */}
        {expiredTransactions.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Expired Recurring Transactions
              </Typography>
              <List>
                {expiredTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Transaction Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditClick(transactions.find(t => t.id === menuTransactionId))}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(menuTransactionId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Transaction Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={transactionForm.name}
            onChange={(e) => setTransactionForm({ ...transactionForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={transactionForm.amount}
            onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Frequency"
            fullWidth
            value={transactionForm.frequency}
            onChange={(e) => setTransactionForm({ ...transactionForm, frequency: e.target.value })}
          >
            {FREQUENCIES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            value={transactionForm.start_date}
            onChange={(e) => setTransactionForm({ ...transactionForm, start_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="End Date (Optional)"
            type="date"
            fullWidth
            value={transactionForm.end_date}
            onChange={(e) => setTransactionForm({ ...transactionForm, end_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            select
            label="Category"
            fullWidth
            value={transactionForm.category}
            onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
          >
            {(Array.isArray(categories) ? categories : []).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={transactionForm.description}
            onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={transactionForm.is_income}
                onChange={(e) => setTransactionForm({ ...transactionForm, is_income: e.target.checked })}
                color="primary"
              />
            }
            label="This is an income transaction"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTransaction} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recurring; 