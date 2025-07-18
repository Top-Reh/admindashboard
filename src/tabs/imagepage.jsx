import { deleteObject, getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import React, { useEffect, useState } from 'react'
import { db, storage } from '../firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
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
function ImageList({ images,onImageDeleted,setcurrentFeaturedImaged}) {
    const [selectedImageid, setSelectedImageid] = useState(null);

    const handleRemoveImage = async (image) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
        // Delete from Firebase Storage
        const storageRef = ref(storage, image.url);
        await deleteObject(storageRef);
        
        // Delete from Firestore
        await deleteDoc(doc(db, "images", image.id));
        
        // Notify parent component to update state
        onImageDeleted(image.id);
        
        console.log("Image deleted successfully");
        } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image: " + error.message);
        }
    }

    const handleSelect = async(image) => {
        console.log("Selected image:", image);
        await setDoc(doc(db, "InUses", "herosection"), image);
        setSelectedImageid(image.id);
    }

    const handleSubmit = async () => {
        if (!window.confirm("Use this image as a featured image?")) return;
        const selectedImg = images.find(img => img.id === selectedImageid);
        if (selectedImg) {
        setcurrentFeaturedImaged(selectedImg); // Update parent state immediately
        }
    }

    if (!images.length) return <p>No images uploaded yet.</p>;
return (
    <>
        {
            selectedImageid && (
                <button className='rounded-full bg-green-500 text-white py-2 px-5 hover:bg-green-300 ' onClick={handleSubmit}>Submit</button>
            )
        }
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {images.map((img) => (
                <div key={img.id} className="rounded-lg overflow-hidden shadow-md bg-white border border-gray-100 relative" onClick={() => handleSelect(img)} style={{ cursor: 'pointer',border: selectedImageid === img.id ? '2px solid blue' : '2px solid white' }}>
                    <button 
                    type="button" 
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-bl-md px-1 hover:bg-opacity-80 transition"
                    aria-label="Remove image"
                    >&times;</button>
                    <img src={img.url} alt="Uploaded" className="w-full h-32 object-cover" />
                </div>
            ))}
        </div>
    </>
);
}

// Images Management Page
function ImagesPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [currentFeaturedImaged, setcurrentFeaturedImaged] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

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

    const handleImageDeleted = (deletedId) => {
        setImages(prev => prev.filter(img => img.id !== deletedId));
    };

    useEffect(() => {
        const fetchSelectedImage = async () => {
            try {
                const docRef = doc(db, "InUses", "herosection");
                const docSnap = await getDoc(docRef);
                console.log("Fetching selected image:", docSnap);
                if (docSnap.exists()) {
                setcurrentFeaturedImaged(docSnap.data());
                } else {
                console.log("No selected image found");
                }
            } catch (error) {
                console.error("Error fetching selected image:", error);
            }
            }
        fetchSelectedImage();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Website Images</h2>
            <UploadImage onUploaded={handleUploaded} />
            {loading ? (
                <p>Loading images...</p>
            ) : fetchError ? (
                <p className="text-red-600">Error loading images: {fetchError}</p>
            ) : (
                <ImageList images={images} onImageDeleted={handleImageDeleted} setcurrentFeaturedImaged={setcurrentFeaturedImaged}/>
            )}
            <div>
                {currentFeaturedImaged && (
                    <div className="mt-6 p-4 border rounded-lg bg-white shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Currently using Image</h3>
                        <img src={currentFeaturedImaged.url} alt="Selected" className="w-full h-96 rounded-md object-cover object-center" />
                        <p className="text-gray-600 mt-2">Image ID: {currentFeaturedImaged.id}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImagesPage