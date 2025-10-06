import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const Title = styled.h2`
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
`;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mot de passe réinitialisé avec succès');
        setIsError(false);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage(data.message || 'Erreur lors de la réinitialisation');
        setIsError(true);
      }
    } catch  {
      setMessage('Erreur de connexion au serveur');
      setIsError(true);
    }
  };

  return (
    <Container>
      <Title>Réinitialisation du mot de passe</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />
        <Input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength="6"
        />
        {message && (
          <MessageDiv $isError={isError}>{message}</MessageDiv>
        )}
        <Button type="submit">Réinitialiser le mot de passe</Button>
      </Form>
    </Container>
  );
};

export default ResetPassword; 