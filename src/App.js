import { collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import './App.css';
import { db, storage } from './firebase';
import './index.css';
import React, { use, useContext, useEffect, useState } from 'react';
import { AuthContext } from './Auths/authContext';
import { useAuth } from './Auths/authContext';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

function App() {
    const { logout } = useAuth();
    const [tab, setTab] = useState("images");

    const handleLogout = async () => {
      await logout();
    };

    return (
      <div className="flex min-h-screen">
        <Sidebar currentTab={tab} onTabChange={setTab} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto">
          {tab === "images" && <ImagesPage />}
          {tab === "events" && <EventsPage />}
          {tab === "blogs" && <BlogsPage />}
          {tab === "color" && <ColorThemePage />}
        </main>
      </div>
    );
}

export default App;

  // Upload Image Component
  function UploadImage({ onUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setError("");
      setUploading(true);
      try {
        const timestamp = Date.now();
        const storageRef = ref(storage, `images/${timestamp}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
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
        {error && <p className="text-red-600 mt-2">{error}</p>}
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
      try {
        await collection("images").add({
          url,
          createdAt: serverTimestamp(),
        });
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

  // Common form input component
  function FormInput({ label, type = "text", inputProps, value, onChange }) {
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
  function FormTextarea({ label, value, onChange }) {
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
  function GalleryUploader({ gallery, setGallery }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFiles = async (e) => {
      const files = e.target.files;
      if (!files.length) return;
      setError("");
      setUploading(true);
      const storageRef = storage.ref();
      const uploadedUrls = [];
      try {
        for (let i=0; i < files.length; i++) {
          const file = files[i];
          const timestamp = Date.now();
          const fileRef = storageRef.child(`gallery/${timestamp}-${file.name}`);
          await fileRef.put(file);
          const url = await fileRef.getDownloadURL();
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
  function DateTimeInput({ label, value, onChange }) {
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

  // Event Form Page
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
          const snapshot = await collection("events").orderBy("datetime", "desc").get();
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
        const storageRef = storage.ref();
        const timestamp = Date.now();
        const fileRef = storageRef.child(`events/featured/${timestamp}-${file.name}`);
        await fileRef.put(file);
        const url = await fileRef.getDownloadURL();
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
        await collection("events").add({
          featuredImage: form.featuredImage,
          title: form.title,
          content: form.content,
          datetime: form.datetime ? new Date(form.datetime) : null,
          gallery: form.gallery,
          createdAt: serverTimestamp()
        });
        setForm(initialState);

        // Refresh events
        const snapshot = await collection("events").orderBy("datetime", "desc").get();
        const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(evs);
      } catch (err) {
        setError(err.message);
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
          <GalleryUploader gallery={form.gallery} setGallery={gallery => setForm(prev => ({ ...prev, gallery }))} />
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
          <div className="space-y-6">
            {events.map((ev) => (
              <article key={ev.id} className="p-4 rounded-md shadow-md bg-white border border-gray-100">
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

  // Blog Form Page (almost same as events)
  function BlogsPage() {
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
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch blogs
    useEffect(() => {
      const fetchBlogs = async () => {
        try {
          const snapshot = await collection("blogs").orderBy("datetime", "desc").get();
          const bls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBlogs(bls);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBlogs();
    }, []);

    // Upload featured image
    const handleFeaturedImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setError("");
      setUploadingFeat(true);
      try {
        const storageRef = storage.ref();
        const timestamp = Date.now();
        const fileRef = storageRef.child(`blogs/featured/${timestamp}-${file.name}`);
        await fileRef.put(file);
        const url = await fileRef.getDownloadURL();
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
        await collection("blogs").add({
          featuredImage: form.featuredImage,
          title: form.title,
          content: form.content,
          datetime: form.datetime ? new Date(form.datetime) : null,
          gallery: form.gallery,
          createdAt: serverTimestamp()
        });
        setForm(initialState);

        // Refresh blogs
        const snapshot = await collection("blogs").orderBy("datetime", "desc").get();
        const bls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBlogs(bls);
      } catch (err) {
        setError(err.message);
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
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Manage Blogs</h2>
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
          <DateTimeInput label="Blog Date & Time" value={form.datetime} onChange={v => setForm(prev => ({ ...prev, datetime: v }))} />
          <GalleryUploader gallery={form.gallery} setGallery={gallery => setForm(prev => ({ ...prev, gallery }))} />
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
          >
            Add Blog
          </button>
        </form>

        <h3 className="text-2xl font-semibold mb-4">Existing Blogs</h3>
        {loading ? (
          <p>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p>No blogs added yet.</p>
        ) : (
          <div className="space-y-6">
            {blogs.map((bl) => (
              <article key={bl.id} className="p-4 rounded-md shadow-md bg-white border border-gray-100">
                {bl.featuredImage && (
                  <img src={bl.featuredImage} alt="Featured" className="w-full max-h-60 object-cover rounded-md mb-4" />
                )}
                <h4 className="text-xl font-bold mb-2">{bl.title}</h4>
                <p className="text-gray-600 mb-2 whitespace-pre-line">{bl.content}</p>
                {bl.datetime && (
                  <p className="text-sm text-gray-400 mb-2">
                    {new Date(bl.datetime.seconds * 1000).toLocaleString()}
                  </p>
                )}
                {bl.gallery && bl.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {bl.gallery.map((url, idx) => (
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

  // Website Color Theme Management Page
  function ColorThemePage() {
    const [color, setColor] = useState("#000000");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      const fetchTheme = async () => {
        try {
          const doc = await collection("settings").doc("theme").get();
          if (doc.exists) {
            const data = doc.data();
            if (data && data.primaryColor) {
              setColor(data.primaryColor);
              document.documentElement.style.setProperty('--color-primary', data.primaryColor);
              document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(data.primaryColor));
            }
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTheme();
    }, []);

    const hexToRgb = (hex) => {
      // convert hex to rgb string for CSS (without alpha)
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1],16)}, ${parseInt(result[2],16)}, ${parseInt(result[3],16)}` : '0,0,0';
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      try {
        await collection("settings").doc("theme").set({
          primaryColor: color,
          updatedAt:serverTimestamp()
        });
        document.documentElement.style.setProperty('--color-primary', color);
        document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(color));
        alert("Theme color updated!");
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Website Primary Color</h2>
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-sm">
          <label htmlFor="primaryColor" className="block font-semibold text-gray-800 mb-2">Pick a color</label>
          <input
            id="primaryColor"
            type="color"
            className="w-24 h-12 p-0 border-none cursor-pointer"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
          <div className="mt-6 flex items-center space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
            >
              Save Color
            </button>
            {error && <p className="text-red-600">{error}</p>}
            {loading && <p>Loading current color...</p>}
          </div>
        </form>
      </div>
    );
  }

  // Navigation sidebar component
  function Sidebar({ currentTab, onTabChange, onLogout }) {
    const tabs = [
      { id: "images", label: "Images" },
      { id: "events", label: "Events" },
      { id: "blogs", label: "Blogs" },
      { id: "color", label: "Color Theme" },
    ];

    return (
      <nav className="flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-200 px-6 py-8 overflow-y-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 select-none mb-6">Dashboard</h1>
          <ul className="space-y-4">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left font-medium p-2 rounded-lg transition duration-150 ${
                    currentTab === tab.id
                      ? "bg-black text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onLogout}
          className="mt-auto py-3 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </nav>
    );
  }