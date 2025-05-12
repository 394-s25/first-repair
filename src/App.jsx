import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Form from './components/Form.jsx';
import NewForm from './components/NewForm.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Request Form</Link>
          <Link to="/admin/dashboard">Admin Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} /> {/* UNCOMMENT THIS */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

// Optional: Create a simple wrapper for your form if you want to keep App.jsx cleaner
const FormPage = () => {
  return (
    <header className="App-header">
      <NewForm />
    </header>
  );
};

export default App;