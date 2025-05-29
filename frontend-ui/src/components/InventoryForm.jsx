import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  ["UNIFORM",   "Uniform"],
  ["BOOK",      "Book"],
  ["STATIONERY","Stationery"],
  ["TOY",       "Toy"],
  ["EQUIPMENT", "Equipment"],
  ["ASSET",     "Asset"],
];

export default function InventoryForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    category: "UNIFORM",
    quantity: "",
    unit_price: "",
    last_restock: "",
    staff_custodian: "",
    assigned_to_student: "",
    ...initial,
  });
  
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffRes = await axios.get("http://127.0.0.1:8000/api/staff/");
        const studentsRes = await axios.get("http://127.0.0.1:8000/api/students/");
        setStaff(staffRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("❌ Failed to load dropdown data");
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
    
    // Required fields
    const requiredFields = ['name', 'category', 'quantity', 'unit_price'];
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });
    
    // Numeric field validation
    if (form.quantity) {
      const quantity = parseInt(form.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = "Quantity must be a positive number";
      }
    }
    
    if (form.unit_price) {
      const price = parseFloat(form.unit_price);
      if (isNaN(price) || price <= 0) {
        newErrors.unit_price = "Price must be a positive number";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = `http://127.0.0.1:8000/api/inventory/${isEdit ? `${initial.id}/` : ''}`;
    const method = isEdit ? "PUT" : "POST";

    try {
      setLoading(true);
      
      // Convert numeric fields
      const payload = {
        ...form,
        quantity: parseInt(form.quantity),
        unit_price: parseFloat(form.unit_price)
      };
      
      await axios({
        method,
        url,
        data: payload,
        headers: { "Content-Type": "application/json" }
      });
      
      toast.success(isEdit ? "✅ Item updated" : "✅ Item added");
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
        {isEdit ? "Edit Inventory Item" : "Add Inventory Item"}
      </h2>
      
      <fieldset className="mb-6 p-4 border rounded-lg bg-gray-50">
        <legend className="px-2 font-bold text-lg text-gray-700">Item Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Item name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full p-2 border rounded ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Number of items"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Unit Price *</label>
            <input
              type="number"
              step="0.01"
              name="unit_price"
              value={form.unit_price}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.unit_price ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Price per unit"
            />
            {errors.unit_price && <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>}
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Last Restock Date</label>
            <input
              type="date"
              name="last_restock"
              value={form.last_restock}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Staff Custodian</label>
            <select
              name="staff_custodian"
              value={form.staff_custodian || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="">Select staff member</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Assigned Student</label>
            <select
              name="assigned_to_student"
              value={form.assigned_to_student || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="">Select student</option>
              {students.map(st => (
                <option key={st.id} value={st.id}>{st.full_name}</option>
              ))}
            </select>
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
          {loading ? "Saving..." : (isEdit ? "Update Item" : "Add Item")}
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
