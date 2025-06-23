import React, { useEffect, useState } from 'react'
import { DateTimeInput, FormInput, FormTextarea, GalleryUploader } from './inputs';
import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import {v4 as uuid} from "uuid";
import { deleteObject, getDownloadURL, ref, uploadBytes } from '@firebase/storage';

function EventsPage() {
    const initialState = {
      featuredImage: "",
      title: "",
      content: "",
      datetime: "",
      gallery: []
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
          const q = query(collection(db, "events"), orderBy("datetime", "desc"));
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
        const fileRef = ref(storage, `events/featured/${timestamp}-${file.name}`);
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
        await setDoc(doc(db, "events", tid), {
          featuredImage: form.featuredImage,
          title: form.title,
          content: form.content,
          datetime: form.datetime ? Timestamp.fromDate(new Date(form.datetime)): null,
          gallery: form.gallery,
          createdAt: serverTimestamp()
        });

        setForm(initialState);

        // Refresh events
        const q = query(collection(db, "events"), orderBy("datetime", "desc"));
        const snapshot = await getDocs(q);
        const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(evs);
      } catch (err) {
        setError(err.message);
        console.error("Event submit error:", err);
      }
    };

    const handleRemoveEvent = async(data) => {
      if (!window.confirm("Are you sure you want to delete this image?")) return;
      try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, data.featuredImage);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, "events", data.id));
      const q = query(collection(db, "events"), orderBy("datetime", "desc"));
      const snapshot = await getDocs(q);
      const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(evs);
      } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event: " + error.message);
      }
    };

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Manage Events</h2>
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
          <DateTimeInput label="Event Date & Time" value={form.datetime} onChange={v => setForm(prev => ({ ...prev, datetime: v }))} />
          <GalleryUploader gallery={form.gallery} setGallery={gallery => setForm(prev => ({ ...prev, gallery }))} name={'events'}/>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
          >
            Add Event
          </button>
        </form>

        <h3 className="text-2xl font-semibold mb-4">Existing Events</h3>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events added yet.</p>
        ) : (
          <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <article key={ev.id} className="p-4 rounded-md shadow-md bg-white border border-gray-100 relative">
                <button 
                    type="button" 
                    onClick={() => handleRemoveEvent(ev)}
                    className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-bl-md px-1 hover:bg-opacity-80 transition"
                    aria-label="Remove image"
                    >&times;</button>
                {ev.featuredImage && (
                  <img src={ev.featuredImage} alt="Featured" className="w-full max-h-60 object-cover rounded-md mb-4" />
                )}
                <h4 className="text-xl font-bold mb-2">{ev.title}</h4>
                <p className="text-gray-600 mb-2 whitespace-pre-line">{ev.content}</p>
                {ev.datetime && (
                  <p className="text-sm text-gray-400 mb-2">
                    {new Date(ev.datetime.seconds * 1000).toLocaleString()}
                  </p>
                )}
                {ev.gallery && ev.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {ev.gallery.map((url, idx) => (
                      <img key={idx} src={url} alt={`Gallery-${idx}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

export default EventsPage