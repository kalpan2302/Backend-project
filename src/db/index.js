import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDb connected !! | DB_HOST : ${connectionInstance.connection.host}`)
        // console.log(connectionInstance)
    } catch (error) {
        console.error("MONGODB connection ERROR : ",error)
        process.exit(1)
        // The process.exit() method is used to end the process which is running at the same time with an exit code in NodeJS.
        // Code: It can be either 0 or 1. 0 means end the process without any kind of failure and 1 means end the process with some failure.
    }
}


export default connectDB