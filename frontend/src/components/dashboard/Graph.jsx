import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import styled from "styled-components";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const GraphContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 1rem auto;
  width: 90%;
  min-height: 80vh;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-top: 20px;
  width: 100%;
  background: transparent;
  z-index: 2;
  position: relative;
`;

const Button = styled.button`
  padding: 0.6rem 1.5rem;
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

const Titre = styled.h2`
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

const Graph = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartData, setChartData] = useState([]);
  const graphRef = useRef(null);

  useEffect(() => {
    fetchHistoricalData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const fetchHistoricalData = async (date) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/data/day/${date}`);
      const { labels, datasets } = response.data;

      const formattedData = labels.map((label, index) => ({
        time: label,
        temperature: datasets[0]?.data[index],
        humidity:datasets[1]?.data[index],
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données historiques :", error);
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const dateNow = new Date().toLocaleString();
    const logoPath = '/LOGO.png';

    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      html2canvas(graphRef.current).then((canvas) => {
        const imgDataGraph = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();

        pdf.addImage(img, 'PNG', 10, 10, 40, 20); // logo
        pdf.setFontSize(12);
        pdf.text(`Date : ${dateNow}`, pageWidth - 80, 20);
        pdf.setFontSize(16);
        pdf.setTextColor(0, 102, 204);
        pdf.text('Graphique Température & Humidité', pageWidth / 2, 50, { align: 'center' });

        const imgProps = pdf.getImageProperties(imgDataGraph);
        const pdfWidth = pageWidth - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgDataGraph, 'PNG', 10, 60, pdfWidth, pdfHeight);

        // Ajouter un footer avec un texte
        const footerText = "Système de Surveillance Température & Humidité - Sagemcom";
        pdf.setFontSize(10);
        pdf.setTextColor(150);  // Gris pour le footer
        pdf.text(footerText, pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

        pdf.save('graphique-temperature-humidite.pdf');
      });
    };
  };

  return (
    <GraphContainer>
      <Header>
        <Button onClick={() => window.history.back()}>Retour</Button>
        <Titre>Graphique</Titre>
        <Button onClick={handleDownloadPDF}>Télécharger</Button>
      </Header>

      <DateInput
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        max={new Date().toISOString().split('T')[0]}
      />

      <div ref={graphRef}>
        <ResponsiveContainer width="100%" height={400}>
          {chartData.length > 0 ? (
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <RechartsLine
                type="monotone"
                dataKey="temperature"
                stroke="#ff7300"
                name="Température (°C)"
              />
              <RechartsLine
                type="monotone"
                dataKey="humidity"
                stroke="#387908"
                name="Humidité (%)"
              />
              <ReferenceLine y={28} label="Seuil Température" stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={60} label="Seuil Humidité" stroke="blue" strokeDasharray="3 3" />
            </LineChart>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              Aucune donnée disponible pour cette période
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </GraphContainer>
  );
};

export default Graph;
