import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "./firebase";

export default function Home() {
    const [featuredImage, setFeaturedImage] = useState("");
    const [events, setEvents] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [aboutUs, setAboutUs] = useState([]);


    useEffect(() => {
        const fetch = async () => {
            //featuerd image
            const q = doc(db, "InUses", "herosection");

            const docSnap = await getDoc(q);
            setFeaturedImage(docSnap.data().url);

            //about us
            const aboutusdata = doc(db, "InUses", "aboutus");
            const aboutusdatadoc = await getDoc(aboutusdata);
            setAboutUs(aboutusdatadoc.data());
            
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
      <header className="bg-white shadow fixed top-0 left-0 w-full z-50">
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
      <section className="bg-gray-100 h-screen flex items-center justify-center" style={{ backgroundImage: `url(${featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex items-center justify-center flex-col text-center w-full h-full bg-black bg-opacity-10 ">
            <h2 className=" text-white">Change is the end result of all true learning.</h2>
            <h1 className="text-4xl font-bold text-white">
              Inspiring Young Minds for a Brighter Tomorrow
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-3/5 mt-12">
              <div className="bg-teal-600 text-white p-6 rounded">
                <h1 className="font-semibold">Vision</h1>
                <p>To be a center of excellence in education that cultivates responsible, innovative, and compassionate global citizens.</p>
              </div>
              <div className="bg-teal-600 text-white p-6 rounded">
                <h1 className="font-semibold">Mission</h1>
                <p>Deliver high-quality, holistic education that meets international standards.

Foster curiosity, resilience, and leadership in every student.

Create a safe, inclusive environment where every learner thrives.</p>
              </div>
            </div>
        </div>
      </section>

      {/*About */}
      <section className="bg-white py-9 flex items-center justify-center w-full">
        <div className=" flex gap-8 items-center justify-center ">
          <div className=" w-2/5">
            
            <h2 className="text-4xl font-bold mb-4">{aboutUs.title}</h2>
            <p className="text-gray-600 mb-6">
              {aboutUs.content}
            </p>
            <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
              READ MORE
            </button>
          </div>
          <img src={aboutUs.featuredImage} alt="Take a tour" className="rounded shadow aboutusimg" />
        </div>
      </section>

      {/* Features */}
      <section className="bg-whiteh-auto" style={{backgroundImage: `url(https://img.freepik.com/free-photo/harvard-university-cambridge-usa_1268-14363.jpg?uid=R172637133&ga=GA1.1.927363315.1724244579&semt=ais_hybrid&w=740)`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="w-full py-32 px-4 bg-black bg-opacity-10 h-auto flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6 w-3/4">
            {/*events.map((item, idx) => (
              <div key={idx} className="border rounded shadow-sm" style={{backgroundImage: `url(${item.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="p-6 bg-black bg-opacity-20">
                    <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.content}</p>
                    <a className="mt-2 inline-block text-teal-600 font-medium text-sm" href="#">READ MORE</a>
                </div>
              </div>
            ))*/}
            <h1 className="font-semibold text-2xl text-white">Blogs</h1>
            <h1 className="font-semibold text-2xl text-white">Events</h1>
            <div className="flex gap-2 flex-wrap">
              {
                blogs.map((item, idx) => (
                  <div key={idx} className="blogsdivs" style={{backgroundImage: `url(${item.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="p-5 bg-black bg-opacity-20 w-full h-full">
                      <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                      <p className="text-sm text-white line-clamp-5 whitespace-normal w-full">{item.content}</p>
                      <button className="text-white">Learn more</button>
                    </div>
                  </div>
                ))
              }
              <div className="blogsdivs" style={{backgroundImage: `url(https://img.freepik.com/free-photo/free-time-students-bachelor-s-campus-life-rhythm-five-friendly-students-are-walking_8353-6408.jpg?t=st=1750667344~exp=1750670944~hmac=a11354efb6ef9b85f3ffb23fa19e01e6757245db638e2580ba1f3ff183ae8d73&w=1380)`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="p-5 bg-black bg-opacity-20 w-full h-full">
                  <h2 className="text-2xl font-bold text-white mb-2">Upcoming Events</h2>
                  <p className="text-sm text-white line-clamp-5 whitespace-normal w-full">Lorem ipsum dolor sit amet, consectetur adipiscing elit sit</p>
                  <button className="text-white">Learn more</button>
                </div>
              </div>
              <div className="blogsdivs" style={{backgroundImage: `url(https://img.freepik.com/free-photo/free-time-students-bachelor-s-campus-life-rhythm-five-friendly-students-are-walking_8353-6408.jpg?t=st=1750667344~exp=1750670944~hmac=a11354efb6ef9b85f3ffb23fa19e01e6757245db638e2580ba1f3ff183ae8d73&w=1380)`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="p-5 bg-black bg-opacity-20 w-full h-full">
                  <h2 className="text-2xl font-bold text-white mb-2">Upcoming Events</h2>
                  <p className="text-sm text-white line-clamp-5 whitespace-normal w-full">Lorem ipsum dolor sit amet, consectetur adipiscing elit sit</p>
                  <button className="text-white">Learn more</button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {
                events.map((item, idx) => (
                  <div key={idx} className="blogsdivs" style={{backgroundImage: `url(${item.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="p-5 bg-black bg-opacity-20 w-full h-full">
                      <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                      <p className="text-sm text-white line-clamp-5 whitespace-normal w-full">{item.content}</p>
                      <button className="text-white">Learn more</button>
                    </div>
                  </div>
                ))
              }
              <div className="blogsdivs" style={{backgroundImage: `url(https://img.freepik.com/free-photo/free-time-students-bachelor-s-campus-life-rhythm-five-friendly-students-are-walking_8353-6408.jpg?t=st=1750667344~exp=1750670944~hmac=a11354efb6ef9b85f3ffb23fa19e01e6757245db638e2580ba1f3ff183ae8d73&w=1380)`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="p-5 bg-black bg-opacity-20 w-full h-full">
                  <h2 className="text-2xl font-bold text-white mb-2">Upcoming Events</h2>
                  <p className="text-sm text-white line-clamp-5 whitespace-normal w-full">Lorem ipsum dolor sit amet, consectetur adipiscing elit ssssssssssssssssssssssssssssssssssssssssssssssssssssssss ssssssssssssssssssssssssssssssssssssss ttttt tttttttt tttttt ttt</p>
                  <button className="text-white">Learn more</button>
                </div>
              </div>
            </div>
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
                <img className="h-48 bg-gray-200 mb-4 object-cover w-full" src={course.featuredImage} alt={course.title}/>
                <h5 className="text-sm text-teal-600 font-medium">{course.title}</h5>
                <h3 className="text-sm mt-1 mb-2 line-clamp-5 whitespace-normal w-full">{course.content}</h3>
                <p className="text-sm text-gray-600 mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                APPLY NOW
                </button>
              </div>
            ))}
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
