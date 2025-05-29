import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function StaffForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "TEACHER",
    hire_date: new Date().toISOString().split('T')[0],
    email: "",
    phone: "",
    document: null,
    is_active: true,
    ...initial,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?.id;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setForm(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Required fields
    const requiredFields = ['first_name', 'last_name', 'role', 'hire_date'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Date validation
    if (form.hire_date > today) {
      newErrors.hire_date = "Hire date cannot be in the future";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/staff/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      const data = new FormData();
      
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
      
      const response = await axios({
        method,
        url,
        data,
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success(isEdit ? "✅ Staff member updated" : "✅ Staff member added");
      onSaved(response.data);
    } catch (err) {
      console.error("Save error:", err);
      
      let errorMsg = "Save failed. Please try again.";
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMsg = Object.values(err.response.data).flat().join(', ');
        } else {
          errorMsg = err.response.data.detail || err.response.data;
        }
      }
      
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
        {isEdit ? "Edit Staff Member" : "Add New Staff Member"}
      </h2>
      
      {/* Personal Information */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Personal Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">First Name *</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter first name"
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Last Name *</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter last name"
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="TEACHER">Teacher</option>
              <option value="ASSISTANT">Assistant</option>
              <option value="ADMIN">Administrator</option>
              <option value="SUPPORT">Support Staff</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Hire Date *</label>
            <input
              type="date"
              name="hire_date"
              value={form.hire_date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full p-2 border rounded ${errors.hire_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.hire_date && <p className="text-red-500 text-sm mt-1">{errors.hire_date}</p>}
          </div>
        </div>
      </fieldset>

      {/* Contact Information */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Contact Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="staff@example.com"
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>
      </fieldset>

      {/* Document & Status */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Document & Status</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Document</label>
            <div className="flex items-center">
              <input
                type="file"
                name="document"
                onChange={handleChange}
                className="w-full"
              />
              {form.document && (
                <span className="ml-3 text-sm text-gray-600">
                  {form.document.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="is_active" className="font-medium">Active Staff Member</label>
          </div>
        </div>
      </fieldset>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 px-6 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Saving..." : (isEdit ? "Update Staff" : "Add Staff")}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-6 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
