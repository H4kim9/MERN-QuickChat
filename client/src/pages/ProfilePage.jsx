import { useState } from "react"
import assets from "../assets/assets"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(AuthContext)

  const navigate = useNavigate()

  //A state variable where we store the selected image
  const [selectedImg, setSelectedImg] = useState(null)
  const [name, setName] = useState(authUser.fullName)
  const [bio, setBio] = useState(authUser.bio)

  const handleSubmit = async(e) =>{
    e.preventDefault();

    if(!selectedImg){
      await updateProfile({fullName: name, bio})
      navigate('/');
      return
    }

    const reader = new FileReader(); 
    reader.readAsDataURL(selectedImg);

    reader.onload = async() => {
      const base64Image = reader.result;
      await updateProfile({profilePic: base64Image, fullName: name, bio})
      
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      
      {/* left side (form) */}
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-xl">Profile Details</h3>
          
          <label htmlFor="avatar" className="p-2 border border-gray-500 rounded-md flex items-center gap-3 cursor-pointer ">
            <input
              onChange={(e)=>setSelectedImg(e.target.files[0])}
              type="file" id="avatar" accept=".png, .jpg, .jpeg" hidden/>
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} className={`w-12 h-12 ${selectedImg && 'rounded-full'}`}/>
            Upload Profile Image
          </label> 

          <input 
            onChange={(e)=>setName(e.target.value)}
            type="text" required placeholder="Your Name" value={name} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          <textarea
            onChange={(e) => setBio(e.target.value)}
            required placeholder="Write profile bio" rows={4} value={bio} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
        
          <button type="submit" className="p-3 text-white text-lg bg-linear-to-r from-purple-400 to-violet-600 rounded-full cursor-pointer">Save</button>
        </form>

        {/* right side */}
        <img src={authUser?.profilePic || assets.logo_icon} className={`w-44 max-sm:w-30 aspect-square rounded-full mx-10 max-sm:mt-10  `}/>
      </div>
    </div>
  )
}

export default ProfilePage
