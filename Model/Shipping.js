import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'

mongoose.connect(process.env.MONGO_URL).then(()=>console.log('connected to db successfully'));


const orderSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  count: Number,
  image:String,
  size:String
});

const ShippingSchema={
    Name:{
        type:String
    },
    email:{
        type:String
        
    },
    street:{
        type:String

    },
  city:  {
    type:String
    },
    mobile:{
        type:String
    },
    pincode:{
type:String
    },
    state:{
        type:String

    },
    payment:{
        type:String
    },
    Order:{
        type:[orderSchema]
    }
}

const ShippingModel=mongoose.model('shipping',ShippingSchema);

export default ShippingModel;