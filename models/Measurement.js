import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  soilMoisture: { type: Number, required: true },
  relayState: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  newMeasurement: { type: Number, required: true },
});

const Measurement = mongoose.models.Measurement || mongoose.model('Measurement', measurementSchema);
export default Measurement;
