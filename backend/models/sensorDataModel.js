const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  acStatus: {
    type: Boolean,
    default: false 
  },
  alertSent: {
    type: Boolean,
    default: false 
  },
  thresholdExceeded: {
    type: Boolean,
    default: false 
  },
}, { timestamps: true });

const SensorData = mongoose.model('SensorData', sensorDataSchema);
module.exports = SensorData;