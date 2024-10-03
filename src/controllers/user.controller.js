import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async(req, res) => {
                    const {fullName, password, email} = req.body;
                    console.log("Email: ", email)

                    if(
                        [ userName, email, fullName, password].some((field) => field?.trim() === "")
                    ){
                        throw new apiError(400, "all fields are required ")
                    }

                    const existedUser = User.findOne({
                        $or: [{email},{userName}]
                    }
                    )

                    if(existedUser){
                        throw new apiError(409, "user with this email already existed")
                    }

                    const avatarLocalPath = req.files?.avatar[0]?.path;
                    const coverImageLocalPath = req.files?.coverImage[0]?.path;

                    if(!avatarLocalPath){
                        throw new apiError(400, "Avatar image is required")
                    }

                    const avatar = await uploadOnCloudinary(avatarLocalPath);
                    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

                    if(!avatar){
                        throw new apiError(400, "Avatar image is required")
                    }

                    const user = await User.create({
                        fullName,
                        avatar: avatar.url,
                        coverImage: coverImage?.url || "",
                        email, 
                        password,
                        username: username.toLowerCase()
                    })

                    const createdUser = await User.findById(user._id).select(
                        "-password -refreshToken"
                    )

                    if(!createdUser){
                        throw new apiError(500, "something went wrrong while registering user")
                    }

                    return res.status(201).JSON(
                        new apiResponse(200, createdUser, "User registered successfully!")
                    )
})
export {registerUser} 
