import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TYPES = [
  ["ALLERGY","Allergy"],
  ["MEDICATION","Medication"],
  ["TREATMENT","Treatment"],
  ["VACCINATION","Vaccination"],
];

export default function MedicalForm({ initial, onSaved, onCancel }) {
  const [students,setStudents]=useState([]);
  const [form,setForm]=useState({
    student:"", record_type:"ALLERGY", date:"", description:"",
    attachment:null, resolved:false, ...initial,
  });
  const isEdit=!!initial?.id;
  const update=(k,v)=>setForm({...form,[k]:v});

  useEffect(()=>{ fetch("http://127.0.0.1:8000/api/students/")
    .then(r=>r.json()).then(setStudents); }, []);

  const handleSubmit=e=>{
    e.preventDefault();
    const url=`http://127.0.0.1:8000/api/medical/${isEdit? initial.id+"/":""}`;
    const body=new FormData();
    Object.entries(form).forEach(([k,v])=> {
      if(v!==""&&v!==null) body.append(k,v);
    });
    fetch(url,{method:isEdit?"PUT":"POST",body})
      .then(r=>{if(!r.ok) throw new Error(); return r.json();})
      .then(()=>{toast.success(isEdit?"Record updated":"Record added"); onSaved();})
      .catch(()=>toast.error("Save failed"));
  };

  const L=({label,children})=> <div><label className="block text-sm mb-1">{label}</label>{children}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <L label="Student">
        <select required value={form.student} onChange={e=>update("student",e.target.value)}
                className="w-full border rounded px-3 py-1">
          <option value="">—</option>
          {students.map(s=> <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      </L>

      <L label="Record type">
        <select value={form.record_type} onChange={e=>update("record_type",e.target.value)}
                className="w-full border rounded px-3 py-1">
          {TYPES.map(([v,l])=> <option key={v} value={v}>{l}</option>)}
        </select>
      </L>

      <L label="Date">
        <input type="date" value={form.date} onChange={e=>update("date",e.target.value)}
               className="w-full border rounded px-3 py-1"/>
      </L>

      <L label="Description">
        <textarea rows={3} value={form.description}
          onChange={e=>update("description",e.target.value)}
          className="w-full border rounded px-3 py-2"/>
      </L>

      <L label="Attachment">
        <input type="file" onChange={e=>update("attachment",e.target.files[0]||null)} />
      </L>

      <div className="flex items-center gap-2">
        <input id="resolved" type="checkbox" checked={form.resolved}
               onChange={e=>update("resolved",e.target.checked)}/>
        <label htmlFor="resolved" className="text-sm">Resolved</label>
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

