import React from 'react';
import './Skeleton.css';

export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => {
  return (
    <div 
      className={`skeleton-box ${className}`} 
      style={{ width, height, borderRadius }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-card-header">
      <SkeletonBox width="60px" height="60px" borderRadius="12px" />
      <SkeletonBox width="100px" height="20px" />
    </div>
    <SkeletonBox width="80%" height="40px" className="mt-20" />
    <SkeletonBox width="60%" height="15px" className="mt-10" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="skeleton-chart-container">
    <SkeletonBox width="100%" height="300px" borderRadius="16px" />
  </div>
);
