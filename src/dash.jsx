import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React from 'react'
import { storage } from './firebase';

const Dash = () => {
    const [image, setImage] = React.useState(null);
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        
        console.log("Selected file:", file);
        if (!file) return;
        const timestamp = Date.now();
        const storageRef = ref(storage, `images/${timestamp}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        console.log("Image uploaded to:", url);
        setImage(url);
    };
  return (
    <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-800">Upload Image</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-gray-700"
        />
        {image && (
          <div className="mt-4">
            <img src={image} alt="Uploaded" className="max-w-full h-auto rounded-lg shadow-md" />
          </div>
        )}
    </div>
  )
}

export default Dash