import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUS = [
  ["PAID","Paid"],
  ["UNPAID","Unpaid"],
  ["PARTIAL","Partially Paid"],
];

export default function InvoiceForm({ initial, onSaved, onCancel }) {
  const [students,setStudents]=useState([]);
  const [form,setForm]=useState({
    student:"", issue_date:"", due_date:"", amount:"", description:"",
    status:"UNPAID", is_income:true, is_expense:false, tax_percentage:"",
    is_purchase:false, ...initial,
  });
  const isEdit=!!initial?.id;
  const update=(k,v)=>setForm({...form,[k]:v});

  useEffect(()=>{ fetch("http://127.0.0.1:8000/api/students/")
    .then(r=>r.json()).then(setStudents); }, []);

  const handleSubmit=e=>{
    e.preventDefault();
    const url=`http://127.0.0.1:8000/api/invoices/${isEdit? initial.id+"/":""}`;
    fetch(url,{
      method:isEdit?"PUT":"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form),
    })
      .then(r=>{if(!r.ok) throw new Error(); return r.json();})
      .then(()=>{toast.success(isEdit?"Invoice updated":"Invoice added"); onSaved();})
      .catch(()=>toast.error("Save failed"));
  };

  const L=({label,children})=> <div><label className="block text-sm mb-1">{label}</label>{children}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <L label="Student">
        <select required value={form.student}
                onChange={e=>update("student",e.target.value)}
                className="w-full border rounded px-3 py-1">
          <option value="">—</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Issue date">
          <input type="date" value={form.issue_date}
                 onChange={e=>update("issue_date",e.target.value)}
                 className="w-full border rounded px-3 py-1"/>
        </L>
        <L label="Due date">
          <input type="date" value={form.due_date}
                 onChange={e=>update("due_date",e.target.value)}
                 className="w-full border rounded px-3 py-1"/>
        </L>
      </div>

      <L label="Amount">
        <input type="number" step="0.01" value={form.amount}
               onChange={e=>update("amount",e.target.value)}
               className="w-full border rounded px-3 py-1"/>
      </L>

      <L label="Description">
        <textarea rows={2} value={form.description}
                  onChange={e=>update("description",e.target.value)}
                  className="w-full border rounded px-3 py-2"/>
      </L>

      <L label="Status">
        <select value={form.status} onChange={e=>update("status",e.target.value)}
                className="w-full border rounded px-3 py-1">
          {STATUS.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
        </select>
      </L>

      <div className="grid grid-cols-2 gap-4">
        <L label="Tax %">
          <input type="number" step="0.01" value={form.tax_percentage}
                 onChange={e=>update("tax_percentage",e.target.value)}
                 className="w-full border rounded px-3 py-1"/>
        </L>
        <L label="Category">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={form.is_income}
                     onChange={e=>update("is_income",e.target.checked)}/> Income
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={form.is_expense}
                     onChange={e=>update("is_expense",e.target.checked)}/> Expense
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={form.is_purchase}
                     onChange={e=>update("is_purchase",e.target.checked)}/> Purchase
            </label>
          </div>
        </L>
      </div>

      <div className="flex gap-2">
        <button type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isEdit?"Update":"Add"}
        </button>
        <button type="button" onClick={onCancel}
                className="flex-1 border rounded py-2">Cancel</button>
      </div>
    </form>
  );
}

