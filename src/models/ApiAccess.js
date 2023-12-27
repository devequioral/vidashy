import mongoose from 'mongoose';

const ApiAccessSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    apiaccess: [
      {
        apikey: { type: String, required: true },
        permissions: [
          {
            collection: { type: String, required: true },
            object: {
              name: { type: String, required: true },
              methods: [{ type: String, required: true }],
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ApiAccess =
  mongoose.models.ApiAccess || mongoose.model('ApiAccess', ApiAccessSchema);
export default ApiAccess;
