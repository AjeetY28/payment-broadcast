import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import PaymentList from './components/PaymentList';

function App() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchPayments = async () => {
    try {
      const response = await fetch('/logs');
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPayments();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchPayments, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    todayCount: payments.filter(p => {
      const paymentDate = new Date(p.timestamp);
      const today = new Date();
      return paymentDate.toDateString() === today.toDateString();
    }).length,
    todayAmount: payments
      .filter(p => {
        const paymentDate = new Date(p.timestamp);
        const today = new Date();
        return paymentDate.toDateString() === today.toDateString();
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💰 Plus Payment Alert System</h1>
        <p className="subtitle">Real-time Payment Monitoring Dashboard</p>
      </header>

      <main className="App-main">
        <Dashboard 
          stats={stats} 
          loading={loading}
          lastUpdate={lastUpdate}
        />
        
        <PaymentList 
          payments={payments} 
          loading={loading}
          error={error}
          onRefresh={fetchPayments}
        />
      </main>

      <footer className="App-footer">
        <p>Last updated: {lastUpdate.toLocaleTimeString()}</p>
        <p>Auto-refreshing every 5 seconds</p>
      </footer>
    </div>
  );
}

export default App;

