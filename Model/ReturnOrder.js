import dotenv from 'dotenv'
dotenv.config();
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL).then(()=>console.log('Connected to Db ')).catch((e)=>console.l
(e));

const ReturnSchema=new mongoose.Schema({
    id:Number,
    title:String,
    image:String,
    price:Number,
    count:Number,
    size:String,
    email:String
})

const ReturnModel=mongoose.model('return_order',ReturnSchema);
export default ReturnModel;