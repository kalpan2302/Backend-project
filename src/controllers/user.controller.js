import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import {User} from  "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId)=>{
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken, refreshToken}

  }
  catch(error){
    throw new ApiError(500,"Something went wrong while generating referesh and access tokens")
  }
}

const registerUser = asyncHandler(async (req,res) =>{
    // get user details from frontend ..
    // validation - not empty
    // check is user already exist.. - user name and email
    // check for images , check for avatars
    // upload them to cloudinary , avatar
    // create user object  - create entry in db
    // remove password and refresh tokens field from response
    // check for user creation
    //return response

    const {fullname, email, username , password} = req.body
    console.log("Email :",email)
    // console.log(req.body)

    // if(fullname ===""){
    //     throw new ApiError(400,"Fullname is required")
    // }
    if(
        [fullname,email,username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All field are required")
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with same name or email exist")
    }

    // console.log(req.files)   // req.files is given by multer
   const avatarLocalPath =  req.files?.avatar[0]?.path; 
  //  const coverImageLocalPath  = req.files?.coverImage[0]?.path;

    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
      coverImageLocalPath = req.files.coverImage[0].path
    }

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }
//    console.log(avatarLocalPath)

  const avatar =  await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"Avatar file is required!!")
  }

  const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while register the user!!")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
  )
})

const loginUser = asyncHandler(async (req,res)=>{
    // req body -> data
    // username or email
    // find the user 
    // password check
    // access and refresh tokens
    // send cookies

    const {username , email , password} = req.body

    if(!(username || email)){
      throw new ApiError(400, "username or email is requied!!")
    }

    const user = await User.findOne({
        $or: [{email} , {username}]
      })

      if(!user){
        throw new ApiError(404, "User does not exist")
      }

     const isPasswordValid=  await user.isPasswordCorrect(password)

     if(!isPasswordValid){
      throw new ApiError(401,"Invalid User credentials!!")
     }

     const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id)

     const loggedInUser  = await User.findById(user._id).select(
      "-password -refreshToken"
     )

     //options for cookies

     const options = {
      httpOnly: true,
      secure : true
     }

     res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
          200,
          {
            user : loggedInUser, accessToken,refreshToken
          },
          "user logged in successfully"
        )
     )
})

const logOutUser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly: true,
    secure : true
   }

   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(
    new ApiResponse(200,{},"user logged out")
   )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incommingRefreshToken  =  req.cookies.refreshToken || req.body.refreshToken

  if(!incommingRefreshToken){
    throw new ApiError(401,"Unauthorized Request!!")
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
  
    if(incommingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used!")
    }
  
    const options = {
      httpOnly:true,
      secure : true
    }
  
    const { accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      200,
      {
        accessToken,
        refreshToken: newRefreshToken
      },
      "AccessToken refreshed successfully"
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "invalid refreshtoken")
  }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await  user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid Password!!")
  }
  user.password = newPassword
  await  user.save({validateBeforeSave:false})

  return res.status(200)
  .json(
    new ApiResponse(200,{},"Password Changed Successfully!!")
  )

})

const getCurrentUser  = asyncHandler(async (req,res)=>{
  return res.status(200)
  .json(200,req.user,"Current user fetched successfully!!")
})


// text update 
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname, email,} = req.body

    if(!fullname || !email){
      throw new ApiError(400,"All Fields are required!")
    }

    const user =  await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set :{
          fullname,        // fullname :fullname this both are same..
          email : email
        }
      },
      {new : true}
    ).select("-password")

    return res.status(200).json(
      200,user,"Account deatils updated successfully!!"
    )

})

// file update 
const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing!!")
  }

  const avatar =  await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
     throw new ApiError(400,"Error while uploading the avatar!!")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar : avatar.url
      }
    },
    { new : true}
  ).select("-password")
  
  return res.status(200).json(
    200,user,"Avatar updated successfully!!"
  )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400, "Avatar file is missing!!")
  }

  const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
     throw new ApiError(400,"Error while uploading the avatar!!")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage : coverImage.url
      }
    },
    { new : true}
  ).select("-password")
  
  return res.status(200).json(
    200,user,"CoverImage updated successfully!!"
  )
})

export {
  registerUser,
  loginUser ,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage 
}