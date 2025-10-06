//authController.js

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mqttService = require('../MQTT/mqttClient');

let ioInstance; // Pour stocker l'objet io
// Méthode pour injecter 'io' dans ce contrôleur
exports.setSocketIO = (io) => {
  ioInstance = io;
};

// Configuration du transporteur d'email avec plus de logs
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Activer le mode debug
  logger: true // Activer les logs
});

exports.register = async (req, res) => {
  try {
    console.log('=== Début de l\'inscription ===');
    console.log('Données reçues:', JSON.stringify(req.body, null, 2));

    const { username, email, password } = req.body;

    // Validation détaillée
    const validationErrors = [];
    if (!username) validationErrors.push('Username is required');
    if (!email) validationErrors.push('Email is required');
    if (!password) validationErrors.push('Password is required');

    if (validationErrors.length > 0) {
      console.log('Erreurs de validation:', validationErrors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Vérification de l'utilisateur existant
    console.log('Vérification de l\'utilisateur existant...');
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      console.log('Utilisateur existant trouvé:', {
        existingEmail: existingUser.email,
        existingUsername: existingUser.username
      });
      return res.status(400).json({
        message: 'L\'utilisateur existe déjà',
        field: existingUser.email === email.toLowerCase() ? 'email' : 'username'
      });
    }

    // Création de l'utilisateur
    console.log('Création du nouvel utilisateur...');
    const user = new User({
      username,
      email: email.toLowerCase(),
      password
    });

    console.log('Sauvegarde de l\'utilisateur...');
    await user.save();
    console.log('Utilisateur sauvegardé avec succès. ID:', user._id);

    // Génération du token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '30d' }
    );

    // Réponse
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

    console.log('=== Fin de l\'inscription ===');

  } catch (error) {
    console.error('=== Erreur lors de l\'inscription ===');
    console.error('Type d\'erreur:', error.name);
    console.error('Message d\'erreur:', error.message);
    console.error('Stack trace:', error.stack);

    // Gestion spécifique des erreurs MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate key error',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Tentative de connexion avec:', req.body);
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis'
      });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email });
    console.log('Utilisateur trouvé:', user ? 'oui' : 'non');

    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification du mot de passe
    const isMatch = await user.comparePassword(password);
    console.log('Mot de passe correct:', isMatch ? 'oui' : 'non');

    if (!isMatch) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Création du token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
// ✅ Appel de setupMQTT juste après l'authentification
    if (ioInstance) {
      mqttService.setupMQTT(ioInstance, token); // Passer io et token
      console.log('MQTT configuré pour cet utilisateur.');
    } else {
      console.warn('⚠️ ioInstance non défini. MQTT non initialisé.');
    }

    // Réponse réussie
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cet email' });
    }

    // Générer un token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Créer le lien de réinitialisation
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Configurer l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur ce lien pour définir un nouveau mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Un email de réinitialisation a été envoyé à votre adresse email.' });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Trouver l'utilisateur avec le token valide et non expiré
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Le token de réinitialisation est invalide ou a expiré'
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Votre mot de passe a été réinitialisé avec succès' });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
};