
require('dotenv').config();
const mqtt       = require('mqtt');
const SensorData = require('../models/sensorDataModel');
const axios = require('axios');
const sendAlertEmail = require ('../email/emailConfig.js');


const MQTT_URL       = 'mqtt://192.168.1.7';
const TOPIC_CAPTEURS  = 'salleServeur/data/capteurs';   
const TOPIC_COMMANDE  = 'salleServeur/data/commande';   
const TEMP_THRESHOLD = 26;
const HUM_THRESHOLD = 60;



let io = null;                              
let lastACStatus = false; 
let lastAlertTempSent = false;
let lastAlertHumSent = false;

function setupMQTT(passedIo) {
  io = passedIo;

  const client = mqtt.connect(MQTT_URL);

  client.on('connect', () => {
    console.log('✅  MQTT connecté');
    client.subscribe(TOPIC_CAPTEURS, err =>{
      if (err) {
        console.error('🚨  Abonnement échoué', err);
      } else {
        console.log('📡  En écoute sur', TOPIC_CAPTEURS);
      }
    });
  }); 
  client.on('error', (err) => {
    console.error('🚨  MQTT connexion erreur :', err);
  });

  client.on('message', async (_, raw) => {
    try {
      const { temperature, humidite } = JSON.parse(raw.toString());  
      if (typeof temperature !== 'number' || typeof humidite !== 'number') {
        console.error('❌ Données invalides reçues:', { temperature, humidite });
        return;
      }
      const thresholdExceeded = temperature > TEMP_THRESHOLD;
      const acStatus          = thresholdExceeded;
      const alertSent         = thresholdExceeded;

      const entry = await SensorData.create({
        temperature,
        humidity: humidite,
        acStatus,
        alertSent,
        thresholdExceeded
      });

      console.log('💾  enregistré:', entry.temperature, '°C', entry.humidity, '%');
 
    
      if (temperature > TEMP_THRESHOLD && !lastAlertTempSent ) {
        sendAlertEmail('⚠️ Température élevée', `🔥 La température est de ${temperature}°C`);
        console.log('📧 Email température envoyé');
          lastAlertTempSent = true;
        } else if (temperature <= TEMP_THRESHOLD) {
          lastAlertTempSent = false;
        }


      if (humidite > HUM_THRESHOLD && !lastAlertHumSent) {
        sendAlertEmail('⚠️ Humidité élevée', `💧 L’humidité est de ${humidite}%`);
        console.log('📧 Email humidité envoyé');
          lastAlertHumSent = true;
        } else if (humidite <= HUM_THRESHOLD) {
          lastAlertHumSent = false;
      }

      if (io) {
        io.emit('SensorData', { temperature, humidity: humidite });
        
      let alerte = "";
      
      
      if (temperature > TEMP_THRESHOLD ) {
        alerte = `🔥 Température élevée détectée : ${temperature}°C`;
      } else if (humidite >  HUM_THRESHOLD) {
        alerte = `💧 Humidité élevée détectée : ${humidite}%`;
      }
    
      if (alerte ) {
        io.emit('Alerte', { message: alerte });
      }
    
      setTimeout(() => {
        const message = acStatus
          ? "🌀 Climatiseur activé "
          : "❄️ Climatiseur désactivé ";
          
          io.emit('Alerte', { message });
        }, 5000);
    
    } else {
      console.warn('⚠️  Socket.io non initialisé');
    }
      // ⚡ ENVOI COMMANDE AU ESP32
      const commande = thresholdExceeded ? 'ON' : 'OFF';
      client.publish(TOPIC_COMMANDE, commande);
      console.log(`📤 Commande envoyée : ${commande}`);
      
    } catch (err) {
      console.error('🚨  MQTT parse/save error:', err);
    }
  });
}

module.exports = setupMQTT;

