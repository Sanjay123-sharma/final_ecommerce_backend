import dotenv  from "dotenv";
dotenv.config();
import { gql } from "apollo-server-core";
import Products from './Products.json' assert { type: "json" }
import UserModel from "./Model/Users.js";
import ContactModel from "./Model/Contact.js";
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from "jsonwebtoken";
import ShippingModel from "./Model/Shipping.js";

let transporter=nodemailer.createTransport({
     host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // false for TLS (587), true for SSL (465)
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
})

transporter.verify((error,success)=>{
    if(error){
        console.log(error)
    }else{
        console.log('Server is ready to send emails',success)
    }
})
const optStore=new Map();

export const typeDefs=gql`
type Query{
products:[Product]
users:[User]
shippingUser:[ShippingUser]
order:[Order]
contact:[Contact]

}



type Contact{
name:String!
email:String!
message:String!
}



type Order{
id:Int
title:String
price:Int
count:Int
image:String
size:String
}

input OrderInput{
id:Int
title:String
price:Int
count:Int
image:String
size:String
}

type ShippingUser{
Name:String!,
email:String!,
street:String!,
city:String!,
pincode:String!,
payment:String!,
state:String,
mobile:String!
Order:[Order]
}

type User{
username:String!
email:String!
password:String!
cpassword:String!
otp:String
}

type Product{
id:Int!
title:String!
price:Int!
description:String!
category:String!
inStock:Boolean!
image:String!
}

type Token{
token:String!
}

type Mutation{
sendOtp(email:String!):String
createUser(username:String!,email:String!,password:String!,cpassword:String!,otp:String):User
loginUser(email:String!,password:String!):Token
createShippingUser(Name:String!,email:String!,street:String,pincode:String!,state:String!,city:String!,payment:String!,mobile:String!,Order:[OrderInput]):ShippingUser
sendMail(email:String!,OrderSummary:String!):String
createContactRequest(name:String!,email:String!,message:String!):Contact
sendRequestMail(email:String!,message:String):String
updateUser(email:String!,password:String!):User
}
`

export const resolvers={
    Query:{
        products:()=>Products,
        users:async(_,)=>await UserModel.find(),
        shippingUser: async (_,) => await ShippingModel.find(),
        contact:async(_)=>await ContactModel.find(),
    },

    Mutation:{
        sendOtp:async(_,{email})=>{
            const otp=Math.floor(100000+Math.random()*900000).toString();

            optStore.set(email,otp);

            await transporter.sendMail({
                from: 'BagsPacks <sanjukumar595857@gmail.com>',
                to:email,
                subject:'Your OTP Code',
                text:`Your OTP is ${otp}  <br>
                <h1>Do not Share it with Anyone</h1>

                `
            })
            return "OTP Sent";

            
        },
       sendMail: async (_, { email, OrderSummary }) => {
  try {
    await transporter.sendMail({
      from: 'BagsPacks <sanjukumar595857@gmail.com>',
      to: email,
      subject: 'Your Order Details',
      html: `
        <h2>Your Order Summary</h2>
        <p>${OrderSummary}</p>
        <p>Thank you for shopping with us!</p>
      `,
    });

    return "Mail Sent";
  } catch (error) {
    console.error("Failed to send mail:", error);
    return "Failed to send mail";
  }
}
,
        createUser:async(_,{username,email,password,cpassword,otp})=>{
            const storedOtp=optStore.get(email);

            if(!storedOtp || storedOtp!==otp){
                return 'Invalid OTP'
            }
            const User=await UserModel.findOne({email});
            if(User) {
                return ('User Already Exist')
            }
            const hashedPassword=await  bcrypt.hash(password,10);
            const newUser=await UserModel({
                username,
                email,
                password:hashedPassword,
                cpassword
            })
            optStore.delete(email);
            return newUser.save();

        },
        loginUser:async(_,{email,password})=>{
            const User=await UserModel.findOne({email})
            if(!User){
                return  new Error('User Not Found')
            }

            const isMatch=bcrypt.compare(password,User.password);
            if(!isMatch){
                return console.log('Password Not Match')

            }
            const token=jwt.sign({email:email},process.env.SECRET_KEY,{expiresIn:'0.5h'});
            console.log('Login Successfully');
            return {token}
            
        },
        createShippingUser:async(_,{Name,email,city,street,state,mobile,pincode,payment,Order})=>{
            const User=await UserModel.findOne({email})
            if(!User){
                return "User Must be Logged In"
            }
            else{
                
                const newShippingUser=await new ShippingModel({
                    email,
                    Name,
                    street,
                    city,
                    state,
                    mobile,
                    pincode,
                    payment,
                    Order:Order
                })
                console.log("Shipping Details Saved")
                return newShippingUser.save();
            }
        },
        createContactRequest:async(_,{name,email,message})=>{
           
            const User=await UserModel.findOne({email});
            if(!User){
                return {
                    message:'User must be logged In'
                }
            }
            if(User){
                const newRequest=await new ContactModel({
                    name,
                    email,
                    message
                })
                console.log('request submitted')
                return newRequest.save()
            }
        },
        sendRequestMail:async(_,{email,message})=>{
           try {
             await transporter.sendMail({
                from:'BagsPacks <sanjukumar595857@gmail.com>',
                to:email,
                subject:"Request",
                html:`
                <h4>We have successfully submitted you request and the problem you faced ${message}</h4>
                <h5>The request ID is :${Date.now()}</h5> <br/>
                Our Team will reach you soon <br>
                Regards,   
                `

            })
            return "send request successfully"
            
           } catch (error) {
            console.log(error,'issue to send request')
            
           }
        },
        updateUser:async(_,{email,password})=>{
            const User=await UserModel.findOne({email})
            if(!User){
                return {
                    message:'User Not Found'
                }
            }
            const hashedPassword=await bcrypt.hash(password,10);
            const updateUser=await UserModel.findOneAndUpdate(
                {email},
                {$set:{password:hashedPassword}},
             
            )

            console.log('Updated Successfully')
            return updateUser
        },
       
       
    }

}

