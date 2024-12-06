import React from 'react';
import './MainDashboard.css';
import { ProgressPanel } from './ProgressPanel/ProgressPanel';

export const MainDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Main Dashboard</h1>
      <div className="dashboard-grid">
        <ProgressPanel 
          progress={75}
          title="Portfolio Progress"
          description="Current portfolio completion status"
        />
        <ProgressPanel 
          progress={40}
          title="Investment Goals"
          description="Progress towards investment targets"
        />
      </div>
    </div>
  );
};

export default MainDashboard;