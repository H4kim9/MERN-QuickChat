import jwt from "jsonwebtoken"
import User from "../models/user.js";

//Only if the user is authenticated he can access that particulare api endpoint
export const protectRoute = async (req, res, next) =>{
    try {

        //the token usually comes from the headers
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // remove the password for securety after returning the authenticated user data
        const user = await User.findById(decoded.userId).select("-password") 

        if(!user){
            return res.json({success: false, message: 'User Not Found.'})
        }

        req.user = user;
        next();

    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

// userId comes from req.user because the auth middleware decoded the JWT, fetched the user from the database, 
// and attached it to the request before updateProfile runs.