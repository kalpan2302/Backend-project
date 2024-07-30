import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    fullname: {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar :{
        type : String,  //clodinary url
        required : true,
    },
    coverImage :{
        type : String,  //clodinary url
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password : {
        type : String,
        required : [true , "Password is required"]
    },
    refreshToken :{
        type : String
    }

},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await  bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn :process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn :process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const  User = mongoose.model("User",userSchema)   // create collection


// to insret data into User

/*
const userData =  new User({
        username : "kalpan ",
        email : "kalpan.s.23@gmail.com",
        fullname : "Bariya",
        avatar : "https://cloud.com",
        passwoard : "12333"
})

userData.save();
*/


// we need to put it async await ...

/*
const insertdata = async ()=>{
    try{
        const userData =  new User({
            username : "kalpan ",
            email : "kalpan.s.23@gmail.com",
            fullname : "Bariya",
            avatar : "https://cloud.com",
            passwoard : "12333"
    })
        const result = await userData.save();
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
}

insertdata();
*/


// insert many document into collection

/*
const insertdata = async ()=>{
    try{
        const userData =  new User({
            username : "kalpan ",
            email : "kalpan.s.23@gmail.com",
            fullname : "Bariya",
            avatar : "https://cloud.com",
            passwoard : "12333"
        })

        const user1Data =  new User({
            username : "kalpan2 ",
            email : "kalpan2.s.23@gmail.com",
            fullname : "Bariya2",
            avatar : "https://cloud.com",
            passwoard : "123334"
        })

        const result = await User.insertMany([userData,user1Data]);
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
}

*/


// read data from collection

/*
const readData = async ()=>{
    try{
        const result = await User.find({name:"kalpan"}).select({_id:0,email:1}).limit(1);
        console.log(result)
    }
    catch(err){
        console.log(err)
    }
}

readData();

*/

// update document

/*

const updateData = async (_id)=>{
    try{
        const result = await User.findByIdAndUpdate({_id},{   // wee can use update also that will not show updated data where as findbyid show previous data and update it
            $set : {
               name :"kp" 
            }
        },
        {
            useFindAndModify : false
        }
    );
        console.log(result)
    }
    catch(err){
        console.log(err)
    }
}

updateData("id");

*/


// delete the document

/*

const deleteData = async (_id)=>{
    try{
        const result = await User.deleteMany({_id}); // we can use findByIdAndDelete also
        console.log(result)
    }
    catch(err){
        console.log(err)
    }
}

deleteData("id");

*/
