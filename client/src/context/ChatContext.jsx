/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({children}) => {


    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext);

    //get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/message/users');

            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //get messages for selected users
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/message/${userId}`)

            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //send message to selected user
    const sendMessage = async(message) => {
        try {
            const {data} = await axios.post(`/api/message/send/${selectedUser._id}`, message);

            if(data.success){
                setMessages((prevMessages) =>
                    Array.isArray(prevMessages)
                        ? [...prevMessages, data.newMessage]
                        : [data.newMessage]
                    );
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //subscribe to message for selected user to get it in real tim
    const subscribeToMessage = () => {
        if(!socket) return;

        socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){ //it means the chatbox is opened for this selected user
                newMessage.seen = true;

                setMessages ((prevMessages)=>[...prevMessages, newMessage])
                axios.put(`/api/message/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevUnseenMessages)=> ({
                    ...prevUnseenMessages, [newMessage.senderId] : 
                        prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessage();
        return () => unsubscribeFromMessages()
    }, [socket, selectedUser])

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}