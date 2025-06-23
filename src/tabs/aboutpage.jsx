import React, { useEffect, useState } from 'react'
import { DateTimeInput, FormInput, FormTextarea, GalleryUploader } from './inputs';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import {v4 as uuid} from "uuid";
import { deleteObject, getDownloadURL, ref, uploadBytes } from '@firebase/storage';

const Aboutpage = () => {
  const initialState = {
      featuredImage: "",
      title: "",
      content: "",
      datetime: "",
    };

    const [form, setForm] = useState(initialState);
    const [uploadingFeat, setUploadingFeat] = useState(false);
    const [error, setError] = useState("");
    const [about, setabout] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedblog, setSelectedBlog] = useState('');

    // Fetch about
    useEffect(() => {
      const fetchabout = async () => {
        try {
          const q = query(collection(db, "aboutus"), orderBy("datetime", "desc"));
          const snapshot = await getDocs(q);
          const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setabout(evs);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchabout();
    }, []);

    // Upload featured image
    const handleFeaturedImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setError("");
      setUploadingFeat(true);
      try {
        const timestamp = Date.now();
        const fileRef = ref(storage, `aboutus/${timestamp}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        setForm(prev => ({ ...prev, featuredImage: url }));
      } catch (err) {
        setError(err.message);
      } finally {
        setUploadingFeat(false);
        e.target.value = "";
      }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!window.confirm("Add this blog?")) return;
      setError("");
      if (!form.title.trim()) {
        setError("Title is required");
        return;
      }
      try {
        const tid = uuid();
        console.log("Submitting event:", form);
        await setDoc(doc(db, "aboutus", tid), {
          featuredImage: form.featuredImage,
          title: form.title,
          content: form.content,
          datetime: form.datetime ? Timestamp.fromDate(new Date(form.datetime)): null,
          createdAt: serverTimestamp()
        });

        setForm(initialState);

        // Refresh about
        const q = query(collection(db, "aboutus"), orderBy("datetime", "asc"));
        const snapshot = await getDocs(q);
        const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setabout(evs);
      } catch (err) {
        setError(err.message);
        console.error("Event submit error:", err);
      }
    };

    const handleRemoveblog = async (data) => {
      if (!window.confirm("Are you sure you want to delete this blog?")) return;

      try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, data.featuredImage);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, "aboutus", data.id));
      const q = query(collection(db, "aboutus"), orderBy("datetime", "desc"));
      const snapshot = await getDocs(q);
      const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setabout(evs);

      } catch (error) {
        console.error("Error deleting data:", error);
        alert("Failed to delete data: " + error.message);
      }
    }

    const handleApplyabout = async(e) => {
      if (!window.confirm("Are you sure you want to Apply this blog?")) return;
      console.log("Applying about us:", e);
      await setDoc(doc(db, "InUses", "aboutus"), e);
      setSelectedBlog(e.id);
    }

    useEffect(() => {
      const fetchSelectedBlog = async () => {
        const q = doc(db, "InUses", "aboutus");
        const docSnap = await getDoc(q);
        setSelectedBlog(docSnap.data().id);
      }
      fetchSelectedBlog();
    }, []);

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Manage About us</h2>
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-800">Featured Image</label>
            {form.featuredImage ? (
              <div className="mb-2 relative w-40 h-28 rounded-lg overflow-hidden shadow-md">
                <img src={form.featuredImage} alt="Featured" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, featuredImage: "" }))}
                  className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-bl-md px-1 hover:bg-opacity-80 transition"
                  aria-label="Remove featured image"
                >
                  &times;
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                disabled={uploadingFeat}
                className="block w-full"
              />
            )}
            {uploadingFeat && <p className="text-gray-500">Uploading featured image...</p>}
          </div>

          <FormInput label="Title" value={form.title} onChange={v => setForm(prev => ({ ...prev, title: v }))} />
          <FormTextarea label="Content" value={form.content} onChange={v => setForm(prev => ({ ...prev, content: v }))} />
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
          >
            Update
          </button>
        </form>

        <h3 className="text-2xl font-semibold mb-4">Existing About us</h3>
        {loading ? (
          <p>Loading about...</p>
        ) : about.length === 0 ? (
          <p>No about us yet.</p>
        ) : (
            
          <div className="space-y-6 flex flex-col gap-6">
            {about.map((ev) => (
                <section key={ev.id} className="bg-white py-7 rounded-lg shadow-md relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 ">
                    <div className=" gap-2 flex flex-col items-center">
                        <img src={ev.featuredImage} alt="Take a tour" className="rounded shadow" />
                        {selectedblog === ev.id ? (
                            <span className="bg-green-300 font-semibold absolute top-0 left-0 py-3 px-5 cursor-pointer">Applied</span>
                        ) : (
                            <button className='bg-green-300 rounded-md py-3 w-full font-semibold ' onClick={() => handleApplyabout(ev)}>Apply</button>
                        )}
                        {
                          selectedblog !== ev.id && (
                            <span className="bg-red-300 font-semibold absolute top-0 right-0 py-3 px-5 cursor-pointer" onClick={()=> handleRemoveblog(ev)}>Delete</span>
                          )
                        }
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4">{ev.title}</h2>
                        <p className="text-gray-600 mb-6">
                            {ev.content}
                        </p>
                    </div>
                    </div>
                </section>
            ))}
          </div>
        )}
      </div>
    );
}

export default Aboutpage