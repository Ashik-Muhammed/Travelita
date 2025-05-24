import React from 'react';
import NewDashboard from './NewDashboard';

/**
 * UserDashboard component that serves as a wrapper for the NewDashboard component.
 * This allows for easy swapping of dashboard implementations while maintaining
 * consistent routing and component structure.
 */
const UserDashboard = () => {
  return <NewDashboard />;
};

export default UserDashboard;
