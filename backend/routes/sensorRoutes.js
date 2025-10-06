const express = require('express');
const router = express.Router();
const SensorData = require('../models/sensorDataModel');
const transporter = require('../email/emailConfig');
const emailCooldown = require('../email/emailCooldown');

//  Route pour enregistrer les données venant de l'ESP32
router.post('/history', async (req, res) => {
    console.log('Utilisateur connecté :', req.user); // <-- Ajout
  try {
    const { temperature, humidity, acStatus = false, alertSent = false } = req.body;

    // Vérification des seuils
    const thresholdExceeded = temperature > 26 || humidity > 60;
    let shouldSendAlert = false;

    if (thresholdExceeded) {
      shouldSendAlert = true;
      console.log(`Temp: ${temperature} | Hum: ${humidity} | Seuil dépassé: ${thresholdExceeded}`);

      
      // Vérifier si on peut envoyer un email
      if (emailCooldown.canSendEmail('threshold_alert')) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER_DEF,
          subject: '⚠️ Alerte : Seuils dépassés',
          html: `
            <h2>Alerte de Surveillance</h2>
            <p>Les seuils ont été dépassés :</p>
            <ul>
              <li>Température : ${temperature}°C ${temperature > 26 ? '(Seuil dépassé)' : ''}</li>
              <li>Humidité : ${humidity}% ${humidity > 60 ? '(Seuil dépassé)' : ''}</li>
            </ul>
            <p>Date et heure : ${new Date().toLocaleString('fr-FR')}</p>
          `
        };
        console.log('Tentative d\'envoi de mail à :', req.user.email);
console.log('Contenu de l\'email:', mailOptions);


        try {
          await transporter.sendMail(mailOptions);
          console.log('Email d\'alerte envoyé avec succès');
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        }
      } else {
        const timeLeft = emailCooldown.getTimeUntilNextEmail('threshold_alert');
        console.log(`Email non envoyé. Prochain email possible dans ${timeLeft} secondes`);
      }
    }

    // Pour une alerte critique
    if (temperature > 27) {
      if (emailCooldown.canSendEmail('critical_alert')) {
        // Envoyer email d'alerte critique
      }
    }

    // Pour un rapport quotidien
    if (emailCooldown.canSendEmail('daily_report')) {
      // Envoyer rapport quotidien
    }

    // Création et sauvegarde d'une nouvelle entrée
    const newEntry = new SensorData({
      temperature,
      humidity,
      acStatus: shouldSendAlert || acStatus,
      alertSent: shouldSendAlert || alertSent,
      thresholdExceeded
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement des données:', err);
    res.status(500).json({ message: err.message });
  }
});

// Route pour vérifier le statut du cooldown
router.get('/email-status', (req, res) => {
  const timeLeft = emailCooldown.getTimeUntilNextEmail('threshold_alert');
  res.json({
    canSendEmail: timeLeft === 0,
    timeUntilNextEmail: timeLeft
  });
});

// Route pour récupérer les valeurs
router.get('/history', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const history = await SensorData.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history/:date', async (req, res) => {
  try {
    const selectedDate = new Date(req.params.date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    const data = await SensorData.find({
      createdAt: {
        $gte: selectedDate,
        $lt: nextDay,
      }
    }).sort({ createdAt: 1 });

    res.json(data); // <-- retourne un tableau brut pour le tableau HTML
  } catch (error) {
    console.error('Erreur dans /history/:date :', error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/data/day/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    console.log('Date reçue:', req.params.date);
    console.log('Date parsée:', date);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Recherche entre:', {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    const data = await SensorData.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort('createdAt');

    console.log('Nombre de données trouvées:', data.length);
    if (data.length > 0) {
      console.log('Premier enregistrement:', data[0]);
      console.log('Dernier enregistrement:', data[data.length - 1]);
    }
    const labels = data.map(doc => new Date(doc.createdAt).toLocaleTimeString());
    const temperature = data.map(doc => doc.temperature);
    const humidity = data.map(doc => doc.humidity ?? 0);
    res.json({ labels,
      datasets: [
        { label: "Température", data: temperature },
        { label: "Humidité", data: humidity }
      ]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;  