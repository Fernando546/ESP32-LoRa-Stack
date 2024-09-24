import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  soilMoisture: {
    type: Number,
    required: true,
  },
  relayState: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const DataModel = mongoose.models.Data || mongoose.model('Data', dataSchema);

export default DataModel;
