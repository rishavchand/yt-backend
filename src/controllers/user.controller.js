import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { response } from "express";

const generateAccessAndRefreshTokens = async(userId) => {
    
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        
    } catch (error) {
        throw new apiError(500, "Access and Token generation failed");
    }

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}

}

const registerUser = asyncHandler( async(req, res) => {
                    const {fullName, password, email} = req.body;

                    if(
                        [ userName, email, fullName, password].some((field) => field?.trim() === "")
                    ){
                        throw new apiError(400, "all fields are required ")
                    }

                    const existedUser =await User.findOne({
                        $or: [{email},{userName}]
                    }
                    )

                    if(existedUser){
                        throw new apiError(409, "user with this email already existed")
                    }

                    const avatarLocalPath = req.files?.avatar[0]?.path;

                    let coverImageLocalPath;
                    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
                        coverImageLocalPath = req.files.coverImage[0].path
                    }

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

const loginUser = asyncHandler( async(req, res) => {
    // req body data
    // user or email
    // user exist or not
    // password check
    // refresh and access token
    // send cookies

    const {email, userName, password} = req.body;

    if(!(userName || email)){
        throw new apiError(400, "userName or enail is required")

    }

    const user = await User.findOne({
        $or: [{userName}, {email}]
    }
    )

    if(!user){
        throw new apiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new apiError(401, "Invalid login credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).JSON(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged in succesfully"
        )
    )


})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new response(200, {}, "User Logged Out"))

})
export {registerUser,
    loginUser,
    logoutUser
} 
