import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (window.location.pathname === '/kingofmaccas') {
  import('./Admin').then(m => {
    root.render(React.createElement(m.default));
  });
} else {
  root.render(React.createElement(App));
}
