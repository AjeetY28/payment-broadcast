import React from 'react';
import './Dashboard.css';

const formatCurrency = (amount, currency = 'GBP') => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount >= 1000 ? 0 : 2
    }).format(amount);
  } catch (error) {
    return `${currency} ${Number(amount).toLocaleString('en-GB')}`;
  }
};

const formatDateTime = value => {
  if (!value) return 'Not yet captured';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet captured';

  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function Dashboard({ summary, loading, error, lastUpdate, onRefresh }) {
  const totals = summary?.totals || {};
  const counts = summary?.counts || {};
  const breakdowns = summary?.breakdowns || [];
  const outstandingGroups = summary?.outstandingGroups || [];
  const keyActions = summary?.keyActions || [];
  const currency = totals.currency || 'INR';

  const summaryCards = [
    {
      key: 'collections',
      title: 'Total Collections',
      amount: totals.totalCollections,
      subtitle: 'Total invoices collected',
      metaLabel: 'Net Inflow',
      metaValue: totals.netInflow,
      metaFormat: 'currency',
      accent: 'success'
    },
    {
      key: 'outstanding',
      title: 'Total O/S Debt',
      amount: totals.totalOutstanding,
      subtitle: `Outstanding invoices: ${counts.outstandingInvoices || 0}`,
      metaLabel: 'Open Items',
      metaValue: counts.outstandingInvoices,
      metaFormat: 'count',
      accent: 'danger'
    },
    {
      key: 'largest',
      title: 'Largest Single Debt',
      amount: totals.largestDebt?.amount,
      subtitle: totals.largestDebt
        ? totals.largestDebt.customer
        : 'No outstanding invoices',
      metaLabel: totals.largestDebt?.organization ? totals.largestDebt.organization : 'Status',
      metaValue: totals.largestDebt?.status || 'All clear',
      metaFormat: 'text',
      accent: 'warning'
    }
  ];

  const formatMetaValue = (value, metaCurrency, format = 'currency') => {
    if (value === null || value === undefined) {
      return '—';
    }

    if (format === 'count') {
      return value;
    }

    if (format === 'text') {
      return value;
    }

    if (typeof value === 'number') {
      return formatCurrency(value, metaCurrency);
    }

    return value || '—';
  };

  const renderSummaryCard = card => (
    <div key={card.key} className={`summary-card ${card.accent}`}>
      <p className="summary-label">{card.title}</p>
      <h3>{loading ? '…' : formatCurrency(card.amount, currency)}</h3>
      <p className="summary-subtitle">{card.subtitle}</p>
      {card.metaLabel && (
        <p className="summary-meta">
          {card.metaLabel}:{' '}
          <span>
            {loading ? '…' : formatMetaValue(card.metaValue, currency, card.metaFormat)}
          </span>
        </p>
      )}
    </div>
  );

  return (
    <section className="Dashboard">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Plus Group Financial Overview</p>
          <h1>Plus Group Financial Overview</h1>
          <p className="snapshot">
            Snapshot generated: {formatDateTime(lastUpdate || summary?.generatedAt)}
          </p>
          <div className="hero-stats">
            <div>
              <strong>{counts.totalInvoices || 0}</strong>
              <span>Total Invoices</span>
            </div>
            <div>
              <strong>{counts.paidInvoices || 0}</strong>
              <span>Collected</span>
            </div>
            <div>
              <strong>{counts.outstandingInvoices || 0}</strong>
              <span>Outstanding</span>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <button className="refresh" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Snapshot'}
          </button>
          <span className={`live-pill ${loading ? 'syncing' : 'live'}`}>
            {loading ? 'Syncing' : 'Live'}
          </span>
        </div>
      </div>

      <div className="summary-grid">
        {summaryCards.map(renderSummaryCard)}
      </div>

      <div className="card breakdown-card">
        <div className="card-header">
          <h2>Financial Balances Breakdown</h2>
          <span className="pill">Top Sources</span>
        </div>
        {loading ? (
          <p className="placeholder">Building breakdown…</p>
        ) : breakdowns.length > 0 ? (
          <div className="breakdown-grid">
            {breakdowns.map(item => (
              <div key={item.label} className="breakdown-item">
                <p className="label">{item.label}</p>
                <p className="value">{formatCurrency(item.amount, currency)}</p>
                <p className="muted">
                  {(item.percentage * 100).toFixed(1)}% of collections
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="placeholder">No breakdown data yet.</p>
        )}
      </div>

      <div className="outstanding-section">
        {loading && outstandingGroups.length === 0 ? (
          <div className="card">
            <p className="placeholder">Loading outstanding accounts…</p>
          </div>
        ) : outstandingGroups.length > 0 ? (
          outstandingGroups.map(group => (
            <div key={group.title} className="card outstanding-card">
              <div className="card-header">
                <h3>{group.title}</h3>
                <p className="value">{formatCurrency(group.total, currency)}</p>
              </div>
              <ul>
                {group.accounts.map(account => (
                  <li
                    key={`${group.title}-${account.payment_id || account.name}`}
                    className={`status-${account.status?.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div>
                      <p className="account-name">{account.name}</p>
                      <p className="account-status">{account.status}</p>
                    </div>
                    <p className="account-amount">{formatCurrency(account.amount, account.currency || currency)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="card">
            <p className="placeholder">No outstanding accounts 🎉</p>
          </div>
        )}
      </div>

      <div className="card actions-card">
        <div className="card-header">
          <h2>Key Actions · Urgent Priorities</h2>
        </div>
        {loading ? (
          <p className="placeholder">Updating priorities…</p>
        ) : keyActions.length > 0 ? (
          <ol>
            {keyActions.map(action => (
              <li key={action.title}>
                <div className="action-title">{action.title}</div>
                <p>{action.description}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="placeholder">All caught up for now.</p>
        )}
      </div>

      {error && (
        <div className="card error-card">
          <p>Unable to refresh dashboard: {error}</p>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
