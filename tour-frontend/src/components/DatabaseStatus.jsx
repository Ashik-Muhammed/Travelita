import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

function DatabaseStatus() {
  const [status, setStatus] = useState('checking');
  const [packageCount, setPackageCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we can connect to the Realtime Database
    const packagesRef = ref(rtdb, 'tourPackages');
    
    try {
      const unsubscribe = onValue(packagesRef, (snapshot) => {
        if (snapshot.exists()) {
          let count = 0;
          snapshot.forEach(() => {
            count++;
          });
          setPackageCount(count);
          setStatus('connected');
        } else {
          setPackageCount(0);
          setStatus('empty');
        }
      }, (err) => {
        console.error('Database error:', err);
        setStatus('error');
        setError(err.message);
      });
      
      // Clean up subscription
      return () => unsubscribe();
    } catch (err) {
      console.error('Database connection error:', err);
      setStatus('error');
      setError(err.message);
    }
  }, []);

  return (
    <div className="database-status" style={{ 
      padding: '10px 15px',
      borderRadius: '4px',
      marginBottom: '20px',
      backgroundColor: status === 'connected' ? '#d4edda' : 
                       status === 'empty' ? '#fff3cd' : 
                       status === 'checking' ? '#d1ecf1' : '#f8d7da',
      color: status === 'connected' ? '#155724' : 
             status === 'empty' ? '#856404' : 
             status === 'checking' ? '#0c5460' : '#721c24',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <strong>Firebase Database Status: </strong>
        {status === 'connected' && `Connected (${packageCount} packages found)`}
        {status === 'empty' && 'Connected but no data found'}
        {status === 'checking' && 'Checking connection...'}
        {status === 'error' && `Error: ${error}`}
      </div>
      
      {status === 'empty' && (
        <a 
          href="/database-init" 
          className="btn btn-sm btn-warning"
          style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '2px 8px' }}
        >
          Initialize Database
        </a>
      )}
    </div>
  );
}

export default DatabaseStatus;
