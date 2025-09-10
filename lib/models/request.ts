import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'researcher', 'staff', 'admin'], required: true },
  phone: String,
  about: String,
  passportNumber: String,
  directorApprovalUrl: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);