import dotenv from 'dotenv'
dotenv.config()

import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL).then(()=>console.log('db Successfully connect')).catch((e)=>console.log(e));


const ContactSchema=mongoose.Schema({
    name:String,
    email:String,
    message:String
})


const ContactModel=mongoose.model('Contact',ContactSchema);
export default ContactModel;