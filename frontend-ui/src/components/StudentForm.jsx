import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    profile_image: null,
    classroom: "",
    teacher: "",
    enrollment_date: new Date().toISOString().split('T')[0],
    enrollment_history: "",
    uploaded_documents: null,
    evaluation_notes: "",
    is_active: true,
    allergies: "",
    medical_notes: "",
    guardian_name: "",
    guardian_contact: "",
    emergency_contact: ""
  });

  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Function to fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Fetch teachers and classrooms
      const teachersRes = await axios.get("http://127.0.0.1:8000/api/staff/");
      const classroomsRes = await axios.get("http://127.0.0.1:8000/api/classrooms/");
      
      setTeachers(teachersRes.data);
      setClassrooms(classroomsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Data fetch error:", err);
      setApiError(`Failed to load data: ${err.message || "Server error"}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Required fields validation
    const requiredFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 
      'classroom', 'teacher', 'enrollment_date',
      'guardian_name', 'guardian_contact', 'emergency_contact'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Date validation
    if (formData.date_of_birth > today) {
      newErrors.date_of_birth = "Date of birth cannot be in the future";
    }
    
    if (formData.enrollment_date > today) {
      newErrors.enrollment_date = "Enrollment date cannot be in the future";
    }
    
    // Age validation (minimum 1 month)
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const todayDate = new Date();
      const ageInMonths = (todayDate.getFullYear() - birthDate.getFullYear()) * 12 + 
                          (todayDate.getMonth() - birthDate.getMonth());
      
      if (ageInMonths < 1) {
        newErrors.date_of_birth = "Student must be at least 1 month old";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    if (!validateForm()) return;
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        data.append(key, val);
      }
    });

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:8000/api/students/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSubmitStatus({ type: "success", message: "✅ Student added successfully!" });
      
      // Reset form after successful submission
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        profile_image: null,
        classroom: "",
        teacher: "",
        enrollment_date: new Date().toISOString().split('T')[0],
        enrollment_history: "",
        uploaded_documents: null,
        evaluation_notes: "",
        is_active: true,
        allergies: "",
        medical_notes: "",
        guardian_name: "",
        guardian_contact: "",
        emergency_contact: ""
      });
    } catch (err) {
      console.error("Submission error:", err);
      
      let errorMsg = "Failed to submit form. Please try again.";
      if (err.response) {
        if (err.response.data) {
          // Handle Django validation errors
          if (typeof err.response.data === 'object') {
            errorMsg = Object.entries(err.response.data)
              .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
              .join('; ');
          } else {
            errorMsg = err.response.data.detail || err.response.data;
          }
        } else {
          errorMsg = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMsg = "No response from server. Check your connection.";
      }
      
      setSubmitStatus({ type: "error", message: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  // If we're still loading initial data
  if (loading && !teachers.length && !classrooms.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  // If there was an API error
  if (apiError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <div className="text-red-500 text-lg mb-4">{apiError}</div>
        <p className="mb-4">Failed to load required data. Please check:</p>
        <ul className="list-disc text-left mb-6 mx-auto max-w-md">
          <li>Backend server is running</li>
          <li>API endpoints are correct</li>
          <li>CORS is properly configured</li>
          <li>Network connection is working</li>
        </ul>
        <button 
          onClick={fetchInitialData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Loading Data
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">Add Student</h2>
      
      {submitStatus && (
        <div className={`mb-6 p-4 rounded ${
          submitStatus.type === "success" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {submitStatus.message}
        </div>
      )}
      
      {/* Personal Information */}
      <fieldset className="mb-8 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Personal Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">First Name *</label>
            <input 
              name="first_name" 
              value={formData.first_name} 
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
              value={formData.last_name} 
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`} 
              placeholder="Enter last name"
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Date of Birth *</label>
            <input 
              type="date" 
              name="date_of_birth" 
              value={formData.date_of_birth} 
              max={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Gender *</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select --</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Profile Image</label>
            <div className="flex items-center">
              <input 
                type="file" 
                accept="image/*" 
                name="profile_image" 
                onChange={handleChange} 
                className="w-full p-1"
              />
              {formData.profile_image && (
                <span className="ml-3 text-sm text-gray-600">
                  {formData.profile_image.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* Guardian Information */}
      <fieldset className="mb-8 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Guardian Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Guardian Name *</label>
            <input 
              name="guardian_name" 
              value={formData.guardian_name} 
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.guardian_name ? 'border-red-500' : 'border-gray-300'}`} 
              placeholder="Full name"
            />
            {errors.guardian_name && <p className="text-red-500 text-sm mt-1">{errors.guardian_name}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Guardian Contact *</label>
            <input 
              name="guardian_contact" 
              value={formData.guardian_contact} 
              onChange={handleChange}
              placeholder="Phone number"
              className={`w-full p-2 border rounded ${errors.guardian_contact ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.guardian_contact && <p className="text-red-500 text-sm mt-1">{errors.guardian_contact}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Emergency Contact *</label>
            <input 
              name="emergency_contact" 
              value={formData.emergency_contact} 
              onChange={handleChange}
              placeholder="Phone number"
              className={`w-full p-2 border rounded ${errors.emergency_contact ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.emergency_contact && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact}</p>}
          </div>
        </div>
      </fieldset>

      {/* Academic Information */}
      <fieldset className="mb-8 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Academic Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Classroom *</label>
            <select 
              name="classroom" 
              value={formData.classroom} 
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.classroom ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select Classroom --</option>
              {classrooms.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade_level})
                </option>
              ))}
            </select>
            {errors.classroom && <p className="text-red-500 text-sm mt-1">{errors.classroom}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Teacher *</label>
            <select 
              name="teacher" 
              value={formData.teacher} 
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.teacher ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>
            {errors.teacher && <p className="text-red-500 text-sm mt-1">{errors.teacher}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Enrollment Date *</label>
            <input 
              type="date" 
              name="enrollment_date" 
              value={formData.enrollment_date} 
              max={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.enrollment_date ? 'border-red-500' : 'border-gray-300'}`} 
            />
            {errors.enrollment_date && <p className="text-red-500 text-sm mt-1">{errors.enrollment_date}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Enrollment History</label>
            <textarea 
              name="enrollment_history" 
              value={formData.enrollment_history} 
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded" 
              placeholder="Previous classrooms and years"
              rows="3"
            />
          </div>
        </div>
      </fieldset>

      {/* Medical Information */}
      <fieldset className="mb-8 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Medical Information</legend>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1 font-medium">Allergies</label>
            <input 
              name="allergies" 
              value={formData.allergies} 
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded" 
              placeholder="List any allergies"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Medical Notes</label>
            <textarea 
              name="medical_notes" 
              value={formData.medical_notes} 
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded" 
              placeholder="Important medical information"
              rows="3"
            />
          </div>
        </div>
      </fieldset>

      {/* Documents & Evaluation */}
      <fieldset className="mb-8 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Documents & Evaluation</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Upload Documents</label>
            <div className="flex items-center">
              <input 
                type="file" 
                name="uploaded_documents" 
                onChange={handleChange} 
                className="w-full p-1"
              />
              {formData.uploaded_documents && (
                <span className="ml-3 text-sm text-gray-600">
                  {formData.uploaded_documents.name}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Evaluation Notes</label>
            <textarea 
              name="evaluation_notes" 
              value={formData.evaluation_notes} 
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded" 
              placeholder="Observations and assessments"
              rows="3"
            />
          </div>
        </div>
      </fieldset>

      {/* Status */}
      <div className="flex items-center mb-6">
        <input 
          type="checkbox" 
          name="is_active" 
          checked={formData.is_active} 
          onChange={handleChange} 
          className="mr-2 h-5 w-5"
        />
        <label className="font-medium">Active Student</label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? "Processing..." : "Register Student"}
      </button>
    </form>
  );
};

export default StudentForm;
