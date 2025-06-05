import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const TYPES = [
  ["BIRTH_CERT", "Birth Certificate"],
  ["MEDICAL",    "Medical Record"],
  ["ID",    "ID"],
  ["passport",      "passport"],
];

export default function DocumentForm({ initial, onSaved, onCancel }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    student: "", 
    doc_type: "BIRTH_CERT",
    issue_date: "", 
    expiration_date: "",
    file: null,
    ...initial,
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/students/");
        setStudents(response.data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        toast.error("❌ Failed to load students");
      }
    };
    
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, file: e.target.files[0] || null }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['student', 'doc_type'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // File validation for new documents
    if (!isEdit && !form.file) {
      newErrors.file = "File is required";
    }
    
    // Date validation
    if (form.expiration_date && form.issue_date > form.expiration_date) {
      newErrors.expiration_date = "Expiration date must be after issue date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/student-documents/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success(isEdit ? "✅ Document updated" : "✅ Document added");
      onSaved();
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
        {isEdit ? "Edit Document" : "Add Document"}
      </h2>
      
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Document Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Student *</label>
            <select
              name="student"
              value={form.student}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.student ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            {errors.student && <p className="text-red-500 text-sm mt-1">{errors.student}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Document Type *</label>
            <select
              name="doc_type"
              value={form.doc_type}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.doc_type ? 'border-red-500' : 'border-gray-300'}`}
            >
              {TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.doc_type && <p className="text-red-500 text-sm mt-1">{errors.doc_type}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">File {!isEdit && '*'}</label>
            <input
              type="file"
              onChange={handleFileChange}
              className={`w-full p-2 border rounded ${errors.file ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
            {isEdit && form.file && (
              <p className="text-sm text-gray-500 mt-1">
                Current file: {typeof form.file === 'string' ? form.file.split('/').pop() : form.file.name}
              </p>
            )}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Issue Date</label>
            <input
              type="date"
              name="issue_date"
              value={form.issue_date}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Expiration Date</label>
            <input
              type="date"
              name="expiration_date"
              value={form.expiration_date}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.expiration_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.expiration_date && <p className="text-red-500 text-sm mt-1">{errors.expiration_date}</p>}
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
          {loading ? "Saving..." : (isEdit ? "Update Document" : "Add Document")}
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
