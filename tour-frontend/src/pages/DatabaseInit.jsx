import React, { useState } from 'react';
import { initializeDatabase } from '../utils/initializeDatabase';

function DatabaseInit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      setResult(null);
      setError(null);
      
      const success = await initializeDatabase();
      
      if (success) {
        setResult('Database initialized successfully with sample data!');
      } else {
        setError('Failed to initialize database. Check console for details.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error initializing database:', err);
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Firebase Database Initialization</h1>
      <p>This page allows you to initialize your Firebase Realtime Database with sample tour packages data.</p>
      <p><strong>Warning:</strong> This will add sample data to your database. Use only during development.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleInitialize} 
          disabled={loading}
        >
          {loading ? 'Initializing...' : 'Initialize Database with Sample Data'}
        </button>
      </div>
      
      {result && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          {result}
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Next Steps</h2>
        <ul>
          <li>After initializing the database, navigate to the <a href="/">Home page</a> to see the sample data.</li>
          <li>You can also check the <a href="/top-packages">Top Packages</a> and <a href="/budget-packages">Budget Packages</a> pages.</li>
          <li>Try registering a new user and logging in to test authentication.</li>
        </ul>
      </div>
    </div>
  );
}

export default DatabaseInit;
