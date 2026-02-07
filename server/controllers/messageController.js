import Message from "../models/Message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from '../server.js';

//Get All users exept the logged in user
export const getUserForSidebar = async (req, res) =>{
    try {
        const userId = req.user._id;

        //filter all the users and exclude that userId
        const filterUsers = await User.find({_id: {$ne: userId}}).select("-password") // !== userId

        //count number of message unseen
        const unseenMessages = {}
        const promises = filterUsers.map(async(user) => {
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false});
            
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length
            }
        })

        //execute the promise
        await Promise.all(promises)

        res.json({success: true, users: filterUsers, unseenMessages})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//get all the messages for the selected users
export const getMessages = async (req, res) => {
    try {
        const {id: selectedUserId } = req.params;
        const myId = req.user._id;

        //get the messages
        const message = await Message.find({$or: [
            {senderId: myId, receiverId: selectedUserId},
            {senderId: selectedUserId, receiverId: myId},
        ]});

        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages: message})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to mark message as seen using message id
export const markMessageAsSeen = async(req, res) =>{
    try {
        const { id } = req.params;

        await Message.findByIdAndUpdate(id ,{seen: true});

        res.json({success: true})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})        
    }
}

export const sendMessage = async(req, res) =>{
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;   // URL param
        const senderId = req.user._id;      // from JWT middleware


        //if we have the image upload it to cloudinary
        let imageUrl;

        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)

            //after we upload the image we get the image URL
            imageUrl = uploadResponse.secure_url;
        }
        
        //store the message data in the data base
        const newMessage = await Message.create({ senderId, receiverId, text, image: imageUrl })

        // Emlit the new messsage to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId]

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        res.json({success: true, newMessage});

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})            
    }
}