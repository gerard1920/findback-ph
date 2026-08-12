"use client";
import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Message={id:string;body:string;sender_id:string;full_name:string;created_at:string};
export default function Conversation({params}:{params:Promise<{id:string}>}){
  const {id}=use(params);
  const router=useRouter();
  const [messages,setMessages]=useState<Message[]>([]);
  const [body,setBody]=useState("");
  const [error,setError]=useState<string>();
  const [sending,setSending]=useState(false);
  const [live,setLive]=useState(false);
  const seenRef=useRef<Set<string>>(new Set());
  const load=useCallback(()=>fetch(`/api/messages/${encodeURIComponent(id)}`,{credentials:"same-origin"}).then(async r=>{
    if(r.status===401){router.replace("/login");return;}
    if(!r.ok){
      let message="Unable to load messages.";
      try{const d=await r.json();message=d.error||message;}catch{}
      throw new Error(message);
    }
    const d=await r.json();
    const next:Message[]=d.data?.messages??[];
    setMessages((current)=>{
      const exists=new Set(current.map(m=>m.id));
      const merged=[...current];
      for(const m of next){
        if(!exists.has(m.id)) merged.push(m);
      }
      return merged;
    });
    const unseen=new Set(next.filter(m=>m.sender_id!==(currentUserRef.current?.id) && !seenRef.current.has(m.id)).map(m=>m.id));
    if(unseen.size>0 && document.visibilityState==="visible"){
      seenRef.current=new Set(next.map(m=>m.id));
      fetch(`/api/messages/${encodeURIComponent(id)}`,{method:"PATCH",credentials:"same-origin"}).catch(()=>{});
    }
  }).catch(e=>setError(e instanceof Error?e.message:"Unable to load messages.")),[id,router]);
  const currentUserRef=useRef<{id:string}|null>(null);
  useEffect(()=>{
    let active=true;
    fetch("/api/session",{credentials:"same-origin"}).then(async r=>{
      if(!r.ok)return;
      const d=await r.json();
      if(active && d?.data?.id) currentUserRef.current=d.data;
    }).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{load()},[load]);
  useEffect(()=>{
    setLive(true);
    const interval=setInterval(load,3000);
    const onFocus=()=>load();
    window.addEventListener("focus",onFocus);
    return ()=>{setLive(false);clearInterval(interval);window.removeEventListener("focus",onFocus);};
  },[load]);
  async function send(e:React.FormEvent){
    e.preventDefault();
    if(!body.trim())return;
    setSending(true);
    setError(undefined);
    try{
      const r=await fetch(`/api/messages/${encodeURIComponent(id)}`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({body})});
      if(!r.ok){
        let message=`Unable to send message. (status ${r.status})`;
        const contentType = r.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          try{const d=await r.json();message=d.error||message;}catch{}
        } else {
          try{const text = await r.text();message = `${message} ${text}`;}catch{}
        }
        throw new Error(message);
      }
      setBody("");
      await load();
    }catch(e){
      setError(e instanceof Error?e.message:"Unable to send message.");
    }finally{
      setSending(false);
    }
  }
  return (
    <main className="container-page max-w-3xl py-10">
      <div className="flex items-center justify-between gap-3">
        <Link className="text-sm font-semibold text-blue-700" href="/messages">← All messages</Link>
        <span className="text-xs font-medium text-slate-500">{live ? "Live" : "Paused"}</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold">Conversation</h1>
      <div className="card mt-6 space-y-3 p-5">
        {messages.length?messages.map(m=>(
          <div className="rounded-lg bg-slate-50 p-3" key={m.id}>
            <b className="text-sm">{m.full_name}</b>
            <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            <time className="mt-2 block text-xs text-slate-500">{new Date(m.created_at).toLocaleString("en-PH")}</time>
          </div>
        )):<p className="text-slate-600">No messages yet.</p>}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-3">
        <input value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} placeholder="Write a message" aria-label="Message" className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" />
        <button disabled={sending} className="btn-primary">{sending?"Sending…":"Send"}</button>
      </form>
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </main>
  );
}
