import React from 'react';
import './Dashboard.css';

function Dashboard({ stats, loading, lastUpdate }) {
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Payments',
      value: stats.total,
      icon: '📊',
      color: '#667eea'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats.totalAmount),
      icon: '💰',
      color: '#f093fb'
    },
    {
      title: 'Today\'s Payments',
      value: stats.todayCount,
      icon: '📅',
      color: '#4facfe'
    },
    {
      title: 'Today\'s Amount',
      value: formatCurrency(stats.todayAmount),
      icon: '💵',
      color: '#43e97b'
    }
  ];

  return (
    <div className="Dashboard">
      <div className="dashboard-header">
        <h2>Payment Statistics</h2>
        <div className="status-indicator">
          <span className={`status-dot ${loading ? 'loading' : 'active'}`}></span>
          <span>{loading ? 'Loading...' : 'Live'}</span>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : card.value}</div>
              <div className="stat-title">{card.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

