import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast ,ToastContainer} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';




const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 400px;
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

const Link = styled.a`
  color: #007bff;
  text-decoration: none;
  margin-top: 1rem;
  cursor: pointer;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 1rem;
  text-align: center;
`;




const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      console.log('Tentative d\'inscription...');
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      });

      console.log('Status de la réponse:', response.status);
      const data = await response.json();
      console.log('Données reçues:', data);
      localStorage.setItem('user', JSON.stringify(data.user)); // Storing user data in localStorage


      if (response.ok) {
      toast.success('Inscription réussie !', { position: 'top-right', autoClose: 3000 });
      setTimeout(async() => {
        console.log('Redirection vers le dashboard...');
        await navigate('/');
      }, 1500); 
      } else {
        console.log('Erreur d\'inscription:', data);
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(`Erreur de connexion au serveur: ${err.message}`);
    }
  };

  return (
    
    <div className="form-container sign-up-container">
    <form onSubmit={handleSubmit}>
      <h1>Créer un compte</h1>
      <Input
        type="text"
        name="name"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button type="submit">S'inscrire</button>
      
    </form>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover />
  </div>
  );
};

export default SignUp;