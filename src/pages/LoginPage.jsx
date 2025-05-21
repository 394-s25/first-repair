// filepath: src/pages/LoginPage.jsx
import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 360, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>Admin Login</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField fullWidth label="Email" type="email" value={email}
        onChange={e => setEmail(e.target.value)} required sx={{ mb:2 }} />
      <TextField fullWidth label="Password" type="password" value={password}
        onChange={e => setPassword(e.target.value)} required sx={{ mb:2 }} />
      <Button fullWidth type="submit" variant="contained">Log In</Button>
    </Box>
  );
}