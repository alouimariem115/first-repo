const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });



console.log("📧 Email utilisé :", process.env.EMAIL_USER);
console.log("🔐 Mot de passe défini :", process.env.EMAIL_PASS ? "Oui" : "Non");


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAlertEmail = async (subject, message , userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER_DEF, // Tu peux mettre une autre adresse ici si tu veux
    subject: subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi de l’email :', error);
  }
};

module.exports = sendAlertEmail;