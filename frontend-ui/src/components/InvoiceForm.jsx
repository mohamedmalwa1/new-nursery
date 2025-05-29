import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const STATUS = [
  ["PAID", "Paid"],
  ["UNPAID", "Unpaid"],
  ["PARTIAL", "Partially Paid"],
];

export default function InvoiceForm({ initial, onSaved, onCancel }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    student: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: "",
    amount: "",
    description: "",
    status: "UNPAID",
    is_income: true,
    is_expense: false,
    tax_percentage: "",
    is_purchase: false,
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
    const { name, value, type, checked } = e.target;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Required fields
    const requiredFields = ['student', 'issue_date', 'due_date', 'amount'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Date validation
    if (form.issue_date > today) {
      newErrors.issue_date = "Issue date cannot be in the future";
    }
    
    if (form.due_date && form.issue_date > form.due_date) {
      newErrors.due_date = "Due date cannot be before issue date";
    }
    
    // Amount validation
    if (form.amount) {
      const amount = parseFloat(form.amount);
      if (isNaN(amount)) {
        newErrors.amount = "Invalid amount";
      } else if (amount <= 0) {
        newErrors.amount = "Amount must be positive";
      }
    }
    
    // Tax validation
    if (form.tax_percentage && form.tax_percentage !== "") {
      const tax = parseFloat(form.tax_percentage);
      if (isNaN(tax)) {
        newErrors.tax_percentage = "Invalid tax percentage";
      } else if (tax < 0 || tax > 100) {
        newErrors.tax_percentage = "Tax must be between 0-100%";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/invoices/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Prepare payload - convert numbers and handle empty tax
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        tax_percentage: form.tax_percentage ? parseFloat(form.tax_percentage) : null
      };
      
      const response = await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Invoice updated" : "✅ Invoice created");
      onSaved(response.data);
    } catch (err) {
      console.error("Save error:", err);
      
      let errorMsg = "Save failed. Please try again.";
      if (err.response?.data) {
        // Handle Django validation errors
        if (err.response.data.non_field_errors) {
          errorMsg = err.response.data.non_field_errors.join(', ');
        } else if (typeof err.response.data === 'object') {
          errorMsg = Object.entries(err.response.data)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
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
        {isEdit ? "Edit Invoice" : "Create New Invoice"}
      </h2>
      
      {/* Student Information */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Student *</label>
        <select
          name="student"
          value={form.student}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.student ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">-- Select Student --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.classroom?.name || 'No Classroom'})
            </option>
          ))}
        </select>
        {errors.student && <p className="text-red-500 text-sm mt-1">{errors.student}</p>}
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Issue Date *</label>
          <input
            type="date"
            name="issue_date"
            value={form.issue_date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full p-2 border rounded ${errors.issue_date ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.issue_date && <p className="text-red-500 text-sm mt-1">{errors.issue_date}</p>}
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Due Date *</label>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            min={form.issue_date}
            className={`w-full p-2 border rounded ${errors.due_date ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Amount *</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              className={`w-full pl-8 p-2 border rounded ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
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
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          rows="3"
          placeholder="Invoice description"
        />
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Tax Percentage</label>
          <div className="relative">
            <input
              type="number"
              name="tax_percentage"
              value={form.tax_percentage}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
              className={`w-full p-2 border rounded ${errors.tax_percentage ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2.5 text-gray-500">%</span>
          </div>
          {errors.tax_percentage && <p className="text-red-500 text-sm mt-1">{errors.tax_percentage}</p>}
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="is_income"
                checked={form.is_income}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Income
            </label>
            
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="is_expense"
                checked={form.is_expense}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Expense
            </label>
            
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="is_purchase"
                checked={form.is_purchase}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Purchase
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 px-6 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Saving..." : (isEdit ? "Update Invoice" : "Create Invoice")}
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
