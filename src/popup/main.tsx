import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';


// Find the root DOM element where the React app will be mounted.
const container = document.getElementById('root');

// Ensure the container exists before attempting to create a root.
if (container) {
    // Create a React root and render the App component.
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    );
} else {
    console.error('Root element not found. Cannot mount React app.');
}
