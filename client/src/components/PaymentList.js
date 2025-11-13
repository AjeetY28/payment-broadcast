import React from 'react';
import './PaymentList.css';

const statusClassMap = {
  processed: 'status-processed',
  paid: 'status-processed',
  completed: 'status-processed',
  pending: 'status-pending',
  overdue: 'status-overdue',
  failed: 'status-failed',
  issue: 'status-issue'
};

const normalizeStatusKey = status => (status || 'processed').toLowerCase();

const formatCurrency = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined) return '—';
  const numericAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(numericAmount);
  } catch (error) {
    return `${currency} ${numericAmount.toLocaleString('en-GB')}`;
  }
};

const formatDate = timestamp => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function PaymentList({ payments, loading, error, onRefresh }) {
  const hasPayments = payments && payments.length > 0;

  const renderTable = () => (
    <div className="payment-table-container">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Source</th>
            <th>Timestamp</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => {
            const statusKey = normalizeStatusKey(payment.status);
            return (
              <tr key={payment.payment_id || index} className={index === 0 ? 'latest' : ''}>
                <td className="payment-id">
                  <span>{payment.payment_id || payment.invoice_number}</span>
                  <small>{payment.invoice_number && payment.invoice_number !== payment.payment_id ? payment.invoice_number : ''}</small>
                </td>
                <td className="customer-cell">
                  <p className="customer-name">{payment.customer_name || 'Unknown Customer'}</p>
                  {payment.organization_name && (
                    <span className="customer-org">{payment.organization_name}</span>
                  )}
                </td>
                <td className="amount">{formatCurrency(payment.amount, payment.currency)}</td>
                <td className="source">{payment.source || 'N/A'}</td>
                <td className="timestamp">{formatDate(payment.timestamp)}</td>
                <td>
                  <span className={`status-pill ${statusClassMap[statusKey] || 'status-default'}`}>
                    {payment.status || 'Processed'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="PaymentList card">
      <div className="payment-list-header">
        <div>
          <p className="eyebrow">Payment Activity</p>
          <h2>Payment Timeline</h2>
          <p className="subtitle">Live feed of invoices coming from Zoho + manual entries</p>
        </div>
        <button onClick={onRefresh} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="state-message error">
          <p>{error}</p>
          <button onClick={onRefresh}>Retry</button>
        </div>
      )}

      {!error && loading && !hasPayments && (
        <div className="state-message">
          <p>Loading payments…</p>
        </div>
      )}

      {!loading && !error && !hasPayments && (
        <div className="state-message">
          <p>No payments yet</p>
          <p className="muted">Entries created via webhook or manual sheets sync will appear here.</p>
        </div>
      )}

      {!error && hasPayments && renderTable()}
    </section>
  );
}

export default PaymentList;
