// Placeholder page - to be implemented
import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';

const DashboardHome: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Orders', value: '1,234', change: '+12%' },
          { label: 'Revenue', value: '$45,678', change: '+8%' },
          { label: 'Products', value: '567', change: '+3%' },
          { label: 'Customers', value: '890', change: '+15%' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {stat.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="success.main">
                {stat.change} from last month
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography color="text.secondary">
        Full dashboard implementation coming soon.
      </Typography>
    </Box>
  );
};

export default DashboardHome;
