import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';

const Notifications = () => {
  const theme = useTheme();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  const NotificationItem = ({ notification }) => (
    <ListItem
      sx={{
        bgcolor: notification.is_read ? 'inherit' : theme.palette.action.hover,
        '&:hover': {
          bgcolor: theme.palette.action.selected,
        },
      }}
      secondaryAction={
        !notification.is_read && (
          <IconButton
            edge="end"
            aria-label="mark as read"
            onClick={() => markAsRead(notification.id)}
          >
            <CheckCircleIcon color="primary" />
          </IconButton>
        )
      }
    >
      <ListItemIcon>
        {notification.is_read ? (
          <CircleIcon color="disabled" />
        ) : (
          <NotificationsIcon color="primary" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={notification.message}
        secondary={format(new Date(notification.created_at), 'PPp')}
      />
    </ListItem>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<CheckCircleIcon />}
            onClick={markAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      <Paper elevation={2}>
        {unreadNotifications.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ p: 2, bgcolor: theme.palette.primary.light }}>
              Unread ({unreadNotifications.length})
            </Typography>
            <List>
              {unreadNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem notification={notification} />
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </>
        )}

        {readNotifications.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
              Read ({readNotifications.length})
            </Typography>
            <List>
              {readNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem notification={notification} />
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </>
        )}

        {notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No notifications yet
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications; 