import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true

    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },

    fullname: {
        type: String,
        required: true,
        index: true,
        trim: true

    },

    avatar: {
        type: String, // cloudinary string
        required: true
    },

    coverImage: {
        type: String
    },

    watchHistort: [
        {
            type: Schema.Types.ObjectID,
            ref: "Video"
        }
    ],

    password: {
        type: String,
        required: [true, 'password is required']
    },
    
    refreshToken: {
        type: String
    }
    
},
{
    timestamps: true
});

userSchema.pre("save", async function (next) {
        if(!this.isModified("password")) return next();
        
        this.password = await bcrypt.hash("password", 10)
        next();

})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiredIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiredIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)