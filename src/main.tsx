import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return (
    <div style={{
      color: '#fff',
      padding: 40,
      fontFamily: 'Segoe UI, sans-serif',
      background: 'linear-gradient(135deg,#120f1f,#2a1c40)',
      width: '100vw',
      height: '100vh'
    }}>
      <h1>SAKURA WORKS ✅</h1>
      <p>Если ты это видишь — React работает.</p>
    </div>
  );
}

const el = document.getElementById('root');
if (!el) throw new Error('root not found');
ReactDOM.createRoot(el).render(<TestApp />);
