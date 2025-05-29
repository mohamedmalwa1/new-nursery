import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const METHODS = [
  ["CASH",     "Cash"],
  ["CARD",     "Credit / Debit"],
  ["TRANSFER", "Bank Transfer"],
];

export default function PaymentForm({ initial, onSaved, onCancel }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    invoice: "", 
    amount: "", 
    payment_date: "", 
    method: "CASH",
    transaction_id: "", 
    ...initial,
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/invoices/");
        setInvoices(response.data);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        toast.error("❌ Failed to load invoices");
      }
    };
    
    fetchInvoices();
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
    const requiredFields = ['invoice', 'amount', 'payment_date'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Amount validation
    if (form.amount) {
      const amount = parseFloat(form.amount);
      if (isNaN(amount)) {
        newErrors.amount = "Must be a valid number";
      } else if (amount <= 0) {
        newErrors.amount = "Amount must be positive";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/payments/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Convert amount to number
      const payload = {
        ...form,
        amount: parseFloat(form.amount)
      };
      
      await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Payment updated" : "✅ Payment added");
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
        {isEdit ? "Edit Payment" : "Add Payment"}
      </h2>
      
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Payment Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Invoice *</label>
            <select
              name="invoice"
              value={form.invoice}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.invoice ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select invoice</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} - {inv.student_name} - ${parseFloat(inv.amount).toFixed(2)}
                </option>
              ))}
            </select>
            {errors.invoice && <p className="text-red-500 text-sm mt-1">{errors.invoice}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Amount *</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Payment amount"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>
          
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
          
          <div>
            <label className="block mb-1 font-medium">Method *</label>
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            >
              {METHODS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Transaction ID</label>
            <input
              name="transaction_id"
              value={form.transaction_id}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
              placeholder="Optional transaction ID"
            />
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
          {loading ? "Saving..." : (isEdit ? "Update Payment" : "Add Payment")}
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
