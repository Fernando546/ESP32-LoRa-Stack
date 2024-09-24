import mongoose from 'mongoose';

const measureRequestSchema = new mongoose.Schema({
  request: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MeasureRequest = mongoose.models.MeasureRequest || mongoose.model('MeasureRequest', measureRequestSchema);
export default MeasureRequest;
