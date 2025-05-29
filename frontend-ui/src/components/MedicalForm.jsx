import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const TYPES = [
  ["ALLERGY", "Allergy"],
  ["MEDICATION", "Medication"],
  ["TREATMENT", "Treatment"],
  ["VACCINATION", "Vaccination"],
];

export default function MedicalForm({ initial, onSaved, onCancel }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    student: "",
    record_type: "ALLERGY",
    date: new Date().toISOString().split('T')[0],
    description: "",
    attachment: null,
    resolved: false,
    ...initial,
  });

  // Load students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/students/");
        setStudents(response.data);
      } catch (err) {
        console.error("Load error:", err);
        toast.error("❌ Failed to load students");
      }
    };
    
    fetchStudents();
  }, []);

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
    const requiredFields = ['student', 'record_type', 'date'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Date validation
    if (form.date > today) {
      newErrors.date = "Date cannot be in the future";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/medical/${isEdit ? `${initial.id}/` : ''}`;
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
      
      toast.success(isEdit ? "✅ Record updated" : "✅ Medical record added");
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
        {isEdit ? "Edit Medical Record" : "Add Medical Record"}
      </h2>
      
      {/* Student Information */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Student Information</legend>
        <div>
          <label className="block mb-1 font-medium">Student *</label>
          <select
            name="student"
            value={form.student}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.student ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">-- Select Student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
          {errors.student && <p className="text-red-500 text-sm mt-1">{errors.student}</p>}
        </div>
      </fieldset>

      {/* Medical Details */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Medical Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Record Type *</label>
            <select
              name="record_type"
              value={form.record_type}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.record_type ? 'border-red-500' : 'border-gray-300'}`}
            >
              {TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.record_type && <p className="text-red-500 text-sm mt-1">{errors.record_type}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Date *</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full p-2 border rounded ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block mb-1 font-medium">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
            placeholder="Details about the medical record"
          />
        </div>
        
        <div className="mt-4">
          <label className="block mb-1 font-medium">Attachment</label>
          <div className="flex items-center">
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="w-full"
            />
            {form.attachment && (
              <span className="ml-3 text-sm text-gray-600">
                {form.attachment.name}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <input
            id="resolved"
            type="checkbox"
            name="resolved"
            checked={form.resolved}
            onChange={handleChange}
            className="mr-2 h-5 w-5"
          />
          <label htmlFor="resolved" className="font-medium">Resolved</label>
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
          {loading ? "Saving..." : (isEdit ? "Update Record" : "Add Record")}
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
