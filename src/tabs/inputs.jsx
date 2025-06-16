import { useState } from "react";
import { storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";

// Common form input component
export function FormInput({ label, type = "text", inputProps, value, onChange }) {
return (
    <div className="mb-4">
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <input
        type={type}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        value={value}
        onChange={e => onChange(e.target.value)}
        {...inputProps}
    />
    </div>
);
}
// Common textarea component
export function FormTextarea({ label, value, onChange }) {
return (
    <div className="mb-4">
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
        rows="5"
        value={value}
        onChange={e => onChange(e.target.value)}
    />
    </div>
);
}

// Upload multiple images as gallery
export function GalleryUploader({ gallery, setGallery,name }) {
const [uploading, setUploading] = useState(false);
const [error, setError] = useState("");

const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setError("");
    setUploading(true);
    const uploadedUrls = [];
    try {
    for (let i=0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        // const fileRef = storageRef.child(`gallery/${timestamp}-${file.name}`);
        // await fileRef.put(file);
        //const url = await fileRef.getDownloadURL();
        const fileRef = ref(storage, `${name}/gallery/${timestamp}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploadedUrls.push(url);
    }
    setGallery([...gallery, ...uploadedUrls]);
    } catch (err) {
    setError(err.message);
    } finally {
    setUploading(false);
    e.target.value = "";
    }
};

const handleRemove = (index) => {
    setGallery(gallery.filter((_, i) => i !== index));
};

return (
    <div className="mb-4">
    <label className="block mb-2 font-semibold text-gray-800">Image Gallery</label>
    <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        disabled={uploading}
        className="mb-3"
    />
    {uploading && <p className="text-gray-500 mb-2">Uploading images...</p>}
    {error && <p className="text-red-600 mb-2">{error}</p>}
    <div className="flex flex-wrap gap-3">
        {gallery.map((url, idx) => (
        <div key={idx} className="relative rounded-md overflow-hidden shadow-md">
            <img src={url} alt="Gallery" className="w-24 h-24 object-cover" />
            <button 
            type="button" 
            onClick={() => handleRemove(idx)}
            className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-bl-md px-1 hover:bg-opacity-80 transition"
            aria-label="Remove image"
            >
            &times;
            </button>
        </div>
        ))}
    </div>
    </div>
);
}

// Datetime input with label
export function DateTimeInput({ label, value, onChange }) {
// value is ISO string or ''
return (
    <div className="mb-4">
    <label className="block mb-2 font-semibold text-gray-800">{label}</label>
    <input
        type="datetime-local"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        value={value}
        onChange={e => onChange(e.target.value)}
    />
    </div>
);
}