import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import PaymentList from './components/PaymentList';

function App() {
  const [payments, setPayments] = useState([]);
  const [paymentsError, setPaymentsError] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [lastUpdate, setLastUpdate] = useState(null);


  const API_BASE = process.env.REACT_APP_API_BASE || '/api';

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/logs`);
      if (!response.ok) {
        throw new Error(`Logs request failed (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setPayments(data.payments || []);
        setPaymentsError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPaymentsError(err.message || 'Failed to connect to server');
    } finally {
      setPaymentsLoading(false);
    }
  }, [API_BASE]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) {
        throw new Error(`Dashboard request failed (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary || null);
        setSummaryError(null);
      } else {
        throw new Error(data.error || 'Failed to build dashboard summary');
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setSummaryError(err.message || 'Failed to connect to server');
    } finally {
      setSummaryLoading(false);
    }
  }, [API_BASE]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([fetchSummary(), fetchPayments()]);
    setLastUpdate(new Date());
  }, [fetchSummary, fetchPayments]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      refreshAll();
    }, 45000);

    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <div className="App">
      <div className="App-content">
        <Dashboard
          summary={summary}
          loading={summaryLoading}
          error={summaryError}
          lastUpdate={lastUpdate}
          onRefresh={refreshAll}
        />

        <PaymentList
          payments={payments}
          loading={paymentsLoading}
          error={paymentsError}
          onRefresh={refreshAll}
        />
      </div>
    </div>
  );
}

export default App;
