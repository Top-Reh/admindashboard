import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

  // Website Color Theme Management Page
  function ColorThemePage() {
    const [color, setColor] = useState("#000000");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      const fetchTheme = async () => {
        try {
          //const doc = await collection("settings").doc("theme").get();
          const colordata = doc(db, "InUses", "color");
          const colordatadoc = await getDoc(colordata);
          setColor(colordatadoc.data().color || "#000000");
          // if (doc.exists) {
          //   const data = doc.data();
          //   if (data && data.primaryColor) {
          //     setColor(data.primaryColor);
          //     document.documentElement.style.setProperty('--color-primary', data.primaryColor);
          //     document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(data.primaryColor));
          //   }
          // }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchTheme();
    }, []);

    // const hexToRgb = (hex) => {
    //   // convert hex to rgb string for CSS (without alpha)
    //   const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    //   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    //     return r + r + g + g + b + b;
    //   });
    //   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    //   return result ? `${parseInt(result[1],16)}, ${parseInt(result[2],16)}, ${parseInt(result[3],16)}` : '0,0,0';
    // };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      try {
        await setDoc(doc(db, "InUses", "color"), {
          color: color,
          updatedAt:serverTimestamp()
        });
        // await collection("settings").doc("theme").set({
        //   primaryColor: color,
        //   updatedAt:serverTimestamp()
        // });
        // document.documentElement.style.setProperty('--color-primary', color);
        // document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(color));
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

export default ColorThemePage;