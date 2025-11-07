import React from 'react';
import './PaymentList.css';

function PaymentList({ payments, loading, error, onRefresh }) {
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="PaymentList">
        <div className="payment-list-header">
          <h2>Payment History</h2>
          <button onClick={onRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={onRefresh} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && payments.length === 0) {
    return (
      <div className="PaymentList">
        <div className="payment-list-header">
          <h2>Payment History</h2>
        </div>
        <div className="loading-message">
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="PaymentList">
      <div className="payment-list-header">
        <h2>Payment History</h2>
        <button onClick={onRefresh} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <p>📭 No payments recorded yet</p>
          <p className="empty-subtitle">Payments will appear here when received via webhook</p>
        </div>
      ) : (
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className={index === 0 ? 'latest-payment' : ''}>
                  <td className="payment-id">{payment.payment_id}</td>
                  <td className="customer-name">{payment.customer_name}</td>
                  <td className="amount">{formatCurrency(payment.amount, payment.currency)}</td>
                  <td className="currency">{payment.currency}</td>
                  <td className="timestamp">{formatDate(payment.timestamp)}</td>
                  <td>
                    <span className={`status-badge ${payment.status?.toLowerCase() || 'processed'}`}>
                      {payment.status || 'Processed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PaymentList;

