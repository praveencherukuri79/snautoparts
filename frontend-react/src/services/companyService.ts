/**
 * Company Service
 * 
 * Handles company information, stats, values, and team data.
 * Follows mock data pattern: check env.enableMockData first, then API call.
 */

import { env } from '@/config/env';
import { mockCompanyStats, mockCompanyValues, mockTeamMembers, type Stat, type CompanyValue, type TeamMember } from './mockData';

/**
 * Get company statistics
 */
export const getCompanyStats = async (): Promise<Stat[]> => {
  // If mock data enabled, return immediately
  if (env.enableMockData) {
    return Promise.resolve(mockCompanyStats);
  }

  try {
    // TODO: Replace with real API call when endpoint exists
    // const response = await apiGet<{ data: Stat[] }>('/company/stats');
    // return response.data;
    
    // Fallback to mock data if API doesn't exist yet
    return mockCompanyStats;
  } catch (error) {
    console.error('Failed to fetch company stats:', error);
    return mockCompanyStats;
  }
};

/**
 * Get company core values
 */
export const getCompanyValues = async (): Promise<CompanyValue[]> => {
  if (env.enableMockData) {
    return Promise.resolve(mockCompanyValues);
  }

  try {
    // TODO: Replace with real API call when endpoint exists
    // const response = await apiGet<{ data: CompanyValue[] }>('/company/values');
    // return response.data;
    
    return mockCompanyValues;
  } catch (error) {
    console.error('Failed to fetch company values:', error);
    return mockCompanyValues;
  }
};

/**
 * Get team members
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  if (env.enableMockData) {
    return Promise.resolve(mockTeamMembers);
  }

  try {
    // TODO: Replace with real API call when endpoint exists
    // const response = await apiGet<{ data: TeamMember[] }>('/company/team');
    // return response.data;
    
    return mockTeamMembers;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return mockTeamMembers;
  }
};

export const companyService = {
  getCompanyStats,
  getCompanyValues,
  getTeamMembers,
};
