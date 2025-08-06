import mongoose from "mongoose";
import { MONGO_URI } from "./serverConfig.js";


export const connectDB = async function () {
    try {
        await mongoose.connect("mongodb+srv://nt:12345@ass0.tdw4aap.mongodb.net/?retryWrites=true&w=majority&appName=ass0");
        console.log(`connected to mongoDb database${mongoose.connection.host}`)
    } catch (error) {   
        console.log(error,'Soemthing went wrong');
    }
};