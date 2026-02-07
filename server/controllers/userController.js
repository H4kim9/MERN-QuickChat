import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup = async(req, res) => {
    const {fullName, email, password, bio} = req.body;
    
    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details !"})
        }

        // if any user is available for this account
        const user = await User.findOne({email});

        if(user){
            return res.json({success: false, message: "Account already exist."})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({fullName, email, password: hashedPassword, bio});

        //create token
        const token = generateToken(newUser._id);

        res.json({success:true, userData: newUser, token, message: "Account created succesfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    // ✅ check email first
    if (!userData) {
      return res.json({
        success: false,
        message: "Invalid email"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userData.password
    );

    // ✅ check password
    if (!isPasswordCorrect) {
      return res.json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      token,
      userData,
      message: "Login Successful"
    });

  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Server error" });
  }
};


//check if the user is authenticated
export const checkAuth = (req, res) =>{
    res.json({success: true, user: req.user})
}

export const updateProfile = async(req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body

        const userId = req.user._id;
        let updateUser;

        if(!profilePic){
            updateUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true})
        
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updateUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }

        return res.json({success: true, user: updateUser});
        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}