import { useAuth } from './Auths/authContext';
import React, { useState } from 'react';
import { useNavigate } from "react-router";

const Loginpage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      try {
        await login(email, password);
        navigate("/", { replace: true });
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-900 text-center">Admin Dashboard</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
}

export default Loginpage
