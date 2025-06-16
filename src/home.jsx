import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "./firebase";

export default function Home() {
    const [featuredImage, setFeaturedImage] = useState("");
    const [events, setEvents] = useState([]);
    const [blogs, setBlogs] = useState([]);
    useEffect(() => {
        const fetch = async () => {
            //featuerd image
            const q = query(
                collection(db, "images"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.docs.length > 0) {
                // Get the last document
                const lastDoc = querySnapshot.docs[0];
                console.log(lastDoc.id, " => ", lastDoc.data());
                setFeaturedImage(lastDoc.data().url);
            }
            // Fetch events
            const eventsQuery = query(
                collection(db, "events"),
                orderBy("datetime", "desc")
            );
            const eventsSnapshot = await getDocs(eventsQuery);
            const evs = eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(evs);
            // Fetch blogs
            const blogsQuery = query(
                collection(db, "blogs"),
                orderBy("datetime", "desc")
            );
            const blogsSnapshot = await getDocs(blogsQuery);
            const bls = blogsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBlogs(bls);
        }
        
        fetch();
    }, []);
  return (
    <div className="font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-teal-600">Edufair</div>
          <nav className="space-x-6 text-sm font-medium text-gray-700">
            <a href="#">Home</a>
            <a href="#">Courses</a>
            <a href="#">Pages</a>
            <a href="#">Blog</a>
            <a href="#">Shop</a>
            <a href="#">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-100 py-16 h-96" style={{ backgroundImage: `url(${featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-sm text-white">Change is the end result of all true learning.</h2>
            <h1 className="text-4xl font-bold mt-2 text-white">
              Like what you are learning<br /> Get started today
            </h1>
            <button className="mt-6 px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-2">
            <div className="bg-teal-600 text-white p-6 rounded">
              <div className="space-y-6">
                <div>Computer Lab</div>
                <div>Music Instrument</div>
                <div>Art & Culture</div>
              </div>
            </div>
            {events.map((item, idx) => (
              <div key={idx} className="border rounded shadow-sm">
                <img className="h-40 bg-gray-200 object-cover w-full" src={item.featuredImage} alt={item.title}/>
                <div className="p-6">
                    <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.content}</p>
                    <a className="mt-2 inline-block text-teal-600 font-medium text-sm" href="#">READ MORE</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map((course, idx) => (
              <div key={idx} className="bg-white p-4 shadow rounded">
                <img className="h-50 bg-gray-200 mb-4 object-cover w-full" src={course.featuredImage} alt={course.title}/>
                <h5 className="text-sm text-teal-600 font-medium">{course.content}</h5>
                <h3 className="text-lg font-semibold mt-1 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                APPLY NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour and About */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="relative">
            <img src="https://i.imgur.com/il8F7qP.jpg" alt="Take a tour" className="rounded shadow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white text-teal-600 font-bold px-4 py-2 rounded-full shadow">
                ▶
              </button>
            </div>
            <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
              Making your achievement<br /> TAKE A TOUR
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">ABOUT EDUFAIR</h2>
            <p className="text-gray-600 mb-6">
              Quo pro posse omnis adipiscing, cum nonnulla esse ea. Sea te malis apeirian interpretaris, in quo nihil decore. Utinam moderatius ei duo, debitis propriae persequeris ne est. Vocibus accusamus interpretaris ex sea.
            </p>
            <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
              READ MORE
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 text-sm">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-5 gap-6">
          <div>
            <div className="text-white text-xl font-bold mb-3">Edufair</div>
            <p>(09) 123 456 789</p>
            <p>hello@edufair.com</p>
            <p>123 white gorge street, west town hall, London, UK</p>
          </div>
          {[
            { title: "Company", links: ["About", "Career", "Contact"] },
            { title: "Useful Links", links: ["Become a Teacher", "Courses", "Support"] },
            { title: "Support", links: ["FAQs", "Privacy Policy"] },
            { title: "Community", links: ["Help Center", "Developers"] },
          ].map((group, idx) => (
            <div key={idx}>
              <h5 className="text-white font-semibold mb-3">{group.title}</h5>
              {group.links.map((link, i) => (
                <p key={i} className="hover:text-white cursor-pointer">{link}</p>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
