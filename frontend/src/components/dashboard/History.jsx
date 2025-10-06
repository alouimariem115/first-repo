import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SagemcomLogo from "C:/Users/aloui/Desktop/salle-serveur/frontend/src/assets/LOGO.png";

const HistoryContainer = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin: 1rem auto;
  width: 95%;
  max-width: 1200px;
  min-height: 80vh;
  
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
`;

const Th = styled.th`
  background-color: #f8f9fa;
  padding: 12px;
  text-align: center;
  border: 1px solid #e0e0e0;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 12px;
  text-align: center;
  border: 1px solid #e0e0e0;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Title = styled.h2`
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 1.8rem;
  color: #333;
`;
const DateInput = styled.input`  
  padding: 0.8rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 150px;
`;

const History = () => {
  const navigate = useNavigate();
  const historyRef = useRef();
  const [historicalData, setHistoricalData] = useState([]);
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    axios.get('http://localhost:5000/api/history')
      .then(res => setHistoricalData(res.data))
      .catch(err => console.error("Erreur lors de la récupération de l'historique",err));
  }, []);


  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
};

useEffect(() => {
  if (selectedDate) {
    axios.get(`http://localhost:5000/api/history/${selectedDate}`)
      .then((res) => {
        console.log("Données historiques :", res.data);
        setHistoricalData(res.data); // ← données brutes pour ton tableau
      })
      .catch((err) => console.error("Erreur :", err));
  }
}, [selectedDate]);

  const handleDownloadPDF = () => {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
  
    const logo = new Image();
    logo.src = SagemcomLogo;
  
    logo.onload = () => {
      // Ajout du logo centré
      const logoWidth = 80;
      const logoHeight = 40;
      // const logoX = (pageWidth - logoWidth) / 2;
      const logoX = 40;
      const logoY = 30;
      pdf.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
  
      // Titre
      pdf.setFontSize(18);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Historique des Mesures',pageWidth / 2, logoY + logoHeight / 2 + 5, { align: 'center' } );
  
      // Construction des données pour autoTable
      const tableColumn = [
        "Date",
        "Heure",
        "Température (°C)",
        "Humidité (%)",
        "Statut Climatiseur",
        "Alerte envoyée",
        "Dépassement de seuil"
      ];
  
      const tableRows = historicalData.map((record) => {
        const [date, time] = (record.createdAt || '').split('T');
        const heure = time ? time.split('.')[0] : '';
        return [
          date,
          heure,
          record.temperature,
          record.humidity,
          record.acStatus ? 'activé' : 'désactivé',
          record.alertSent ? "Oui" : "Non",
          record.thresholdExceeded ? "Oui" : "Non",
        ];
      });
  
      autoTable(pdf, {
        startY: 90,
        head: [tableColumn],
        body: tableRows,
        margin: { top: 90, bottom: 40 },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          halign: 'center',
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
               didParseCell: function (data) {
        // Débogage : afficher le contenu de chaque cellule
        console.log(`Cellule analysée: ${data.cell.text[0]}`);
  const cellText = data.cell.text && data.cell.text[0] ? data.cell.text[0].toLowerCase() : '';

        // Appliquer les couleurs uniquement sur les colonnes "status du climatiseur" , "Alerte envoyée" et "Dépassement de seuil" 
        if (data.section === "body" && (data.column.index === 4 || data.column.index === 5 || data.column.index === 6 )) {
          if (cellText === "oui" || cellText === "activé") {
           data.cell.styles.textColor = [255, 0, 0]; // Rouge

          } else if (cellText === "non" || cellText === "désactivé") {
             data.cell.styles.textColor = [0, 128, 0]; // Vert
          }
        }
      },

        didDrawPage: () => {
          // Footer avec texte et numérotation
          const footerText = "Système de Surveillance Température & Humidité - Sagemcom";
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(footerText, pageWidth / 2, pageHeight - 20, { align: 'center' });
  
          const pageNumber = pdf.internal.getNumberOfPages();
          const totalPages = '{total_pages_count_string}';
          const pageLabel = `${pageNumber} / ${totalPages}`;
          pdf.text(pageLabel, pageWidth - 40, pageHeight - 20);
        }
      });
  
      // Fix total page count
      pdf.putTotalPages('{total_pages_count_string}');
      pdf.save(`historique-${selectedDate}.pdf`);
    };
  };
  
  console.log("Données historiques :", historicalData);

  return (
    <HistoryContainer>
      <Header>
        <Button onClick={() => navigate('/dashboard')}>Retour</Button>
        <Title>Historique des Mesures</Title>
        <ButtonContainer>
          <DateInput
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        max={new Date().toISOString().split('T')[0]}
      />
          <Button onClick={handleDownloadPDF}>Télécharger</Button>
        </ButtonContainer>
      </Header>
      
      <div ref={historyRef}>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Heure</Th>
              <Th>Température (°C)</Th>
              <Th>Humidité (%)</Th>
              <Th>Statut Climatiseur</Th>
              <Th>Alerte envoyée</Th>
              <Th>Dépassement de seuil</Th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(historicalData) ? historicalData : []).map((record, index)  => {
              const [date, time] = (record.createdAt || record.timestamp ||'').split('T');
              const heure = time ? time.split('.')[0] : '';
              return (
                <tr key={index}>
                  <Td>{date}</Td>
                  <Td>{heure}</Td>
                  <Td>{record.temperature}</Td>
                  <Td>{record.humidity || record.humidite}</Td>
                  <Td>{record.acStatus ? 'activé' : 'désactivé'}</Td>
                  <Td>{record.alertSent ? '✅' : '🚫'}</Td>
                  <Td>{record.thresholdExceeded ? '✅' : '🚫'}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </HistoryContainer>
  );
};

export default History;