// const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

// async function testEmail() {
//   // Afficher les variables d'environnement (masquer le mot de passe)
//   console.log('Configuration:', {
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     user: process.env.EMAIL_USER,
//     passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
//   });

//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com', // En dur pour le test
//     port: 587,
//     secure: false, // Le mode non-sécurisé, mais tu peux aussi utiliser `true` avec port 465
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     debug: true,
//     logger: true
//   });

//   try {
//     // Envoi du mail
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER, // L'adresse d'envoi
//       to: process.env.EMAIL_USER, // L'adresse de réception (toi-même)
//       subject: "Test Email",
//       text: "Si vous recevez ceci, l'envoi d'email fonctionne !",
//       html: "<b>Si vous recevez ceci, l'envoi d'email fonctionne !</b>",
//     });

//     console.log("Email envoyé:", info.response);
//   } catch (error) {
//     console.error("Erreur lors de l'envoi:", error);
//   }
// }

// // Lancer le test
// testEmail();

const sendAlertEmail = require('./emailConfig.js');

sendAlertEmail('Test', 'Ceci est un test d’alerte email');
