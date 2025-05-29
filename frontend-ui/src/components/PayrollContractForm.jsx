import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PayrollContractForm({ initial, onSaved, onCancel }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    staff: "", 
    base_salary: "", 
    allowance: "",
    tax_percentage: "", 
    max_advance: "",
    contract_start: "", 
    contract_end: "",
    ...initial,
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/staff/");
        setStaff(response.data);
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        toast.error("❌ Failed to load staff data");
      }
    };
    
    fetchStaff();
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
    
    // Required fields
    const requiredFields = ['staff', 'base_salary', 'contract_start'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Numeric validation
    const numericFields = ['base_salary', 'allowance', 'tax_percentage', 'max_advance'];
    numericFields.forEach(field => {
      if (form[field] && isNaN(parseFloat(form[field]))) {
        newErrors[field] = "Must be a valid number";
      }
    });
    
    // Date validation
    if (form.contract_end && form.contract_start > form.contract_end) {
      newErrors.contract_end = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/payroll/contracts/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Convert numeric fields
      const payload = {
        ...form,
        base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
        allowance: form.allowance ? parseFloat(form.allowance) : null,
        tax_percentage: form.tax_percentage ? parseFloat(form.tax_percentage) : null,
        max_advance: form.max_advance ? parseFloat(form.max_advance) : null,
      };
      
      await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Contract updated" : "✅ Contract added");
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
        {isEdit ? "Edit Payroll Contract" : "Add Payroll Contract"}
      </h2>
      
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Contract Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Staff *</label>
            <select
              name="staff"
              value={form.staff}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.staff ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select staff member</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            {errors.staff && <p className="text-red-500 text-sm mt-1">{errors.staff}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Contract Start *</label>
            <input
              type="date"
              name="contract_start"
              value={form.contract_start}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.contract_start ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.contract_start && <p className="text-red-500 text-sm mt-1">{errors.contract_start}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Base Salary *</label>
            <input
              type="number"
              step="0.01"
              name="base_salary"
              value={form.base_salary}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.base_salary ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Amount"
            />
            {errors.base_salary && <p className="text-red-500 text-sm mt-1">{errors.base_salary}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Allowance</label>
            <input
              type="number"
              step="0.01"
              name="allowance"
              value={form.allowance}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.allowance ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Amount"
            />
            {errors.allowance && <p className="text-red-500 text-sm mt-1">{errors.allowance}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Tax Percentage</label>
            <input
              type="number"
              step="0.01"
              name="tax_percentage"
              value={form.tax_percentage}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.tax_percentage ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Percentage"
            />
            {errors.tax_percentage && <p className="text-red-500 text-sm mt-1">{errors.tax_percentage}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Max Advance</label>
            <input
              type="number"
              step="0.01"
              name="max_advance"
              value={form.max_advance}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.max_advance ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Amount"
            />
            {errors.max_advance && <p className="text-red-500 text-sm mt-1">{errors.max_advance}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Contract End</label>
            <input
              type="date"
              name="contract_end"
              value={form.contract_end}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.contract_end ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.contract_end && <p className="text-red-500 text-sm mt-1">{errors.contract_end}</p>}
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
          {loading ? "Saving..." : (isEdit ? "Update Contract" : "Add Contract")}
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
