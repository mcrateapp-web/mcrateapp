import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ydokybkulrxqhyavtncf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb2t5Ymt1bHJ4cWh5YXZ0bmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjQ1NTEsImV4cCI6MjA5MzEwMDU1MX0.LHkkpLnkq6i6hSa3ysm0cVKqU7ynImT6lAv19JbFMgs";

const C = { red:"#DA291C", gold:"#FFC72C", dark:"#1A1A1A", white:"#FFFFFF", gray:"#6B7280", light:"#F3F4F6", border:"#E5E7EB", green:"#16A34A", blue:"#2563EB", orange:"#EA580C" };

const sb = {
  async query(table, params="", token=null) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${token||SUPABASE_ANON_KEY}`} });
    return r.json();
  },
  async update(table, filter, data, token) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, { method:"PATCH", headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${token}`,"Content-Type":"application/json","Prefer":"return=representation"}, body:JSON.stringify(data) });
    return r.json();
  },
  async delete(table, filter, token) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, { method:"DELETE", headers:{"apikey":SUPABASE_ANON_KEY,"Authorization":`Bearer ${token}`} });
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:"POST", headers:{"apikey":SUPABASE_ANON_KEY,"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
    return r.json();
  },
};

const fmt = n => n>=1000?`${(n/1000).toFixed(1)}k`:String(n??0);
const timeAgo = d => { if(!d)return""; const s=(Date.now()-new Date(d))/1000; if(s<60)return"just now"; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return`${Math.floor(s/86400)}d ago`; };
const fmtDate = d => d?new Date(d).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"}):"";

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const login = async () => { setLoading(true);setErr(""); const d=await sb.signIn(email,pw); d.access_token?onLogin(d.access_token,d.user):setErr("Invalid credentials"); setLoading(false); };
  return (
    <div style={{minHeight:"100vh",background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:C.white,borderRadius:20,padding:40,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:C.red,letterSpacing:2}}>McRATE</div>
          <div style={{fontSize:12,color:C.gray,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Admin Dashboard</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={{padding:"12px 16px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:15,fontFamily:"inherit",outline:"none"}}/>
          <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==="Enter"&&login()} style={{padding:"12px 16px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:15,fontFamily:"inherit",outline:"none"}}/>
          {err&&<div style={{color:C.red,fontSize:13,fontWeight:600}}>{err}</div>}
          <button onClick={login} disabled={loading} style={{background:C.red,color:C.white,border:"none",borderRadius:10,padding:"13px 0",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>{loading?"Signing in…":"Sign In"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{background:C.white,borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",...style}}>{children}</div>;
}

function StatCard({ label, value, icon, color=C.red, sub }) {
  return (
    <Card style={{padding:"20px 24px",borderTop:`3px solid ${color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:12,color:C.gray,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{label}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,color:C.dark,lineHeight:1}}>{fmt(value)}</div>
          {sub&&<div style={{fontSize:12,color:C.gray,marginTop:4}}>{sub}</div>}
        </div>
        <div style={{fontSize:28}}>{icon}</div>
      </div>
    </Card>
  );
}

function Btn({ children, onClick, color=C.red, outline=false, small=false, disabled=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":disabled?C.light:color,color:outline?color:disabled?C.gray:C.white,border:outline?`1.5px solid ${color}`:"none",borderRadius:8,padding:small?"5px 12px":"8px 16px",fontWeight:600,fontSize:small?12:13,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
      {children}
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.white,borderRadius:16,padding:28,width:"100%",maxWidth:520,maxHeight:"85vh",overflow:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1.5,color:C.dark}}>{title}</div>
          <button onClick={onClose} style={{background:C.light,border:"none",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DataTable({ cols, rows, actions, empty="No data" }) {
  if(!rows?.length) return <div style={{textAlign:"center",padding:"40px 0",color:C.gray,fontSize:14}}>{empty}</div>;
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {cols.map(c=><th key={c.key} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,color:C.gray,whiteSpace:"nowrap"}}>{c.label}</th>)}
            {actions&&<th style={{padding:"10px 14px",textAlign:"right",fontSize:11,textTransform:"uppercase",letterSpacing:0.5,color:C.gray}}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={row.id||i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.white:C.light}}>
              {cols.map(c=>(
                <td key={c.key} style={{padding:"10px 14px",color:C.dark,whiteSpace:c.wrap?"normal":"nowrap",maxWidth:c.maxW||"auto",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {c.render?c.render(row[c.key],row):row[c.key]??"—"}
                </td>
              ))}
              {actions&&<td style={{padding:"10px 14px",textAlign:"right"}}>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder, count }) {
  return (
    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{flex:1,padding:"9px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",outline:"none"}}/>
      {count!=null&&<div style={{fontSize:13,color:C.gray,whiteSpace:"nowrap"}}>{count} results</div>}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ stats }) {
  const reviews = stats.reviews||[];
  const profiles = stats.profiles||[];

  const ratingData = [1,2,3,4,5].map(r=>({name:`${r}★`,count:reviews.filter(x=>x.rating===r).length}));

  const groupByDay = arr => {
    const map={};
    arr.forEach(x=>{ const d=new Date(x.created_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"}); map[d]=(map[d]||0)+1; });
    return Object.entries(map).slice(-14).map(([date,count])=>({date,count}));
  };

  const topLocs = Object.entries(reviews.reduce((acc,r)=>{acc[r.location_id]=(acc[r.location_id]||0)+1;return acc;},{}))
    .sort((a,b)=>b[1]-a[1]).slice(0,6).map(([id,count])=>({name:(stats.locations?.find(l=>l.id===id)?.name||id).replace(/mcdonald's\s*/i,"").slice(0,18),count}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
        <StatCard label="Users" value={profiles.length} icon="👤" color={C.red}/>
        <StatCard label="Reviews" value={reviews.length} icon="⭐" color={C.gold}/>
        <StatCard label="Comments" value={stats.comments?.length??0} icon="💬" color={C.blue}/>
        <StatCard label="Votes" value={stats.votes?.length??0} icon="👍" color={C.green}/>
        <StatCard label="Locations" value={stats.locations?.length??0} icon="📍" color={C.orange}/>
        <StatCard label="Reports" value={stats.reports?.length??0} sub="needs review" icon="🚩" color="#DC2626"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20}}>
        <Card style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>New Users — Last 14 Days</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={groupByDay(profiles)}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} width={20}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
              <Line type="monotone" dataKey="count" stroke={C.red} strokeWidth={2.5} dot={false} name="Signups"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>Reviews — Last 14 Days</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={groupByDay(reviews)}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} width={20}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
              <Line type="monotone" dataKey="count" stroke={C.gold} strokeWidth={2.5} dot={false} name="Reviews"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>Rating Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ratingData}>
              <XAxis dataKey="name" tick={{fontSize:12}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} width={20}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
              <BarChart data={ratingData}/>
              {ratingData.map((_,i)=>null)}
              <Bar dataKey="count" radius={[4,4,0,0]} name="Reviews">
                {ratingData.map((_,i)=><Cell key={i} fill={i>=3?C.green:i<=1?C.red:C.gold}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>Top Locations</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topLocs} layout="vertical">
              <XAxis type="number" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:10}} tickLine={false} axisLine={false} width={110}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
              <Bar dataKey="count" fill={C.gold} radius={[0,4,4,0]} name="Reviews"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:14}}>Recent Reviews</div>
        <DataTable
          cols={[
            {key:"image",label:"",render:(v,r)=>r.images?.[0]?<img src={r.images[0]} alt="" style={{width:40,height:40,borderRadius:8,objectFit:"cover"}}/>:<div style={{width:40,height:40,borderRadius:8,background:C.light}}/>},
            {key:"user_id",label:"User",render:(v,r)=>stats.profiles?.find(p=>p.id===v)?.name||"Unknown"},
            {key:"location_id",label:"Location",render:(v)=>stats.locations?.find(l=>l.id===v)?.name?.replace(/mcdonald's\s*/i,"")||"Unknown",maxW:"180px"},
            {key:"rating",label:"Rating",render:v=><span style={{color:v>=4?C.green:v<=2?C.red:C.gold,fontWeight:700}}>{v}★</span>},
            {key:"created_at",label:"Posted",render:v=>timeAgo(v)},
          ]}
          rows={reviews.slice(0,10)}
        />
      </Card>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function Reviews({ stats, token, onRefresh }) {
  const [q,setQ]=useState(""); const [rFilter,setRFilter]=useState("all"); const [del,setDel]=useState(null); const [view,setView]=useState(null);
  const rows = (stats.reviews||[]).filter(r=>{
    const loc=stats.locations?.find(l=>l.id===r.location_id)?.name||"";
    const user=stats.profiles?.find(p=>p.id===r.user_id)?.name||"";
    return (!q||loc.toLowerCase().includes(q.toLowerCase())||user.toLowerCase().includes(q.toLowerCase()))&&(rFilter==="all"||r.rating===parseInt(rFilter));
  }).map(r=>({...r,userName:stats.profiles?.find(p=>p.id===r.user_id)?.name||"Unknown",locationName:stats.locations?.find(l=>l.id===r.location_id)?.name||"Unknown"}));

  return (
    <div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={{flex:1,minWidth:180,padding:"9px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",outline:"none"}}/>
        <select value={rFilter} onChange={e=>setRFilter(e.target.value)} style={{padding:"9px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",background:C.white,outline:"none"}}>
          <option value="all">All ratings</option>
          {[5,4,3,2,1].map(r=><option key={r} value={r}>{r}★</option>)}
        </select>
        <span style={{fontSize:13,color:C.gray}}>{rows.length} reviews</span>
      </div>
      <Card>
        <DataTable
          cols={[
            {key:"images",label:"",render:(v,r)=>v?.[0]?<img src={v[0]} alt="" style={{width:44,height:44,borderRadius:8,objectFit:"cover"}}/>:<div style={{width:44,height:44,background:C.light,borderRadius:8}}/>},
            {key:"userName",label:"User"},
            {key:"locationName",label:"Location",maxW:"180px"},
            {key:"food_item",label:"Item"},
            {key:"rating",label:"Rating",render:v=><span style={{color:v>=4?C.green:v<=2?C.red:C.gold,fontWeight:700}}>{v}★</span>},
            {key:"created_at",label:"Posted",render:v=>fmtDate(v)},
          ]}
          rows={rows}
          actions={row=>(
            <div style={{display:"flex",gap:8}}>
              <Btn small outline color={C.blue} onClick={()=>setView(row)}>View</Btn>
              <Btn small outline color={C.red} onClick={()=>setDel(row)}>Delete</Btn>
            </div>
          )}
        />
      </Card>

      {view&&<Modal title="Review" onClose={()=>setView(null)}>
        {(view.images||[]).map((img,i)=><img key={i} src={img} alt="" style={{width:"100%",borderRadius:12,marginBottom:10,objectFit:"cover",maxHeight:260}}/>)}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontSize:14,marginBottom:14}}>
          {[["User",view.userName],["Location",view.locationName],["Item",view.food_item],["Rating",`${view.rating}★`],["Agrees",view.agrees],["Posted",fmtDate(view.created_at)]].map(([k,v])=>(
            <div key={k}><div style={{fontSize:11,color:C.gray,fontWeight:700,textTransform:"uppercase"}}>{k}</div><div style={{fontWeight:600,marginTop:2}}>{v}</div></div>
          ))}
        </div>
        {view.text&&<div style={{fontSize:14,lineHeight:1.6,background:C.light,borderRadius:10,padding:14}}>{view.text}</div>}
        <div style={{marginTop:16,textAlign:"right"}}><Btn color={C.red} onClick={()=>{setView(null);setDel(view);}}>Delete Review</Btn></div>
      </Modal>}

      {del&&<Modal title="Delete Review?" onClose={()=>setDel(null)}>
        <p style={{fontSize:14,color:C.gray,marginBottom:20}}>Permanently delete this review by <strong>{del.userName}</strong>? This cannot be undone.</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn outline color={C.gray} onClick={()=>setDel(null)}>Cancel</Btn>
          <Btn color={C.red} onClick={async()=>{await sb.delete("reviews",`id=eq.${del.id}`,token);setDel(null);onRefresh();}}>Delete</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function Users({ stats, token, onRefresh }) {
  const [q,setQ]=useState(""); const [view,setView]=useState(null); const [edit,setEdit]=useState(null); const [editName,setEditName]=useState("");
  const rows = (stats.profiles||[]).filter(u=>!q||u.name?.toLowerCase().includes(q.toLowerCase())||u.email?.toLowerCase().includes(q.toLowerCase()))
    .map(u=>({...u,reviewCount:(stats.reviews||[]).filter(r=>r.user_id===u.id).length}));

  const block = async (u,val) => { await sb.update("profiles",`id=eq.${u.id}`,{blocked:val},token); onRefresh(); };
  const saveEdit = async () => { await sb.update("profiles",`id=eq.${edit.id}`,{name:editName},token); setEdit(null); onRefresh(); };

  return (
    <div>
      <SearchBar value={q} onChange={setQ} placeholder="Search by name or email…" count={rows.length}/>
      <Card>
        <DataTable
          cols={[
            {key:"name",label:"Name",render:(v,r)=><span style={{fontWeight:600,color:r.blocked?C.gray:C.dark,textDecoration:r.blocked?"line-through":"none"}}>{v||"Unnamed"}</span>},
            {key:"email",label:"Email",maxW:"200px"},
            {key:"tier",label:"Tier",render:v=><span style={{background:v==="gold"?C.gold:v==="silver"?"#9CA3AF":"#CD7F32",color:v==="silver"?C.white:C.dark,padding:"2px 8px",borderRadius:50,fontSize:11,fontWeight:700}}>{v||"bronze"}</span>},
            {key:"reviewCount",label:"Reviews"},
            {key:"created_at",label:"Joined",render:v=>fmtDate(v)},
            {key:"blocked",label:"Status",render:v=><span style={{color:v?C.red:C.green,fontWeight:700,fontSize:12}}>{v?"Blocked":"Active"}</span>},
          ]}
          rows={rows}
          actions={row=>(
            <div style={{display:"flex",gap:6}}>
              <Btn small outline color={C.blue} onClick={()=>setView(row)}>View</Btn>
              <Btn small outline color={C.dark} onClick={()=>{setEdit(row);setEditName(row.name||"");}}>Edit</Btn>
              {row.blocked?<Btn small outline color={C.green} onClick={()=>block(row,false)}>Unblock</Btn>:<Btn small outline color={C.red} onClick={()=>block(row,true)}>Block</Btn>}
            </div>
          )}
        />
      </Card>

      {view&&<Modal title="User Profile" onClose={()=>setView(null)}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:C.gold}}>{view.name?.[0]?.toUpperCase()||"?"}</div>
          <div><div style={{fontWeight:700,fontSize:18}}>{view.name}</div><div style={{fontSize:13,color:C.gray}}>{view.email}</div><div style={{fontSize:12,color:C.gray}}>Joined {fmtDate(view.created_at)}</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[["Reviews",view.reviewCount],["Tier",view.tier||"bronze"],["Status",view.blocked?"Blocked":"Active"]].map(([k,v])=>(
            <div key={k} style={{background:C.light,borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:11,color:C.gray,fontWeight:700,textTransform:"uppercase"}}>{k}</div><div style={{fontWeight:700,fontSize:15,marginTop:2}}>{v}</div></div>
          ))}
        </div>
        <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Recent Reviews</div>
        {(stats.reviews||[]).filter(r=>r.user_id===view.id).slice(0,4).map(r=>(
          <div key={r.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
            {r.images?.[0]&&<img src={r.images[0]} alt="" style={{width:40,height:40,borderRadius:8,objectFit:"cover"}}/>}
            <div style={{flex:1,fontSize:13}}><div style={{fontWeight:600}}>{r.food_item}</div><div style={{color:C.gray,fontSize:12}}>{stats.locations?.find(l=>l.id===r.location_id)?.name?.replace(/mcdonald's\s*/i,"")||"Unknown"}</div></div>
            <span style={{color:r.rating>=4?C.green:r.rating<=2?C.red:C.gold,fontWeight:700}}>{r.rating}★</span>
          </div>
        ))}
        <div style={{marginTop:16,textAlign:"right"}}>{view.blocked?<Btn color={C.green} onClick={()=>{block(view,false);setView(null);}}>Unblock</Btn>:<Btn color={C.red} onClick={()=>{block(view,true);setView(null);}}>Block User</Btn>}</div>
      </Modal>}

      {edit&&<Modal title="Edit User" onClose={()=>setEdit(null)}>
        <label style={{fontSize:12,fontWeight:700,color:C.gray,textTransform:"uppercase",display:"block",marginBottom:6}}>Display Name</label>
        <input value={editName} onChange={e=>setEditName(e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:16}}/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn outline color={C.gray} onClick={()=>setEdit(null)}>Cancel</Btn>
          <Btn onClick={saveEdit}>Save</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ─── Locations Tab ────────────────────────────────────────────────────────────
function Locations({ stats, token, onRefresh }) {
  const [q,setQ]=useState(""); const [edit,setEdit]=useState(null); const [editName,setEditName]=useState(""); const [saving,setSaving]=useState(false);
  const rows = (stats.locations||[]).filter(l=>!q||l.name?.toLowerCase().includes(q.toLowerCase())).map(l=>{
    const revs=(stats.reviews||[]).filter(r=>r.location_id===l.id);
    return {...l,reviewCount:revs.length,avg:revs.length?(revs.reduce((a,r)=>a+r.rating,0)/revs.length).toFixed(1):null};
  }).sort((a,b)=>b.reviewCount-a.reviewCount);

  const save = async () => { setSaving(true); await sb.update("locations",`id=eq.${edit.id}`,{name:editName},token); setSaving(false); setEdit(null); onRefresh(); };

  return (
    <div>
      <SearchBar value={q} onChange={setQ} placeholder="Search locations…" count={rows.length}/>
      <Card>
        <DataTable
          cols={[
            {key:"name",label:"Location Name",wrap:true},
            {key:"reviewCount",label:"Reviews"},
            {key:"avg",label:"Avg Rating",render:v=>v?<span style={{color:v>=4?C.green:v<=2?C.red:C.gold,fontWeight:700}}>{v}★</span>:"—"},
          ]}
          rows={rows}
          actions={row=>(
            <div style={{display:"flex",gap:8}}>
              <Btn small outline color={C.dark} onClick={()=>{setEdit(row);setEditName(row.name||"");}}>Edit Name</Btn>
              {row.reviewCount===0&&<Btn small outline color={C.red} onClick={async()=>{if(window.confirm("Delete this empty location?"))await sb.delete("locations",`id=eq.${row.id}`,token);onRefresh();}}>Delete</Btn>}
            </div>
          )}
        />
      </Card>

      {edit&&<Modal title="Edit Location Name" onClose={()=>setEdit(null)}>
        <div style={{fontSize:13,color:C.gray,marginBottom:12}}>This updates instantly across all reviews that reference this location.</div>
        <input value={editName} onChange={e=>setEditName(e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:16}}/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn outline color={C.gray} onClick={()=>setEdit(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ─── Moderation Tab ───────────────────────────────────────────────────────────
function Moderation({ stats, token, onRefresh }) {
  const reports = (stats.reports||[]).map(rep=>({...rep,reviewer:stats.profiles?.find(p=>p.id===rep.reporter_id)?.name||"Unknown",review:stats.reviews?.find(r=>r.id===rep.review_id)}));
  if(!reports.length) return (
    <Card style={{padding:60,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12}}>✅</div>
      <div style={{fontWeight:700,fontSize:18,color:C.dark}}>All clear</div>
      <div style={{color:C.gray,fontSize:14,marginTop:4}}>No pending reports</div>
    </Card>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {reports.map(rep=>(
        <Card key={rep.id} style={{padding:20,borderLeft:`4px solid ${C.red}`}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:12,color:C.red,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>🚩 Reported by {rep.reviewer} · {timeAgo(rep.created_at)}</div>
              <div style={{fontSize:14,color:C.gray,marginBottom:10}}>Reason: {rep.reason||"No reason given"}</div>
              {rep.review&&<div style={{background:C.light,borderRadius:10,padding:14}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  {rep.review.images?.[0]&&<img src={rep.review.images[0]} alt="" style={{width:56,height:56,borderRadius:8,objectFit:"cover",flexShrink:0}}/>}
                  <div><div style={{fontWeight:600,fontSize:14}}>{rep.review.food_item} · {rep.review.rating}★</div><div style={{fontSize:12,color:C.gray}}>{stats.locations?.find(l=>l.id===rep.review.location_id)?.name}</div>{rep.review.text&&<div style={{fontSize:13,marginTop:6}}>{rep.review.text.slice(0,120)}{rep.review.text.length>120?"…":""}</div>}</div>
                </div>
              </div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:140}}>
              <Btn outline color={C.green} small onClick={async()=>{await sb.delete("reports",`id=eq.${rep.id}`,token);onRefresh();}}>Dismiss Report</Btn>
              <Btn color={C.red} small onClick={async()=>{await sb.delete("reviews",`id=eq.${rep.review_id}`,token);await sb.delete("reports",`id=eq.${rep.id}`,token);onRefresh();}}>Delete Review</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Comments Tab ─────────────────────────────────────────────────────────────
function Comments({ stats, token, onRefresh }) {
  const [q,setQ]=useState("");
  const rows = (stats.comments||[]).filter(c=>!q||c.text?.toLowerCase().includes(q.toLowerCase()))
    .map(c=>({...c,userName:stats.profiles?.find(p=>p.id===c.user_id)?.name||"Unknown"}));
  return (
    <div>
      <SearchBar value={q} onChange={setQ} placeholder="Search comments…" count={rows.length}/>
      <Card>
        <DataTable
          cols={[
            {key:"userName",label:"User"},
            {key:"text",label:"Comment",wrap:true,maxW:"500px"},
            {key:"created_at",label:"Posted",render:v=>timeAgo(v)},
          ]}
          rows={rows}
          actions={row=><Btn small outline color={C.red} onClick={async()=>{await sb.delete("comments",`id=eq.${row.id}`,token);onRefresh();}}>Delete</Btn>}
        />
      </Card>
    </div>
  );
}

// ─── Announcements ────────────────────────────────────────────────────────────
function Announcements({ token }) {
  const [msg,setMsg]=useState(""); const [type,setType]=useState("info"); const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false);
  const typeColors = {info:{bg:"#EFF6FF",text:C.blue},success:{bg:"#F0FDF4",text:C.green},warning:{bg:"#FFFBEB",text:"#92400E"},alert:{bg:"#FEF2F2",text:"#991B1B"}};
  const save = async () => { setSaving(true); await sb.update("app_settings","key=eq.announcement",{value:JSON.stringify({message:msg,type,active:!!msg})},token).catch(async()=>await sb.signIn("","").catch(()=>{})); setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  return (
    <div style={{maxWidth:600}}>
      <Card style={{padding:24}}>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Feed Announcement Banner</div>
        <div style={{fontSize:13,color:C.gray,marginBottom:20}}>Shows at the top of the feed for all users. Leave blank to hide.</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.gray,textTransform:"uppercase",display:"block",marginBottom:6}}>Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",background:C.white,outline:"none"}}>
              <option value="info">Info (blue)</option>
              <option value="success">Success (green)</option>
              <option value="warning">Warning (yellow)</option>
              <option value="alert">Alert (red)</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.gray,textTransform:"uppercase",display:"block",marginBottom:6}}>Message</label>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="e.g. 🎉 McRate is now live! Share with your friends…" rows={3}
              style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:14,fontFamily:"inherit",outline:"none",resize:"vertical"}}/>
          </div>
          {msg&&<div style={{background:typeColors[type]?.bg,borderRadius:10,padding:"12px 16px",fontSize:14,color:typeColors[type]?.text,fontWeight:500}}>{msg}</div>}
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Save Announcement"}</Btn>
            {msg&&<Btn outline color={C.gray} onClick={()=>setMsg("")}>Clear</Btn>}
            {saved&&<span style={{fontSize:13,color:C.green,fontWeight:600}}>✓ Saved</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function McRateAdmin() {
  const [token,setToken]=useState(()=>localStorage.getItem("mcrate_admin_token")||null);
  const [adminUser,setAdminUser]=useState(null);
  const [tab,setTab]=useState("overview");
  const [stats,setStats]=useState({});
  const [loading,setLoading]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const load = useCallback(async (tok) => {
    if(!tok) return;
    setLoading(true);
    const [profiles,reviews,comments,votes,locations,reports] = await Promise.all([
      sb.query("profiles","?select=*&order=created_at.desc",tok),
      sb.query("reviews","?select=*&order=created_at.desc&limit=500",tok),
      sb.query("comments","?select=*&order=created_at.desc&limit=1000",tok),
      sb.query("votes","?select=*",tok),
      sb.query("locations","?select=*",tok),
      sb.query("reports","?select=*&order=created_at.desc",tok).catch(()=>[]),
    ]);
    setStats({profiles,reviews,comments,votes,locations,reports});
    setLoading(false);
  },[]);

  useEffect(()=>{if(token)load(token);},[token,load]);

  const handleLogin = (tok,user) => { localStorage.setItem("mcrate_admin_token",tok); setToken(tok); setAdminUser(user); };
  const handleLogout = () => { localStorage.removeItem("mcrate_admin_token"); setToken(null); setStats({}); };

  if(!token) return <LoginScreen onLogin={handleLogin}/>;

  const TABS = [
    {id:"overview",label:"Overview",icon:"📊"},
    {id:"reviews",label:"Reviews",icon:"⭐"},
    {id:"users",label:"Users",icon:"👤"},
    {id:"locations",label:"Locations",icon:"📍"},
    {id:"moderation",label:"Moderation",icon:"🚩",badge:stats.reports?.length},
    {id:"comments",label:"Comments",icon:"💬"},
    {id:"announcements",label:"Announcements",icon:"📢"},
  ];

  const props = {stats,token,onRefresh:()=>load(token)};
  const content = {overview:<Overview {...props}/>,reviews:<Reviews {...props}/>,users:<Users {...props}/>,locations:<Locations {...props}/>,moderation:<Moderation {...props}/>,comments:<Comments {...props}/>,announcements:<Announcements {...props}/>};

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",background:C.light}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box}
        @media(max-width:768px){.sidebar{transform:translateX(-100%)!important}.sidebar.open{transform:translateX(0)!important}.main{margin-left:0!important}.hamburger{display:flex!important}}
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
      `}</style>

      {/* Sidebar backdrop */}
      {sidebarOpen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:40}} onClick={()=>setSidebarOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen?" open":""}`} style={{width:240,background:C.dark,flexShrink:0,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:50,transform:"translateX(0)",transition:"transform 0.25s"}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:C.red,letterSpacing:2}}>McRATE</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase"}}>Admin Dashboard</div>
        </div>
        <nav style={{flex:1,padding:"8px 12px",overflowY:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setSidebarOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:2,background:tab===t.id?"rgba(218,41,28,0.2)":"transparent",color:tab===t.id?C.red:"rgba(255,255,255,0.65)",fontWeight:tab===t.id?700:500,fontSize:14,fontFamily:"inherit",textAlign:"left",position:"relative"}}>
              <span style={{fontSize:16}}>{t.icon}</span>
              {t.label}
              {t.badge>0&&<span style={{position:"absolute",right:12,background:C.red,color:C.white,borderRadius:50,padding:"1px 7px",fontSize:11,fontWeight:700}}>{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:2}}>Signed in as</div>
          <div style={{fontSize:13,color:C.white,fontWeight:600,marginBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{adminUser?.email||"Admin"}</div>
          <button onClick={handleLogout} style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main" style={{flex:1,marginLeft:240,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <header style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="hamburger" onClick={()=>setSidebarOpen(v=>!v)} style={{display:"none",flexDirection:"column",gap:4,background:"none",border:"none",cursor:"pointer",padding:4}}>
              <div style={{width:20,height:2,background:C.dark}}/><div style={{width:20,height:2,background:C.dark}}/><div style={{width:20,height:2,background:C.dark}}/>
            </button>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.dark,letterSpacing:1}}>
              {TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {loading&&<div style={{fontSize:12,color:C.gray}}>Loading…</div>}
            <button onClick={()=>load(token)} style={{background:C.light,border:"none",borderRadius:8,padding:"7px 14px",fontSize:13,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>↻ Refresh</button>
          </div>
        </header>
        <main style={{flex:1,padding:24,maxWidth:1400,width:"100%",margin:"0 auto"}}>
          {content[tab]}
        </main>
      </div>
    </div>
  );
}
