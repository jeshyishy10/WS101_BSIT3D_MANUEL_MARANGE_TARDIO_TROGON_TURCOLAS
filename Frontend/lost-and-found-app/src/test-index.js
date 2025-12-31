import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return React.createElement('div', {style: {padding: '20px'}}, 
    React.createElement('h1', null, 'Test Successful!'),
    React.createElement('p', null, 'No BOM issues detected.'),
    React.createElement('p', null, 'Backend: http://localhost:8082/LostAndFoundSystem')
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(TestApp));
