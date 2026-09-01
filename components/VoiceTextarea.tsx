"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionInstance={
  continuous:boolean;
  interimResults:boolean;
  lang:string;
  start:()=>void;
  stop:()=>void;
  abort:()=>void;
  onresult:((event:any)=>void)|null;
  onerror:((event:any)=>void)|null;
  onend:(()=>void)|null;
};

declare global{
  interface Window{
    SpeechRecognition?:new()=>SpeechRecognitionInstance;
    webkitSpeechRecognition?:new()=>SpeechRecognitionInstance;
  }
}

export default function VoiceTextarea({value,onChange,describedBy}:{value:string,onChange:(value:string)=>void,describedBy:string}){
  const recognitionRef=useRef<SpeechRecognitionInstance|null>(null);
  const [listening,setListening]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>()=>recognitionRef.current?.abort(),[]);

  const toggle=()=>{
    if(listening){recognitionRef.current?.stop();return;}
    const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Recognition){setMessage("Voice-to-text is not supported by this browser. You can still type your response.");return;}
    try{
      const recognition=new Recognition();
      recognition.continuous=true;
      recognition.interimResults=true;
      recognition.lang=navigator.language||"en-US";
      recognitionRef.current=recognition;
      const startingValue=value;
      let finalTranscript="";
      recognition.onresult=(event:any)=>{
        let interimTranscript="";
        for(let i=event.resultIndex;i<event.results.length;i++){
          const transcript=String(event.results[i][0]?.transcript||"");
          if(event.results[i].isFinal) finalTranscript+=`${transcript.trim()} `;
          else interimTranscript+=transcript;
        }
        const spoken=`${finalTranscript}${interimTranscript}`.trim();
        const prefix=startingValue.trimEnd();
        onChange(spoken?`${prefix}${prefix?" ":""}${spoken}`:startingValue);
      };
      recognition.onerror=(event:any)=>{
        setListening(false);
        const error=String(event?.error||"");
        if(error==="not-allowed"||error==="service-not-allowed") setMessage("Microphone access was blocked. Allow microphone access in your browser settings, then try again.");
        else if(error==="no-speech") setMessage("No speech was detected. Tap the microphone and try again.");
        else setMessage("Voice-to-text stopped. Tap the microphone to try again.");
      };
      recognition.onend=()=>{setListening(false);recognitionRef.current=null};
      recognition.start();
      setListening(true);
      setMessage("Listening… speak naturally. Your words will appear in the response box.");
    }catch{
      setListening(false);
      setMessage("Voice-to-text could not start. Check microphone permissions and try again.");
    }
  };

  return <>
    <textarea className="large" value={value} aria-describedby={describedBy} onChange={e=>onChange(e.target.value)}/>
    <div className="voice-input-controls">
      <button type="button" className={`voice-input-button ${listening?"listening":""}`} onClick={toggle} aria-pressed={listening}>{listening?"■ Stop listening":"🎙 Enable Audio / Voice to Text"}</button>
      {message&&<small className="voice-input-message" aria-live="polite">{message}</small>}
    </div>
  </>;
}
