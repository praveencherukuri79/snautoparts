/**
 * AboutPage Component
 * 
 * Company information, mission, values, and team
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Button, Card, Avatar } from '@/primitives';
import {
  VerifiedIcon,
  LocalShippingIcon,
  SupportAgentIcon,
  StarIcon,
  GroupsIcon,
  TrendingUpIcon,
  PublicIcon,
  EmojiEventsIcon,
} from '@/icons';
import { companyService } from '@/services/companyService';
import type { Stat, CompanyValue, TeamMember } from '@/services/mockData';
import { StatCard } from '@/components';
import { HeroSection, StoryImage, ValueCard, TeamCard, CTASection } from './AboutPage.styles';

// Icon mapping for stats and values
const iconMap: Record<string, any> = {
  TrendingUpIcon,
  GroupsIcon,
  PublicIcon,
  EmojiEventsIcon,
  VerifiedIcon,
  LocalShippingIcon,
  SupportAgentIcon,
  StarIcon,
};

const AboutPage: React.FC = () => {
  const [companyStats, setCompanyStats] = useState<Stat[]>([]);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stats, values, team] = await Promise.all([
          companyService.getCompanyStats(),
          companyService.getCompanyValues(),
          companyService.getTeamMembers(),
        ]);
        setCompanyStats(stats);
        setCompanyValues(values);
        setTeamMembers(team);
      } catch (error) {
        console.error('Failed to fetch company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1rem' }}>
              About Us
            </Typography>
            <Typography variant="h2" fontWeight={900} sx={{ maxWidth: 800 }}>
              Your Trusted Partner in Automotive Excellence
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, opacity: 0.9 }}>
              For over 15 years, SN Auto Parts has been committed to providing quality auto parts,
              exceptional service, and expert advice to car enthusiasts and professionals alike.
            </Typography>
          </Stack>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
          {companyStats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon];
            return (
              <Box key={index} sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  icon={IconComponent}
                  color="primary.main"
                />
              </Box>
            );
          })}
        </Stack>
      </Container>

      {/* Our Story Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight={900} sx={{ mb: 3 }}>
                Our Story
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Founded in 2010, SN Auto Parts began with a simple mission: to make quality automotive
                parts accessible to everyone. What started as a small garage operation has grown into
                one of the most trusted names in the industry.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We understand that your vehicle is more than just transportation—it's an investment,
                a passion, and sometimes even a lifestyle. That's why we're dedicated to providing
                parts that meet the highest standards of quality and performance.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Today, we serve over 500,000 customers nationwide, maintaining the same commitment
                to excellence that defined us from day one.
              </Typography>
              <Button variant="primary" size="large" sx={{ mt: 2 }}>
                Shop Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <StoryImage
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop"
                alt="Our store"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Values Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" fontWeight={900}>
            Our Core Values
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700 }}>
            These principles guide everything we do, from sourcing parts to serving customers.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {companyValues.map((value, index) => {
            const IconComponent = iconMap[value.icon];
            return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <ValueCard>
                  <IconComponent sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  {value.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {value.description}
                </Typography>
                </ValueCard>
              </Card>
            </Grid>
          );})}
        </Grid>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" fontWeight={900}>
              Meet Our Team
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700 }}>
              The passionate people behind SN Auto Parts, working hard to serve you better every day.
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <TeamCard>
                  <Avatar
                    name={member.name}
                    src={member.image}
                    size="xl"
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  />
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                  </TeamCard>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <CTASection>
          <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers and experience the SN Auto Parts difference.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="secondary"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Shop Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </CTASection>
      </Container>
    </Box>
  );
};

export default AboutPage;
