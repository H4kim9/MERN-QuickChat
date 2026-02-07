/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */


import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    //Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const {data} = await axios.get("/api/auth/check") 

            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message)
        }
    }

    //login funciton to handle user authentication and socket connection (credentials == data like email ...)
    const login = async  (state, credentials) => {
        try {
            //it means if i pass the login state it will call the login api, if we call sign up it will call sign up api 
            const {data} = await axios.post(`/api/auth/${state}`, credentials)

            if(data.success){
                setAuthUser(data.userData)
                connectSocket(data.userData)

                axios.defaults.headers.common["token"] = data.token
                setToken(data.token)

                //store the token in the browser local storage
                localStorage.setItem("token", data.token) 
                toast.success(data.message)

            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error.message);
            toast.error(error.message)            
        }   
    }

    //Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        
        axios.defaults.headers.common["token"] = null;

        toast.success("Logged out successfully");

        socket.disconnect();
    }

    const updateProfile = async (body) => {
        try {
            const {data} = await axios.put("/api/auth/update-profile", body)
        
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //connect docket function to handle socket connection and online updates
    const connectSocket = (userData) => {
        if(!userData || socket?.connected) return // socket?.connected if false
    
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds)
        })
    }

    useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common["token"] = storedToken;
        checkAuth();
    }
    }, []);

    const value = {
        axios, 
        authUser,
        onlineUsers,
        socket,
        login, 
        logout,
        updateProfile
    }

    return (
    <AuthContext.Provider value = {value}>
        {children}
    </AuthContext.Provider>
    )
}