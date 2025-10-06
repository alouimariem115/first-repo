import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';


const LogoutButton = styled.button`
   padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: 0.3s;
  width: 80%;

  ${({ variant }) =>
    variant === "danger"
      ? `background-color: #e74c3c; color: white;`
      : `background-color: #3498db; color: white;`}

  &:hover {
    opacity: 0.8;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 20px;
  margin-left: 10px;
`;

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer les données d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Rediriger vers la page de connexion
    navigate('/');
  };

  return (
    <ButtonContainer>
     <LogoutButton onClick={handleLogout}>
      Déconnexion
    </LogoutButton> 
    </ButtonContainer>
  );
};

export default Logout;