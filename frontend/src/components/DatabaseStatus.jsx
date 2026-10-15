import { useEffect, useState } from 'react';
import { getApiHealth } from '../services/api';

function DatabaseStatus() {
  const [status, setStatus] = useState({ kind: 'checking', message: 'Checking backend and database...' });

  useEffect(() => {
    let isCurrent = true;

    getApiHealth()
      .then((health) => {
        if (!isCurrent) return;
        setStatus(health.database === 'connected'
          ? { kind: 'connected', message: 'Backend online · MongoDB connected' }
          : { kind: 'disconnected', message: 'Backend online · MongoDB disconnected' });
      })
      .catch((error) => {
        if (!isCurrent) return;
        setStatus({ kind: 'disconnected', message: `Backend/database unavailable: ${error.message}` });
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <p className={`database-status database-status-${status.kind}`} role="status" aria-live="polite">
      {status.message}
    </p>
  );
}

export default DatabaseStatus;
