import dotenv from 'dotenv'
dotenv.config();

import mongoose from 'mongoose';


mongoose.connect(process.env.MONGO_URL).then(()=>console.log('Connected to Database Successfully')).catch((e)=>console.log(e));

const UserSchema=mongoose.Schema({
    username:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    cpassword:{
        type:String
    }
})


const UserModel=mongoose.model('Users',UserSchema);
export default UserModel;