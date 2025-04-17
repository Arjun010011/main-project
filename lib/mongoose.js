import mongoose from "mongoose";

const mongo_uri = process.env.MONGO_URI;
if (!mongo_uri) {
  console.log("uri is not found");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(mongo_uri);
    isConnected = true;
    console.log("mongodb connected successfully");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
