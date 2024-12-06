import React from 'react';
import './ProgressPanel.css';
import { ProgressPanelProps } from './types';

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ progress, title, description }) => {
  return (
    <div className="progress-panel">
      <h3>{title}</h3>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      {description && <p className="description">{description}</p>}
    </div>
  );
}; 