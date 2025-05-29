import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const GRADES = [
  ["INFANT", "Infant (0-1)"],
  ["TODDLER", "Toddler (1-2)"],
  ["PRESCHOOL", "Preschool (3-4)"],
  ["PRE_K", "Pre-K (4-5)"],
];

export default function ClassroomForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    grade_level: "INFANT",
    capacity: "",
    teacher: "",
    ...initial,
  });
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial?.id;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/staff/");
        setTeachers(response.data.filter(staff => 
          staff.role === "TEACHER" || staff.role === "ASSISTANT"
        ));
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        toast.error("❌ Failed to load teachers");
      }
    };
    
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['name', 'grade_level', 'capacity', 'teacher'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Capacity validation
    if (form.capacity) {
      const capacity = parseInt(form.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        newErrors.capacity = "Capacity must be a positive number";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/classrooms/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Convert capacity to number
      const payload = {
        ...form,
        capacity: parseInt(form.capacity)
      };
      
      const response = await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Classroom updated" : "✅ Classroom added");
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
        {isEdit ? "Edit Classroom" : "Add New Classroom"}
      </h2>
      
      {/* Classroom Information */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Classroom Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Classroom name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Grade Level *</label>
            <select
              name="grade_level"
              value={form.grade_level}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.grade_level ? 'border-red-500' : 'border-gray-300'}`}
            >
              {GRADES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.grade_level && <p className="text-red-500 text-sm mt-1">{errors.grade_level}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min="1"
              className={`w-full p-2 border rounded ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Number of students"
            />
            {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Teacher *</label>
            <select
              name="teacher"
              value={form.teacher}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.teacher ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
            {errors.teacher && <p className="text-red-500 text-sm mt-1">{errors.teacher}</p>}
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
          {loading ? "Saving..." : (isEdit ? "Update Classroom" : "Add Classroom")}
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
