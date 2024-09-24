import mongoose from 'mongoose';

const instructionSchema = new mongoose.Schema({
  command: { type: Number, required: true }, // Zmieniamy typ na Number
  createdAt: { type: Date, default: Date.now },
});


const Instructions = mongoose.models.Instructions || mongoose.model('Instructions', instructionSchema);
export default Instructions;
