import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credential: true
}))

// data configuration for url and json data
app.use(express.json({
    limit : "16kb"
}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRoute from './routes/user.routes.js'

//routes declare

app.use("/api/v1/users",userRoute)


export {app}