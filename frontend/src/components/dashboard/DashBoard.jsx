import React ,  { useEffect , useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import TemperatureHumidity from "./TemperatureHumidity";
import { useAuth } from "../../hooks/useAuth";
import Logout from "../auth/Logout";
import socket from "../../socket";

const PageContainer = styled.div`
  position : relative ;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 80vh;
  padding-bottom: 100px;
  justify-content: center;
  margin-left : 70px ;

`;

const Logo = styled.img`
  
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  justify-content: center;

`;

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
  padding: 50px;
  background-color: #f5f5f5;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 80px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 40px;
  font-weight: bold;
`;

const LogoutButton = styled.div`
  top: 40px;
  right: 15px;
  padding : -10px ;
  button {
    font-size: 16px;
    padding: 12px 25px;
    width: 90%;
    padding-right : 50 px ; 
    border-radius: 30px;


  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
  
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding : 20px 20px ;
  gap: 5rem;
`;



const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: 0.3s;
  width: 35%;

  ${({ variant }) =>
    variant === "danger"
      ? `background-color: #e74c3c; color: white;`
      : `background-color: #3498db; color: white;`}

  &:hover {
    opacity: 0.8;
  }
`;
const AlertBox = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem 2rem ;
  border-radius: 10px;
  border: 1px solid #ffeeba;
  font-size: 1rem;
  font-weight: bold;
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
`;


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [temperature, setTemperature] = useState(null);
  const [humidite, setHumidite] = useState(null);
  const [alerte, setAlerte] = useState("");

  useEffect(() => {
     
  socket.on('connect', () => console.log('🔵 Connecté au serveur socket.io'));
  socket.on('disconnect', () => console.log('⚪ Déconnecté du serveur'));
  socket.on('connect_error', (err) => console.error('🔴 Erreur de connexion:', err));

  // Écoute les données
  const handleSensorData = async (data) => {
    console.log('📦 Données reçues:', data);
    setTemperature(data.temperature);
    setHumidite(data.humidity);
  };
  const handleAlerte = (data) => {
    console.log('🚨 Alerte reçue:', data);
    setAlerte(data.message);
  };
    socket.on("SensorData", handleSensorData);
    socket.on("Alerte", handleAlerte);

    return () => {
        socket.off('SensorData');
        socket.off('Alerte');
    
    }; 
  },[]);
  

  return (
    <PageContainer>
      <DashboardContainer>
        <Header>
          <Title>Tableau de Bord</Title>
          
          <LogoutButton>
            <Logout />
          </LogoutButton>
        </Header>

        {alerte && <AlertBox>{alerte}</AlertBox>} 

        <TemperatureHumidity temperature={temperature} humidite={humidite}/>

        <ButtonContainer>
          <Button onClick={() => navigate("/history")}>📜 Historique</Button>
          <Button onClick={() => navigate("/graph")}>📊 Courbe</Button>
        </ButtonContainer>
      </DashboardContainer>
      <UserInfo>
            <span>Bienvenue, {user?.username}</span>
          </UserInfo>
    </PageContainer>
  );
};

export default Dashboard;
