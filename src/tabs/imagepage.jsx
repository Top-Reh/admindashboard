import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import React, { useEffect, useState } from 'react'
import { db, storage } from '../firebase';
import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import {v4 as uuid} from "uuid";

// Upload Image Component
function UploadImage({ onUploaded }) {
const [uploading, setUploading] = useState(false);
const [error, setError] = useState("");


const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    console.log("Selected file:", file);
    if (!file) return;
    // const result = await Imagekitupload(file);
    // if (!result || !result.url) {
    //   setError("Image upload failed");
    //   return;
    // } else {
    //   console.log("Image uploaded to:", result.url);
    //   onUploaded(result.url); // You can also store fileId if you want to delete later
    // }

    setError("");
    setUploading(true);
    try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `images/${timestamp}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    console.log("Image uploaded to:", url);
    onUploaded(url);
    } catch (err) {
    setError(err.message);
    } finally {
    setUploading(false);
    e.target.value = "";
    }
};

return (
    <div className="mb-4">
    <label className="block mb-2 font-semibold text-gray-800">Upload Image</label>
    <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-gray-700"
        disabled={uploading}
    />
    {uploading && <p className="text-gray-500 mt-2">Uploading...</p>}
    {error && <p className="text-green-600 mt-2">{error}</p>}
    </div>
);
}

// Image List Component
function ImageList({ images }) {
if (!images.length) return <p>No images uploaded yet.</p>;
return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    {images.map((img) => (
        <div key={img.id} className="rounded-lg overflow-hidden shadow-md bg-white border border-gray-100">
        <img src={img.url} alt="Uploaded" className="w-full h-32 object-cover" />
        </div>
    ))}
    </div>
);
}

// Images Management Page
function ImagesPage() {
const [images, setImages] = useState([]);
const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState("");

useEffect(() => {
    const fetchImages = async () => {
    try {
        setFetchError("");
        const q = query(collection(db, "images"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setImages(imgs);
    } catch (error) {
        setFetchError(error.message);
    } finally {
        setLoading(false);
    }
    };
    fetchImages();
}, []);

const handleUploaded = async (url) => {
    const tid = uuid();
    try {
    await setDoc(doc(db, "images", tid), {
        url,
        createdAt: serverTimestamp(),
    });
    // await collection("images").add({
    //   url,
    //   createdAt: serverTimestamp(),
    // });
    // Refresh list after upload
    const q = query(collection(db, "images"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setImages(imgs);
    } catch (error) {
    alert("Failed to save image record: " + error.message);
    }
};

return (
    <div>
    <h2 className="text-3xl font-bold mb-6 text-gray-900">Website Images</h2>
    <UploadImage onUploaded={handleUploaded} />
    {loading ? (
        <p>Loading images...</p>
    ) : fetchError ? (
        <p className="text-red-600">Error loading images: {fetchError}</p>
    ) : (
        <ImageList images={images} />
    )}
    </div>
);
}

export default ImagesPage