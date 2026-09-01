"use client";

export default function VoiceTextarea({value,onChange,describedBy}:{value:string,onChange:(value:string)=>void,describedBy:string}){
  return <textarea className="large" value={value} aria-describedby={describedBy} onChange={e=>onChange(e.target.value)}/>;
}
