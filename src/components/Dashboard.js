import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
    category_totals: [],
  });
  const [analytics, setAnalytics] = useState({
    trends: [],
    top_categories: [],
    net_worth: [],
    budget_vs_actual: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, analyticsRes] = await Promise.all([
          axios.get('/api/transactions/summary/'),
          axios.get('/api/analytics/'),
        ]);
        setSummary(summaryRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const SummaryCard = ({ title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ color }}>
          ${value.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Total Income"
            value={summary.total_income}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Total Expenses"
            value={summary.total_expenses}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Balance"
            value={summary.balance}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Expense Breakdown (Pie Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Expense Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.category_totals.filter(c => c.category__type === 'expense')}
                  dataKey="total"
                  nameKey="category__name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {summary.category_totals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Income/Expense Trends (Line Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Income/Expense Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Amount"
                  stroke={theme.palette.primary.main}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Budget vs Actual (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Actual
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.budget_vs_actual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budgeted" name="Budgeted" fill={theme.palette.primary.main} />
                <Bar dataKey="actual" name="Actual" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Net Worth (Area Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Net Worth Progression
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.net_worth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="net_worth"
                  name="Net Worth"
                  stroke={theme.palette.success.main}
                  fill={theme.palette.success.light}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 