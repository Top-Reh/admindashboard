import React, { useEffect, useState } from 'react'
import { DateTimeInput, FormInput, FormTextarea, GalleryUploader } from './inputs';
import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import {v4 as uuid} from "uuid";
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';

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
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch events
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const q = query(collection(db, "aboutus"), orderBy("datetime", "desc"));
          const snapshot = await getDocs(q);
          const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(evs);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }, []);

    // Upload featured image
    const handleFeaturedImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setError("");
      setUploadingFeat(true);
      try {
        // const storageRef = storage.ref();
        // const timestamp = Date.now();
        // const fileRef = storageRef.child(`events/featured/${timestamp}-${file.name}`);
        // await fileRef.put(file);
        // const url = await fileRef.getDownloadURL();
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
      setError("");
      if (!form.title.trim()) {
        setError("Title is required");
        return;
      }
      try {
        // await collection("events").add({
        //   featuredImage: form.featuredImage,
        //   title: form.tit`le,
        //   content: form.content,
        //   datetime: form.datetime ? new Date(form.datetime) : null,
        //   gallery: form.gallery,
        //   createdAt: serverTimestamp()
        // });
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

        // Refresh events
        const q = query(collection(db, "aboutus"), orderBy("datetime", "desc"));
        const snapshot = await getDocs(q);
        const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(evs);
      } catch (err) {
        setError(err.message);
        console.error("Event submit error:", err);
      }
    };

    const removeGalleryImage = (index) => {
      setForm(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
    };

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
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No about us yet.</p>
        ) : (
            
          <div className="space-y-6 flex flex-col gap-6">
            {events.map((ev) => (
                <section key={ev.id} className="bg-white py-16 rounded-lg shadow-md">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
                    <div className="relative">
                        <img src={ev.featuredImage} alt="Take a tour" className="rounded shadow" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4">{ev.title}</h2>
                        <p className="text-gray-600 mb-6">
                            {ev.content}
                        </p>
                        <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                        READ MORE
                        </button>
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