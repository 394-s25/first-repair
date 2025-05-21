// filepath: src/App.jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NewForm from './components/NewForm.jsx';
import PrivateRoute from './components/PrivateRoute.jsx'; // ← new
import { AuthProvider } from './contexts/AuthContext.jsx'; // ← new
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx'; // ← new

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewForm />} />
        <Route path="/login" element={<LoginPage />} />           // public login
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);


export default App;