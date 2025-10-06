import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


const LoginContainer = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left : 70px ;

`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 1rem;
  text-align: center;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('Tentative de connexion...');
      const response = await fetch('http://localhost:5000/api/auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Status de la réponse:', response.status);
      const data = await response.json();
      console.log('Données reçues:', data);

      if (response.ok) {
        console.log('Connexion réussie');
        localStorage.setItem('token', data.token);
        login(data.user);
        navigate('/dashboard');
      } else {
        console.log('Erreur de connexion:', data);
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <LoginContainer>
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>se connecter</h1>
        <Input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a href="#" onClick={handleForgotPassword}>Mot de passe oublié?</a>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <button type="submit">Connexion</button>
      </form>
    </div>
    </LoginContainer>
  );
};

export default Login;