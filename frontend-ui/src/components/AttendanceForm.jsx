import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const STATUS = [
  ["PRESENT", "Present"],
  ["ABSENT", "Absent"],
  ["LATE", "Late"],
  ["SICK", "Sick"],
];

export default function AttendanceForm({ initial, onSaved, onCancel }) {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    student: "",
    staff: "",
    date: new Date().toISOString().split('T')[0],
    status: "PRESENT",
    check_in: "",
    check_out: "",
    notes: "",
    ...initial,
  });

  // Load dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, staffRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/students/"),
          axios.get("http://127.0.0.1:8000/api/staff/")
        ]);
        
        setStudents(studentsRes.data);
        setStaff(staffRes.data);
      } catch (err) {
        console.error("Load error:", err);
        toast.error("❌ Failed to load data");
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    // At least one of student or staff must be selected
    if (!form.student && !form.staff) {
      newErrors.student = "Select at least one";
      newErrors.staff = "Select at least one";
    }
    
    // Date validation
    if (!form.date) {
      newErrors.date = "Date is required";
    } else if (form.date > today) {
      newErrors.date = "Date cannot be in the future";
    }
    
    // Time validation
    if (form.check_in && form.check_out && form.check_in >= form.check_out) {
      newErrors.check_out = "Check-out must be after check-in";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/attendance/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Prepare payload
      const payload = { ...form };
      if (!payload.student) payload.student = null;
      if (!payload.staff) payload.staff = null;
      
      const response = await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Attendance updated" : "✅ Attendance recorded");
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
        {isEdit ? "Edit Attendance Record" : "Record Attendance"}
      </h2>
      
      {/* Target Selection */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Select Target</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Student</label>
            <select
              name="student"
              value={form.student || ""}
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
          
          <div>
            <label className="block mb-1 font-medium">Staff</label>
            <select
              name="staff"
              value={form.staff || ""}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.staff ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select Staff --</option>
              {staff.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
            {errors.staff && <p className="text-red-500 text-sm mt-1">{errors.staff}</p>}
          </div>
        </div>
      </fieldset>

      {/* Attendance Details */}
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Attendance Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div>
            <label className="block mb-1 font-medium">Status *</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            >
              {STATUS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Check-in Time</label>
            <input
              type="time"
              name="check_in"
              value={form.check_in}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.check_in ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.check_in && <p className="text-red-500 text-sm mt-1">{errors.check_in}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Check-out Time</label>
            <input
              type="time"
              name="check_out"
              value={form.check_out}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.check_out ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.check_out && <p className="text-red-500 text-sm mt-1">{errors.check_out}</p>}
          </div>
        </div>
      </fieldset>

      {/* Notes */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          rows="3"
          placeholder="Additional notes about the attendance"
        />
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 px-6 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Saving..." : (isEdit ? "Update Record" : "Record Attendance")}
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
