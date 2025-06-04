import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Reports = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [reportData, setReportData] = useState({
    monthlyTrends: [],
    categoryBreakdown: [],
    topExpenses: [],
    budgetVsActual: [],
    netWorth: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      enqueueSnackbar('Failed to fetch report data', { variant: 'error' });
    }
    setLoading(false);
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get('/api/reports/export/', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
          format,
        },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${format}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar(`Report exported successfully as ${format.toUpperCase()}`, { variant: 'success' });
    } catch (error) {
      console.error('Error exporting report:', error);
      enqueueSnackbar('Failed to export report', { variant: 'error' });
    }
  };

  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  const MonthlyTrendsChart = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Monthly Trends</Typography>
          <IconButton onClick={() => handleExport('csv')} size="small">
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={formatCurrency} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#4CAF50" name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#F44336" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const CategoryBreakdownChart = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Category Breakdown</Typography>
          <IconButton onClick={() => handleExport('csv')} size="small">
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reportData.categoryBreakdown}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {reportData.categoryBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatCurrency} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TopExpensesChart = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Top Expenses</Typography>
          <IconButton onClick={() => handleExport('csv')} size="small">
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.topExpenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={formatCurrency} />
            <Bar dataKey="amount" fill="#F44336" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const BudgetVsActualChart = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Budget vs Actual</Typography>
          <IconButton onClick={() => handleExport('csv')} size="small">
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.budgetVsActual}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={formatCurrency} />
            <Legend />
            <Bar dataKey="budget" fill="#2196F3" name="Budget" />
            <Bar dataKey="actual" fill="#4CAF50" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const NetWorthChart = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Net Worth Trend</Typography>
          <IconButton onClick={() => handleExport('csv')} size="small">
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.netWorth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={formatCurrency} />
            <Line type="monotone" dataKey="amount" stroke="#9C27B0" name="Net Worth" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Financial Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MonthlyTrendsChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <CategoryBreakdownChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopExpensesChart />
          </Grid>
          <Grid item xs={12}>
            <BudgetVsActualChart />
          </Grid>
          <Grid item xs={12}>
            <NetWorthChart />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports; 