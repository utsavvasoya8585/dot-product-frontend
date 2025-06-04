import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Book as BookIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  VideoLibrary as VideoIcon,
  Description as DocIcon,
  GitHub as GitHubIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const Help = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const faqs = [
    {
      question: 'How do I add a new transaction?',
      answer: 'To add a new transaction, go to the Transactions page and click the "Add Transaction" button. Fill in the required details such as amount, category, date, and description. You can also add recurring transactions for regular expenses or income.',
    },
    {
      question: 'How do I set up a budget?',
      answer: 'Navigate to the Budget section and click "Create Budget". You can set monthly budgets for different categories. The system will track your spending against these budgets and provide alerts when you\'re approaching the limit.',
    },
    {
      question: 'How do I track my financial goals?',
      answer: 'Go to the Goals page and click "Create Goal". Set your target amount, deadline, and category. The system will track your progress and provide visual updates on your goal achievement.',
    },
    {
      question: 'How do I export my data?',
      answer: 'Go to Settings > Data Management and click "Export". You can choose between different formats (CSV, PDF) and select the date range for your export.',
    },
    {
      question: 'How do I set up recurring transactions?',
      answer: 'Go to the Recurring Transactions page and click "Add Recurring". Set the frequency (daily, weekly, monthly, yearly), amount, and category. The system will automatically create transactions based on your settings.',
    },
  ];

  const documentation = [
    {
      title: 'Getting Started',
      icon: <BookIcon />,
      description: 'Learn the basics of using the Personal Budget Tracker',
      link: '/docs/getting-started',
    },
    {
      title: 'Transactions Guide',
      icon: <DocIcon />,
      description: 'Detailed guide on managing transactions',
      link: '/docs/transactions',
    },
    {
      title: 'Budget Management',
      icon: <DocIcon />,
      description: 'How to create and manage budgets',
      link: '/docs/budgets',
    },
    {
      title: 'Goals & Planning',
      icon: <DocIcon />,
      description: 'Setting and tracking financial goals',
      link: '/docs/goals',
    },
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/support/contact', contactForm);
      enqueueSnackbar('Message sent successfully', { variant: 'success' });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      enqueueSnackbar('Failed to send message', { variant: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value,
    });
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Help & Support</Typography>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* FAQs Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Frequently Asked Questions</Typography>
        {filteredFaqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Documentation Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Documentation</Typography>
        <Grid container spacing={2}>
          {documentation.map((doc, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {doc.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>{doc.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {doc.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" href={doc.link}>Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Support Options */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Support Options</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText
                  primary="Email Support"
                  secondary="support@budgettracker.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ChatIcon /></ListItemIcon>
                <ListItemText
                  primary="Live Chat"
                  secondary="Available 24/7"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><VideoIcon /></ListItemIcon>
                <ListItemText
                  primary="Video Tutorials"
                  secondary="Step-by-step guides"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon><GitHubIcon /></ListItemIcon>
                <ListItemText
                  primary="GitHub Issues"
                  secondary="Report bugs and request features"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ForumIcon /></ListItemIcon>
                <ListItemText
                  primary="Community Forum"
                  secondary="Connect with other users"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><HelpIcon /></ListItemIcon>
                <ListItemText
                  primary="Knowledge Base"
                  secondary="Detailed documentation and guides"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Contact Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Contact Support</Typography>
        <form onSubmit={handleContactSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={contactForm.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={contactForm.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={contactForm.subject}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={contactForm.message}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
              >
                Send Message
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Help; 