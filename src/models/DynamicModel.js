import mongoose from 'mongoose';

//CREATE SCHEMA FOR COLLECTION DYnamically

const getDynamicSchema = (collectionName, schemaObj, timestamps = true) => {
  const schema = new mongoose.Schema(schemaObj, {
    timestamps,
  });

  return (
    mongoose.models[collectionName] || mongoose.model(collectionName, schema)
  );
};

export { getDynamicSchema };
