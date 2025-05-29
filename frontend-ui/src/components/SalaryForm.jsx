import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function SalaryForm({ initial, onSaved, onCancel }) {
  const [staff, setStaff] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    staff: "", 
    contract: "", 
    month: "",
    base_salary: "", 
    allowance: "", 
    advance_taken: "",
    deductions: "", 
    tax_applied: "", 
    net_salary: "",
    is_paid: false, 
    payment_date: "", 
    ...initial,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffRes = await axios.get("http://127.0.0.1:8000/api/staff/");
        const contractsRes = await axios.get("http://127.0.0.1:8000/api/payroll/contracts/");
        
        setStaff(staffRes.data);
        setContracts(contractsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("❌ Failed to load data");
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    // Clear previous errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['staff', 'month', 'net_salary'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Numeric validation
    const numericFields = [
      'base_salary', 'allowance', 'advance_taken', 
      'deductions', 'tax_applied', 'net_salary'
    ];
    
    numericFields.forEach(field => {
      if (form[field] && isNaN(parseFloat(form[field]))) {
        newErrors[field] = "Must be a valid number";
      }
    });
    
    // Date validation
    if (form.is_paid && !form.payment_date) {
      newErrors.payment_date = "Payment date is required when marked as paid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/payroll/salaries/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Convert numeric fields
      const payload = {
        ...form,
        base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
        allowance: form.allowance ? parseFloat(form.allowance) : null,
        advance_taken: form.advance_taken ? parseFloat(form.advance_taken) : null,
        deductions: form.deductions ? parseFloat(form.deductions) : null,
        tax_applied: form.tax_applied ? parseFloat(form.tax_applied) : null,
        net_salary: form.net_salary ? parseFloat(form.net_salary) : null,
      };
      
      await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Salary updated" : "✅ Salary added");
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
        {isEdit ? "Edit Salary Record" : "Add Salary Record"}
      </h2>
      
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Salary Information</legend>
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
            <label className="block mb-1 font-medium">Contract</label>
            <select
              name="contract"
              value={form.contract || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="">Select contract</option>
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.staff_name} ({c.contract_start})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Month *</label>
            <input
              type="date"
              name="month"
              value={form.month}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.month ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="First day of month"
            />
            <p className="text-xs text-gray-500 mt-1">Use first day of month (e.g. 2024-05-01)</p>
            {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Base Salary</label>
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
            <label className="block mb-1 font-medium">Advance Taken</label>
            <input
              type="number"
              step="0.01"
              name="advance_taken"
              value={form.advance_taken}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.advance_taken ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Amount"
            />
            {errors.advance_taken && <p className="text-red-500 text-sm mt-1">{errors.advance_taken}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Deductions</label>
            <input
              type="number"
              step="0.01"
              name="deductions"
              value={form.deductions}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.deductions ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Amount"
            />
            {errors.deductions && <p className="text-red-500 text-sm mt-1">{errors.deductions}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Tax Applied</label>
            <input
              type="number"
              step="0.01"
              name="tax_applied"
              value={form.tax_applied}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.tax_applied ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Percentage"
            />
            {errors.tax_applied && <p className="text-red-500 text-sm mt-1">{errors.tax_applied}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Net Salary *</label>
            <input
              type="number"
              step="0.01"
              name="net_salary"
              value={form.net_salary}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.net_salary ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Amount"
            />
            {errors.net_salary && <p className="text-red-500 text-sm mt-1">{errors.net_salary}</p>}
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input
              id="is_paid"
              type="checkbox"
              name="is_paid"
              checked={form.is_paid}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <label htmlFor="is_paid" className="font-medium">Is Paid</label>
          </div>
          
          {form.is_paid && (
            <div>
              <label className="block mb-1 font-medium">Payment Date *</label>
              <input
                type="date"
                name="payment_date"
                value={form.payment_date}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.payment_date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.payment_date && <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>}
            </div>
          )}
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
          {loading ? "Saving..." : (isEdit ? "Update Salary" : "Add Salary")}
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
