import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'researcher', 'staff', 'admin'], default: 'user' },
  phone: String,
  about: String,
  passportNumber: String,
  directorApprovalUrl: String,
  exhibitsCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  notificationsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);