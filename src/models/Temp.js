import mongoose from 'mongoose';

const TempSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Temp = mongoose.models.Temp || mongoose.model('Temp', TempSchema);
export default Temp;
