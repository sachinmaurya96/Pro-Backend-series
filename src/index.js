import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:"./.env"
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("error", error)
        throw error
      })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port : ${process.env.PORT}`)
    })
})
.catch(error=>{
    console.log("mongo db connection failed !!! ",error)
})



/*
const app = express()
;(async ()=> {
    try{
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("error", error)
        throw error
      })
      app.listen(process.env.PORT,()=>{
        console.log(`app is listening on port ${process.env.PORT}`)
      })
    }catch(error){
        console.log("error: ", error)
        throw err
    }
})()
*/