// ForgotPassword.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  max-width: 600px;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  border-radius: 8px;
  background: white;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const MessageDiv = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: ${props => props.$isError ? '#dc3545' : '#28a745'};
`;

const StyledLink = styled.a`
  color: #007bff;
  text-decoration: none;
  margin-top: 1rem;
  cursor: pointer;
  text-align: center;
  display: block;
`;

const Title = styled.h2`
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setMessage('');
    setIsError(false);

    try {
      console.log('Envoi de la demande de réinitialisation...');
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Réponse reçue:', data);

      if (response.ok) {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse email.');
        setIsError(false);
      } else {
        setMessage(data.message || 'Une erreur est survenue');
        setIsError(true);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setMessage('Erreur de connexion au serveur');
      setIsError(true);
    
  } finally {
    setLoading(false); // Masque le loader
  }
  };

  const handleReturn = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Container>
      <Title>Mot de passe oublié</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message && (
          <MessageDiv $isError={isError}>{message}</MessageDiv>
        )}
        <Button type="submit" disabled={loading}>         
          {loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
        </Button>
        <StyledLink onClick={handleReturn}>
          Retour à la connexion
        </StyledLink>
      </Form>
    </Container>
  );
};

export default ForgotPassword;
