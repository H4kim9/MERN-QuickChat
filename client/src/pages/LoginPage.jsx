/* eslint-disable no-unused-vars */
 
import React, { useState } from 'react'
import assets from '../assets/assets'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const LoginPage = () => {

  const [currState, setCurrState] = useState('Sign up')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('');

  const { login } = useContext(AuthContext)

  // return true or false wether we have submitted the email ... for sign up
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const onSubmitHandler = (e) => {
    e.preventDefault()

    if(currState === 'Sign up' && !isDataSubmitted){
      setIsDataSubmitted(true);
      return
    }

    login(currState === 'Sign up' ? "signup" : 'login', {fullName, email, password, bio})
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      
      {/* left section */}
      <img src={assets.logo_big} className='w-50 sm:w-62.5 max-w-full max-sm:mb-6  h-auto object-contain'/>

      {/* right */}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/6 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg w-100'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} className='w-5 cursor-pointer'/>)}

        </h2>

        {currState === 'Sign up' && !isDataSubmitted && (
          <input 
            onChange={(e) => setFullName(e.target.value)}
            type='text' placeholder='Full Name' value={fullName} className='p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' required/>
        )}
      
        {!isDataSubmitted && (
          <>
            <input 
              onChange={(e) => setEmail(e.target.value)}
              type='email' placeholder='abc@rxample.com' value={email} required className='p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
            <input 
              onChange={(e) => setPassword(e.target.value)}
              type='password' placeholder='Password' value={password} required className='p-3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
          </>  
        )}

        {currState === 'Sign up' && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            rows={4} placeholder='Bio' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'></textarea>
        )}

        <button type='submit' className='py-3 bg-linear-to-r from-purple-400 to-violet-600 rounded-md cursor-pointer'>
          {currState === 'Sign up' ? 'Create Account' : 'Login Now'}
        </button>

        <div className='flex gap-2 items-center justify-start'>
          <input type='checkbox' id='terms'/>
          <label htmlFor="terms" className="cursor-pointer">Agree to the terms of use & privacy policy.</label>
        </div>

        <div className='flex flex-col gap-2'>
          {currState ==="Sign up" ? (
            <p className='text-sm text-gray-600'>Already have and account ? <span onClick={() => {setCurrState("login"); setIsDataSubmitted(false)}} className='underline font-medium text-violet-500 cursor-pointer'> Login here</span></p>
          ) :(
            <p className='text-sm text-gray-600'>Create an Account ? <span onClick={() => {setCurrState("Sign up")}} className='underline font-medium text-violet-500 cursor-pointer'> Sign Up here</span></p>
          )}
        </div>

      </form>
    </div>
  )
}

export default LoginPage
