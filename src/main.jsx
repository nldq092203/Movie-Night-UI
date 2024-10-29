import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="712033201668-g768idsmi3bhiqfc5ui89rj1pfe22969.apps.googleusercontent.com"> 
    <AuthProvider>
        <App />
    </AuthProvider>
  </GoogleOAuthProvider>
);