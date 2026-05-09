import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    title: "",
    role: "Member",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("/api/user/register", {
        ...formData,
        isAdmin: formData.role === "Admin",
      });

      if (response.data) {
        alert("Account created successfully!");
        navigate("/log-in");
      }
    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-100 px-4'>
      <div className='bg-white shadow-lg rounded-xl p-8 w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center mb-6'>
          Create Account
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='name'
            placeholder='Full Name'
            value={formData.name}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded-lg p-3 mb-4'
          />

          <input
            type='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded-lg p-3 mb-4'
          />

          <input
            type='password'
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded-lg p-3 mb-4'
          />

          <input
            type='text'
            name='title'
            placeholder='Job Title'
            value={formData.title}
            onChange={handleChange}
            required
            className='w-full border border-gray-300 rounded-lg p-3 mb-4'
          />

          <select
            name='role'
            value={formData.role}
            onChange={handleChange}
            className='w-full border border-gray-300 rounded-lg p-3 mb-4'
          >
            <option value='Member'>Member</option>
            <option value='Manager'>Manager</option>
            <option value='Admin'>Admin</option>
          </select>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition'
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className='text-center mt-4'>
          Already have an account?{" "}
          <Link
            to='/log-in'
            className='text-blue-600 font-semibold'
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;