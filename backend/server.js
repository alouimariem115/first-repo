const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const socketIo = require('socket.io');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', sensorRoutes);   



//MQTT
app.get('/', (req, res) => {
  res.send('Serveur MQTT prêt');
});


// MongoDB connection with detailed error logging
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('MongoDB connection error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
const FRONT_URL = 'http://localhost:5173';

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Données invalides', error: err.message });
  }
  res.status(500).json({
    message: 'Une erreur est survenue, veuillez réessayer plus tard.',
    error: err.message
  });
});

const {Server} = require('socket.io');
const io = new Server(server, {
  cors: {
    origin:  FRONT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});


io.on('connection', (socket) => {

 
  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté');
  });
});




const setupMQTT = require('./MQTT/mqttClient'); // Assure-toi du bon chemin
setupMQTT(io); // <-- ici tu passes io à ton fichier MQTT

module.exports = { io };


