import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  gap: 5rem;
  margin-bottom: 2rem;
`;


const Card = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 300px;
`;


const Value = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-top: 0.5rem;
  text-align : center ;
`;

const Label = styled.div`
  color: #666;
  font-size: 1.3rem;
  font-weight : bold ;
  text-align : center; 
`;



console.log("👀 Composant TemperatureHumidity monté");

const TemperatureHumidity = ({ temperature, humidite }) => {
  
  return (
    <Container>
      <Card>
        <Label>Température</Label>
        <Value>{temperature}°C</Value>
      </Card>
      <Card>
        <Label>Humidité</Label>
        <Value>{humidite}%</Value>
      </Card>
    </Container>
  );
};

export default TemperatureHumidity;