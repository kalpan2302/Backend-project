// require("dotenv").config({path :'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({ 
    path : './.env'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{               // on occuring of error the callback is fire
        console.log("ERROR : ",error)
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Mongodb connection failed !!!",error)
})



























/*
import express from "express"
const app = express()

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR :",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listen on port : ${process.env.PORT}`)
        })
    } catch (error) {
        console.console.error("ERROR :",error)
        throw error
    }
})()
*/