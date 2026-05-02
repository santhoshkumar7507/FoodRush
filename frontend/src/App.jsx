import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CustomerApp from './pages/CustomerApp';
import RestaurantApp from './pages/RestaurantApp';
import PartnerApp from './pages/PartnerApp';

function App() {
  const [user, setUser] = useState(null);
  const darkMode = true; // Permanent Dark Mode

  useEffect(() => {
    const isDark = true;
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.body.style.backgroundColor = '#020617';
    localStorage.setItem('darkMode', 'true');
  }, []);

  return (
    <BrowserRouter>
      <div className={`min-h-screen dark transition-colors duration-500`}>
        <Routes>
          <Route path="/" element={<LoginPage setUser={setUser} darkMode={darkMode} />} />
          <Route 
            path="/customer/*" 
            element={user && user.role === 'customer' ? <CustomerApp user={user} darkMode={darkMode} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/restaurant/*" 
            element={user && user.role === 'restaurant' ? <RestaurantApp user={user} darkMode={darkMode} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/partner/*" 
            element={user && user.role === 'partner' ? <PartnerApp user={user} darkMode={darkMode} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
