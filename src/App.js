import { useState, useEffect, useRef } from "react";
import { Home, Trophy, Plus, Map, User, Bell, Search, ThumbsUp, ThumbsDown, MessageCircle, Share2, Flag, Star, MapPin, CheckCircle, Clock, Camera, ArrowLeft, MoreHorizontal, Zap, Award, TrendingDown, Reply, Eye, EyeOff, AlertTriangle, Navigation, Flame, Globe } from "lucide-react";

// ─── Supabase Client ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ydokybkulrxqhyavtncf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb2t5Ymt1bHJ4cWh5YXZ0bmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjQ1NTEsImV4cCI6MjA5MzEwMDU1MX0.LHkkpLnkq6i6hSa3ysm0cVKqU7ynImT6lAv19JbFMgs";

const sb = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  async signUp(email, password, name) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password, data: { name } })
      });
      const json = await res.json();
      console.log("SignUp response:", JSON.stringify(json));
      return json;
    } catch(e) {
      console.error("SignUp fetch error:", e.message);
      throw e;
    }
  },
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` }
    });
  },
  async getUser(token) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` }
    });
    return res.json();
  },

  // ─── Database ────────────────────────────────────────────────────────────────
  async query(table, params = "", token = null) {
    const headers = { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json", "Prefer": "return=representation" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers });
    return res.json();
  },
  async insert(table, data, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Prefer": "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async update(table, match, data, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
      method: "PATCH",
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Prefer": "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(table, match, token) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
      method: "DELETE",
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}` }
    });
  },

  // ─── Storage ─────────────────────────────────────────────────────────────────
  async uploadPhoto(file, path, token) {
    // Convert base64 to blob
    const base64 = file.split(",")[1];
    const mime = file.split(";")[0].split(":")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/food-photos/${path}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${token}`, "Content-Type": mime },
      body: blob
    });
    const data = await res.json();
    if (data.Key) return `${SUPABASE_URL}/storage/v1/object/public/${data.Key}`;
    return null;
  },

  photoUrl(path) {
    return `${SUPABASE_URL}/storage/v1/object/public/food-photos/${path}`;
  }
};

// ─── Constants ────────────────────────────────────────────────────────────────
const R = "#DA291C";
const Y = "#FFC72C";
const W = "#FFFFFF";
const BG = "#F5F5F5";
const DARK = "#1A1A1A";
const GRAY = "#888";
const LG = "#E8E8E8";

const MENU_ITEMS = [
  // Burgers
  "Big Mac",
  "Double Big Mac",
  "Quarter Pounder",
  "Double Quarter Pounder",
  "Cheeseburger",
  "Double Cheeseburger",
  "Hamburger",
  "McDouble",
  "Grand Angus",
  "Mighty Angus",
  "Angus Mushroom & Swiss",
  // Chicken & Fish
  "McChicken",
  "Spicy McChicken",
  "Crispy Chicken Burger",
  "Spicy Crispy Chicken Burger",
  "Filet-O-Fish",
  "Chicken McNuggets",
  "Chicken McBites",
  "Grilled Chicken Burger",
  // Breakfast
  "Egg McMuffin",
  "Bacon & Egg McMuffin",
  "Sausage McMuffin",
  "Sausage & Egg McMuffin",
  "Big Breakfast",
  "Hotcakes",
  "Hotcakes & Sausage",
  "Hash Brown",
  "Breakfast Wrap",
  // Sides
  "Fries",
  "Onion Rings",
  // Desserts & Sweets
  "McFlurry",
  "Sundae",
  "Soft Serve Cone",
  "Apple Pie",
  "Donut",
  "Muffin",
  "Banana Bread",
  // Other
  "Other / Special Item",
];
const BADGES = [
  { id:"first", icon:"🎖️", label:"First Review" },
  { id:"streak5", icon:"🔥", label:"5-Day Streak" },
  { id:"explorer", icon:"🗺️", label:"Explorer" },
  { id:"foodie", icon:"🍔", label:"Foodie" },
  { id:"trusted", icon:"✅", label:"Trusted Reviewer" },
  { id:"gold", icon:"🥇", label:"Gold Member" },
];
const MOCK_LOCATIONS = [
  { id:"loc1", name:"McDonald's Sydney CBD", address:"George St, Sydney NSW 2000", distance:0.4, lat:-33.8688, lng:151.2093 },
  { id:"loc2", name:"McDonald's Surry Hills", address:"Crown St, Surry Hills NSW 2010", distance:1.2, lat:-33.8833, lng:151.2094 },
  { id:"loc3", name:"McDonald's Newtown", address:"King St, Newtown NSW 2042", distance:2.8, lat:-33.8978, lng:151.1794 },
  { id:"loc4", name:"McDonald's Parramatta", address:"Church St, Parramatta NSW 2150", distance:18.5, lat:-33.8150, lng:151.0011 },
  { id:"loc5", name:"McDonald's Bondi Junction", address:"Oxford St, Bondi Junction NSW 2022", distance:4.1, lat:-33.8915, lng:151.2479 },
  { id:"loc6", name:"McDonald's Chatswood", address:"Victoria Ave, Chatswood NSW 2067", distance:9.2, lat:-33.7969, lng:151.1822 },
];
const IMGS = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&h=600&fit=crop",
];

// ─── Seed Data ────────────────────────────────────────────────────────────────
const NOW = new Date().toISOString();
const SEED = [
  { id:"r1", locationId:"loc1", locationName:"McDonald's Sydney CBD", userId:"u2", userName:"Sarah M.", userTier:"gold", foodItem:"Big Mac", rating:5, image:IMGS[0], text:"Best Big Mac I've had in years. Perfectly assembled, fresh lettuce, sauce ratio on point.", date:NOW, agrees:12, disagrees:2, reactions:{}, comments:[{id:"c1",userId:"u3",user:"Jake T.",userTier:"silver",text:"Agreed! This location always nails it.",date:NOW,replies:[{id:"c1r1",userId:"u4",user:"Priya R.",userTier:"bronze",text:"Haven't been let down here either!",date:NOW,replies:[]}]}], verified:true, categories:{food:5,speed:4,cleanliness:5,value:4} },
  { id:"r2", locationId:"loc2", locationName:"McDonald's Surry Hills", userId:"u3", userName:"Tom K.", userTier:"silver", foodItem:"Large Fries", rating:2, image:IMGS[1], text:"Fries were cold and soggy. Clearly been sitting there a while. Disappointing.", date:NOW, agrees:8, disagrees:1, reactions:{}, comments:[], verified:false, categories:{food:2,speed:2,cleanliness:3,value:2} },
  { id:"r3", locationId:"loc3", locationName:"McDonald's Newtown", userId:"u4", userName:"Priya R.", userTier:"bronze", foodItem:"McFlurry", rating:4, image:IMGS[2], text:"McFlurry machine actually working! Great consistency today.", date:NOW, agrees:15, disagrees:0, reactions:{}, comments:[{id:"c2",userId:"u5",user:"Mike L.",userTier:"bronze",text:"Legend! I've been burned so many times by broken machines.",date:NOW,replies:[]}], verified:true, categories:{food:4,speed:5,cleanliness:4,value:4} },
  { id:"r4", locationId:"loc4", locationName:"McDonald's Parramatta", userId:"u5", userName:"Chris B.", userTier:"bronze", foodItem:"Quarter Pounder", rating:1, image:IMGS[3], text:"Waited 20 minutes for a quarter pounder that was stone cold. Never again.", date:NOW, agrees:6, disagrees:3, reactions:{}, comments:[], verified:false, categories:{food:1,speed:1,cleanliness:2,value:1} },
  { id:"r5", locationId:"loc5", locationName:"McDonald's Bondi Junction", userId:"u6", userName:"Emma W.", userTier:"silver", foodItem:"Chicken McNuggets", rating:5, image:IMGS[4], text:"Crispy, hot, generous portion. The dipping sauce selection was chef's kiss.", date:NOW, agrees:20, disagrees:1, reactions:{}, comments:[], verified:true, categories:{food:5,speed:5,cleanliness:5,value:5} },
  { id:"r6", locationId:"loc6", locationName:"McDonald's Chatswood", userId:"u7", userName:"Daniel H.", userTier:"gold", foodItem:"Hash Brown", rating:3, image:IMGS[5], text:"Hash brown was okay, a bit greasy but edible. Service was fast though.", date:NOW, agrees:4, disagrees:4, reactions:{}, comments:[], verified:false, categories:{food:3,speed:4,cleanliness:3,value:3} },
];
const SEED_NOTIFS = [
  { id:"n1", type:"agree", fromUser:"Sarah M.", reviewSnippet:"Best Big Mac I've had…", reviewId:"r1", read:false, date:NOW },
  { id:"n2", type:"comment", fromUser:"Jake T.", reviewSnippet:"Best Big Mac I've had…", reviewId:"r1", read:false, date:NOW },
  { id:"n3", type:"disagree", fromUser:"Tom K.", reviewSnippet:"Fries were cold…", reviewId:"r2", read:true, date:NOW },
];

// ─── Session Storage ──────────────────────────────────────────────────────────
const SESSION_KEY = "mcrate_session";
function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function saveSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ─── Auth Stage ───────────────────────────────────────────────────────────────
function loadAuthStage() {
  try { return "app"; } catch { return "app"; }
}
function saveAuthStage(stage) {
  if (stage === "login" || stage === "signup") saveSession(null);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const tierColors = { bronze:"#CD7F32", silver:"#A8A9AD", gold:Y };
const tierLabel = t => ({ bronze:"🥉 Bronze", silver:"🥈 Silver", gold:"🥇 Gold" }[t]||"🥉 Bronze");
function timeAgo(iso) {
  const s = Math.floor((Date.now()-new Date(iso))/1000);
  if (s<60) return "just now";
  if (s<3600) return `${Math.floor(s/60)}m`;
  if (s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}
function Stars({ n, size=14 }) {
  return <span style={{ fontSize:size, letterSpacing:1 }}>{[1,2,3,4,5].map(i=><span key={i} style={{ color:i<=Math.round(n)?Y:LG }}>★</span>)}</span>;
}
function Avatar({ name, size=36, tier }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:R, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:size*0.38, color:W, border:`2.5px solid ${tierColors[tier]||"#CD7F32"}`, flexShrink:0 }}>{name?.[0]?.toUpperCase()||"?"}</div>;
}
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", background:DARK, color:W, padding:"10px 24px", borderRadius:50, fontSize:14, fontWeight:600, zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,0.3)", border:`2px solid ${Y}` }}>{msg}</div>;
}

// ─── McRate Logo ──────────────────────────────────────────────────────────────
function McRateLogo({ size = 28, onRed = false }) {
  const small = size * 0.72;
  const capsColor = onRed ? W : R;
  const lowerColor = onRed ? "rgba(255,255,255,0.75)" : Y;
  return (
    <div style={{ display:"flex", alignItems:"baseline", letterSpacing:1 }}>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:size, color:capsColor, lineHeight:1 }}>M</span>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:small, color:lowerColor, lineHeight:1 }}>c</span>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:size, color:capsColor, lineHeight:1 }}>R</span>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:small, color:lowerColor, lineHeight:1 }}>ate</span>
    </div>
  );
}

// ─── Photo Carousel ───────────────────────────────────────────────────────────
function PhotoCarousel({ review }) {
  const images = review.images || (review.image ? [review.image] : []);
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(null);
  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff < -40 && activeIdx < images.length - 1) setActiveIdx(i => i + 1);
    if (diff > 40 && activeIdx > 0) setActiveIdx(i => i - 1);
    touchStartX.current = null;
  };
  return (
    <div style={{ position:"relative", background:DARK, overflow:"hidden" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div style={{ display:"flex", transform:`translateX(-${activeIdx * 100}%)`, transition:"transform 0.3s ease" }}>
        {images.map((img,i) => <img key={i} src={img} alt="" style={{ width:"100%", flexShrink:0, aspectRatio:"1/1", objectFit:"cover", display:"block", background:LG }}/>)}
      </div>
      {images.length > 1 && <>
        <div style={{ position:"absolute", bottom:10, left:0, right:0, display:"flex", justifyContent:"center", gap:5 }}>
          {images.map((_,i) => <div key={i} onClick={()=>setActiveIdx(i)} style={{ width:i===activeIdx?16:6, height:6, borderRadius:3, background:i===activeIdx?W:"rgba(255,255,255,0.5)", transition:"all 0.2s", cursor:"pointer" }}/>)}
        </div>
        <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.55)", color:W, borderRadius:50, padding:"3px 10px", fontSize:12, fontWeight:700 }}>{activeIdx+1}/{images.length}</div>
      </>}
    </div>
  );
}

function CommentThread({ comment, onReply, depth=0 }) {
  const [showReply, setShowReply] = useState(false);
  const [text, setText] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const replies = comment.replies||[];

  const submit = () => { if (!text.trim()) return; onReply(comment.id, text.trim()); setText(""); setShowReply(false); };

  return (
    <div style={{ marginBottom:depth===0?12:0 }}>
      <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
        <Avatar name={comment.user} size={depth===0?32:26} tier={comment.userTier} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ background:BG, borderRadius:"0 14px 14px 14px", padding:"8px 12px", display:"inline-block", maxWidth:"100%" }}>
            <span style={{ fontWeight:700, fontSize:13, color:DARK }}>{comment.user} </span>
            <span style={{ fontSize:13, color:"#333", lineHeight:1.4 }}>{comment.text}</span>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:4, paddingLeft:4 }}>
            <span style={{ fontSize:11, color:GRAY }}>{timeAgo(comment.date)}</span>
            <button onClick={()=>setShowReply(v=>!v)} style={{ fontSize:12, fontWeight:700, color:showReply?R:GRAY, background:"none", border:"none", cursor:"pointer", padding:0 }}>Reply</button>
            {replies.length>0&&<button onClick={()=>setShowReplies(v=>!v)} style={{ fontSize:12, color:R, fontWeight:600, background:"none", border:"none", cursor:"pointer", padding:0 }}>{showReplies?`▾ Hide`:`▸ ${replies.length} repl${replies.length===1?"y":"ies"}`}</button>}
          </div>
          {showReply&&(
            <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:6 }}>
              <div style={{ flex:1, background:BG, borderRadius:20, padding:"6px 12px", display:"flex", gap:8, alignItems:"center", border:`1.5px solid ${LG}` }}>
                <input autoFocus value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={`Reply to ${comment.user}…`} style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:13, fontFamily:"inherit" }} />
                <button onClick={submit} disabled={!text.trim()} style={{ background:text.trim()?R:LG, color:text.trim()?W:GRAY, border:"none", borderRadius:50, padding:"4px 12px", fontWeight:700, cursor:text.trim()?"pointer":"default", fontSize:12 }}>Post</button>
              </div>
            </div>
          )}
          {showReplies&&replies.length>0&&(
            <div style={{ marginTop:8, paddingLeft:8, borderLeft:`2px solid ${LG}` }}>
              {replies.map(r=><div key={r.id} style={{ marginBottom:8 }}><CommentThread comment={r} onReply={onReply} depth={depth+1}/></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feed Post ────────────────────────────────────────────────────────────────
function FeedPost({ review, currentUser, onAgree, onDisagree, onAddComment, onReact, onReport, onOpenUser }) {
  const [showComments, setShowComments] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [vote, setVote] = useState(null);
  const [agrees, setAgrees] = useState(review.agrees);
  const [disagrees, setDisagrees] = useState(review.disagrees);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);

  const countComments = arr => (arr||[]).reduce((a,c)=>a+1+countComments(c.replies),0);
  const total = countComments(review.comments);
  const visible = showAll ? review.comments : (review.comments||[]).slice(0,2);

  const submitComment = () => { if (!commentText.trim()) return; onAddComment(review.id, commentText.trim(), null); setCommentText(""); };
  const focusComment = () => { setShowComments(true); setTimeout(()=>inputRef.current?.focus(),80); };

  const handleVote = (v) => {
    if (vote === v) {
      // Undo vote
      setVote(null);
      if (v === "agree") { setAgrees(a=>a-1); onAgree(v); }
      else { setDisagrees(d=>d-1); onDisagree(v); }
    } else {
      // Switch or new vote
      if (vote === "agree") setAgrees(a=>a-1);
      if (vote === "disagree") setDisagrees(d=>d-1);
      const prev = vote;
      setVote(v);
      if (v === "agree") { setAgrees(a=>a+1); onAgree(prev); }
      else { setDisagrees(d=>d+1); onDisagree(prev); }
    }
  };

  const handleShare = () => {
    const text = `${review.userName} rated ${review.foodItem} at ${review.locationName} ${review.rating}/5 on McRate`;
    if (navigator.share) { navigator.share({ title:"McRate Review", text }).catch(()=>{}); }
    else { navigator.clipboard?.writeText(text); }
  };

  const ratingBg = review.rating>=4?"#D4EDDA":review.rating<=2?"#F8D7DA":"#FFF3CD";
  const ratingColor = review.rating>=4?"#155724":review.rating<=2?R:"#856404";

  return (
    <div style={{ background:W, marginBottom:8, borderBottom:`1px solid ${LG}` }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px 8px" }}>
        <button onClick={()=>onOpenUser&&onOpenUser(review)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <Avatar name={review.userName} size={38} tier={review.userTier}/>
        </button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <button onClick={()=>onOpenUser&&onOpenUser(review)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:14, color:DARK, fontFamily:"inherit" }}>{review.userName}</button>
            <span style={{ fontSize:11, color:GRAY }}>· {tierLabel(review.userTier)}</span>
            {review.verified&&<span style={{ background:Y, color:DARK, fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:50, display:"flex", alignItems:"center", gap:3 }}><CheckCircle size={9} color={DARK}/>Verified</span>}
          </div>
          <div style={{ fontSize:12, color:GRAY, marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
            <MapPin size={11} color={GRAY}/> {review.locationName} · {review.foodItem}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ background:ratingBg, borderRadius:50, padding:"4px 10px", display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:ratingColor, lineHeight:1 }}>{review.rating}</span>
            <span style={{ fontSize:12, color:ratingColor }}>★</span>
          </div>
          {/* Options menu */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowMenu(v=>!v)} style={{ background:"none", border:"none", cursor:"pointer", padding:"0 4px", display:"flex", alignItems:"center" }}>
              <MoreHorizontal size={18} color={GRAY}/>
            </button>
            {showMenu && (
              <div style={{ position:"absolute", right:0, top:"100%", background:W, borderRadius:12, boxShadow:"0 4px 24px rgba(0,0,0,0.15)", zIndex:50, minWidth:160, border:`1px solid ${LG}`, overflow:"hidden" }}>
                <button onClick={()=>{handleShare();setShowMenu(false);}} style={{ display:"block", width:"100%", padding:"12px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontSize:14, fontFamily:"inherit", borderBottom:`1px solid ${LG}`, display:"flex", alignItems:"center", gap:8 }}>
                  <Share2 size={15} color={GRAY}/> Share
                </button>
                <button onClick={()=>{onReport&&onReport(review);setShowMenu(false);}} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"12px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontSize:14, color:R, fontFamily:"inherit" }}>
                  <Flag size={15} color={R}/> Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo carousel */}
      <PhotoCarousel review={review}/>

      {/* Agree / Disagree */}
      <div style={{ padding:"12px 14px 8px" }}>
        <div style={{ fontSize:12, color:GRAY, fontWeight:600, marginBottom:8 }}>
          {review.userName} rated this <strong style={{ color:ratingColor }}>{review.rating}★</strong> — do you agree?
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>handleVote("agree")} style={{ flex:1, padding:"10px 0", borderRadius:50, border:`2px solid ${vote==="agree"?"#22c55e":LG}`, background:vote==="agree"?"#22c55e":W, color:vote==="agree"?W:GRAY, fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <ThumbsUp size={14} color={vote==="agree"?W:GRAY} strokeWidth={2.5}/> Agree · {agrees}
          </button>
          <button onClick={()=>handleVote("disagree")} style={{ flex:1, padding:"10px 0", borderRadius:50, border:`2px solid ${vote==="disagree"?R:LG}`, background:vote==="disagree"?R:W, color:vote==="disagree"?W:GRAY, fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <ThumbsDown size={14} color={vote==="disagree"?W:GRAY} strokeWidth={2.5}/> Disagree · {disagrees}
          </button>
        </div>
      </div>

      {/* Comment button */}
      <div style={{ padding:"0 14px 8px" }}>
        <button onClick={focusComment} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <MessageCircle size={17} color={GRAY} strokeWidth={2}/>
          <span style={{ fontSize:13, fontWeight:600, color:GRAY }}>{total} comment{total!==1?"s":""}</span>
        </button>
      </div>

      {/* Caption */}
      {review.text&&<div style={{ padding:"0 14px 8px", fontSize:14, color:"#222", lineHeight:1.5 }}><span style={{ fontWeight:700 }}>{review.userName} </span>{review.text}</div>}

      {/* View comments toggle */}
      {total>0&&!showComments&&(
        <button onClick={()=>setShowComments(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"0 14px 8px", fontSize:13, color:GRAY, display:"block" }}>
          View {total} comment{total!==1?"s":""}
        </button>
      )}

      {/* Comments */}
      {showComments&&(
        <div style={{ padding:"0 14px 8px" }}>
          {visible.map(c=><CommentThread key={c.id} comment={c} onReply={(parentId,text)=>onAddComment(review.id,text,parentId)}/>)}
          {(review.comments||[]).length>2&&!showAll&&(
            <button onClick={()=>setShowAll(true)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:GRAY, padding:"0 0 6px" }}>View all {total} comments</button>
          )}
        </div>
      )}

      {/* Comment input */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px 12px", borderTop:`1px solid ${LG}` }}>
        <Avatar name={currentUser.name} size={30} tier={currentUser.tier}/>
        <div style={{ flex:1, background:BG, borderRadius:20, padding:"7px 14px", display:"flex", gap:8, alignItems:"center" }}>
          <input ref={inputRef} value={commentText} onChange={e=>setCommentText(e.target.value)} onFocus={()=>setShowComments(true)} onKeyDown={e=>e.key==="Enter"&&submitComment()} placeholder="Add a comment…" style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:13, fontFamily:"inherit", color:DARK }} />
          {commentText.trim()&&<button onClick={submitComment} style={{ background:"none", border:"none", color:R, fontWeight:700, fontSize:13, cursor:"pointer", padding:0, whiteSpace:"nowrap" }}>Post</button>}
        </div>
      </div>
    </div>
  );
}

// ─── User Profile Page ────────────────────────────────────────────────────────
function UserProfilePage({ userId, userName, userTier, reviews, onBack }) {
  const userReviews = reviews.filter(r => r.userId === userId);
  const avg = userReviews.length ? (userReviews.reduce((a,r)=>a+r.rating,0)/userReviews.length).toFixed(1) : null;
  const totalAgrees = userReviews.reduce((a,r)=>a+(r.agrees||0),0);
  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:400, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:R, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:W, width:32, height:32, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color={W}/>
        </button>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:Y, letterSpacing:1 }}>{userName}'s Profile</div>
      </div>
      <div style={{ flex:1, overflow:"auto" }}>
        <div style={{ background:R, padding:"24px 20px 28px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <Avatar name={userName} size={72} tier={userTier}/>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:Y, letterSpacing:1.5 }}>{userName}</div>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>{tierLabel(userTier)}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, width:"100%", marginTop:8 }}>
            {[{label:"Reviews",value:userReviews.length},{label:"Avg Rating",value:avg||"—"},{label:"Agrees",value:totalAgrees}].map(s=>(
              <div key={s.label} style={{ background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"10px 0", textAlign:"center" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:Y }}>{s.value}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600, textTransform:"uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:14 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:DARK, marginBottom:10 }}>REVIEWS ({userReviews.length})</div>
          {userReviews.length===0&&<div style={{ textAlign:"center", padding:"40px 0", color:GRAY }}><div style={{ fontSize:40 }}>🍔</div><div style={{ fontSize:14, marginTop:8 }}>No reviews yet</div></div>}
          {userReviews.map(r=>(
            <div key={r.id} style={{ background:W, borderRadius:16, marginBottom:10, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <img src={r.image} alt="" style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}/>
              <div style={{ padding:"10px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div><div style={{ fontWeight:700, fontSize:14 }}>{r.foodItem}</div><div style={{ fontSize:12, color:GRAY, marginTop:2, display:"flex", alignItems:"center", gap:3 }}><MapPin size={10} color={GRAY}/>{r.locationName}</div></div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:R }}>{r.rating}★</div>
                </div>
                {r.text&&<div style={{ fontSize:13, color:"#444", marginTop:6, lineHeight:1.5 }}>"{r.text}"</div>}
                <div style={{ display:"flex", gap:12, marginTop:8, fontSize:12, color:GRAY }}>
                  <span style={{ display:"flex", alignItems:"center", gap:3 }}><ThumbsUp size={11} color={GRAY}/> {r.agrees}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:3 }}><ThumbsDown size={11} color={GRAY}/> {r.disagrees}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:3 }}><MessageCircle size={11} color={GRAY}/> {(r.comments||[]).length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ review, onClose, onReport }) {
  const [reason, setReason] = useState("");
  const reasons = ["Fake review","Spam or advertising","Inappropriate content","Wrong location","Duplicate review","Other"];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:600, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:W, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, animation:"slideUp 0.25s ease" }}>
        <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${LG}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:DARK, letterSpacing:1.5 }}>REPORT REVIEW</div>
          <button onClick={onClose} style={{ background:LG, border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>×</button>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ fontSize:13, color:GRAY, marginBottom:14 }}>Why are you reporting this review?</div>
          {reasons.map(r=>(
            <button key={r} onClick={()=>setReason(r)} style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 16px", border:`1.5px solid ${reason===r?R:LG}`, borderRadius:12, background:reason===r?"#FEE2E2":W, color:reason===r?R:DARK, fontWeight:reason===r?700:400, fontSize:14, cursor:"pointer", marginBottom:8, fontFamily:"inherit" }}>{r}</button>
          ))}
          <button onClick={()=>{if(reason){onReport(review.id,reason);onClose();}}} disabled={!reason} style={{ width:"100%", background:reason?R:LG, color:reason?W:GRAY, border:"none", borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:reason?"pointer":"not-allowed", fontFamily:"inherit", marginTop:4 }}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────
function FeedTab({ reviews, user, onAgree, onDisagree, onAddComment, onReact, onOpenUser }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const scrollRef = useRef(null);
  const touchStart = useRef(null);

  const filtered = reviews
    .filter(r => filter==="all"?true:filter==="best"?r.rating>=4:filter==="worst"?r.rating<=2:true)
    .filter(r => !search.trim() ? true :
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.locationName.toLowerCase().includes(search.toLowerCase()) ||
      r.foodItem.toLowerCase().includes(search.toLowerCase()) ||
      (r.text||"").toLowerCase().includes(search.toLowerCase())
    );

  const handleReport = (reviewId, reason) => {};

  // Pull to refresh
  const handleTouchStart = e => { touchStart.current = e.touches[0].clientY; };
  const handleTouchEnd = e => {
    if (!touchStart.current) return;
    const diff = e.changedTouches[0].clientY - touchStart.current;
    if (diff > 80 && scrollRef.current?.scrollTop === 0) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1200);
    }
    touchStart.current = null;
  };

  const isEmpty = reviews.length === 0 && !search.trim() && filter === "all";

  return (
    <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
      {/* Filter + search bar */}
      <div style={{ background:W, padding:"10px 14px", borderBottom:`1px solid ${LG}`, flexShrink:0 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ display:"flex", gap:6, flex:1 }}>
            {[
              ["all","All",null],
              ["best","Best",<Flame size={11} color={filter==="best"?W:R}/>],
              ["worst","Worst",<TrendingDown size={11} color={filter==="worst"?W:R}/>],
              ["latest","Latest",<Clock size={11} color={filter==="latest"?W:GRAY}/>]
            ].map(([v,l,icon])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{ padding:"6px 10px", borderRadius:50, border:"none", background:filter===v?R:LG, color:filter===v?W:GRAY, fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:3 }}>
                {icon}{l}
              </button>
            ))}
          </div>
          <button onClick={()=>{setShowSearch(v=>!v);setSearch("");}} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" }}>
            <Search size={18} color={showSearch?R:GRAY}/>
          </button>
        </div>
        {showSearch && (
          <div style={{ marginTop:10 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} autoFocus placeholder="Search reviews, locations, items…"
              style={{ width:"100%", padding:"9px 14px", border:`1.5px solid ${LG}`, borderRadius:50, fontSize:14, fontFamily:"inherit", outline:"none", color:DARK }}/>
          </div>
        )}
      </div>

      {/* Pull to refresh indicator */}
      {refreshing && (
        <div style={{ background:Y, color:DARK, textAlign:"center", padding:"8px 0", fontSize:13, fontWeight:700 }}>Refreshing… 🔄</div>
      )}

      <div ref={scrollRef} style={{ flex:1, overflow:"auto" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Search results empty */}
        {filtered.length===0 && search.trim() && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:GRAY }}>
            <div style={{ fontSize:48 }}>🔍</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, color:DARK, marginTop:8 }}>NO RESULTS</div>
            <div style={{ fontSize:14, marginTop:6 }}>Try a different search term</div>
          </div>
        )}

        {/* Empty state onboarding */}
        {isEmpty && (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🍔</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:DARK, marginBottom:8 }}>WELCOME TO McRATE</div>
            <div style={{ fontSize:14, color:GRAY, lineHeight:1.7, maxWidth:280, margin:"0 auto 24px" }}>
              Rate McDonald's food, name and shame bad locations, and see what the community thinks. Tap <strong>+</strong> to post your first review.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:280, margin:"0 auto", textAlign:"left" }}>
              {[[<Camera size={20} color={R}/>, "Post a photo of your meal"],[<Star size={20} color={Y} fill={Y}/>, "Rate it 1–5 stars"],[<ThumbsUp size={20} color="#22c55e"/>, "Agree or disagree with others"],[<Trophy size={20} color={Y}/>, "Climb the reviewer ranks"]].map(([icon,text],i)=>(
                <div key={text} style={{ display:"flex", alignItems:"center", gap:12, background:W, borderRadius:14, padding:"12px 16px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                  <span style={{ fontSize:22 }}>{icon}</span>
                  <span style={{ fontSize:14, fontWeight:500, color:DARK }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.map(r=><FeedPost key={r.id} review={r} currentUser={user} onAgree={(currentVote)=>onAgree(r.id,currentVote)} onDisagree={(currentVote)=>onDisagree(r.id,currentVote)} onAddComment={onAddComment} onReact={onReact} onReport={()=>setReportTarget(r)} onOpenUser={onOpenUser}/>)}
      </div>

      {reportTarget && <ReportModal review={reportTarget} onClose={()=>setReportTarget(null)} onReport={handleReport}/>}
    </div>
  );
}

// ─── Google Places API Key ────────────────────────────────────────────────────
// Replace this with your Google Places API key
const GOOGLE_API_KEY = "AIzaSyC5JTlsROiy7RM6OXVzYJxMK8NxCSCwXpY";

// ─── Location Search (Google Places Autocomplete) ─────────────────────────────
function LocationSearch({ onSelect, defaultLocation }) {
  const [query, setQuery] = useState(defaultLocation?.name || "");
  const [selected, setSelected] = useState(defaultLocation || null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [noApiKey, setNoApiKey] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const sessionToken = useRef(Math.random().toString(36).slice(2));

  // Use Maps script loaded at app level
  useEffect(() => {
    if (GOOGLE_API_KEY === "YOUR_GOOGLE_PLACES_API_KEY") { setNoApiKey(true); return; }
    if (window.google?.maps?.places) { setApiReady(true); return; }
    // Poll until Maps is ready (loaded at app level)
    const check = setInterval(() => {
      if (window.google?.maps?.places) { setApiReady(true); clearInterval(check); }
    }, 100);
    return () => clearInterval(check);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q) => {
    if (!q.trim() || !apiReady) { setResults([]); return; }
    setLoading(true);
    const service = new window.google.maps.places.AutocompleteService();
    // Automatically search for McDonald's at the location the user types
    const searchQuery = q.toLowerCase().includes("mcdonald") ? q : `McDonald's ${q}`;
    service.getPlacePredictions({
      input: searchQuery,
      types: ["establishment"],
      sessionToken: new window.google.maps.places.AutocompleteSessionToken(),
    }, (predictions, status) => {
      setLoading(false);
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) { setResults([]); return; }
      const mcds = predictions.filter(p =>
        p.structured_formatting.main_text.toLowerCase().includes("mcdonald") ||
        p.description.toLowerCase().includes("mcdonald")
      );
      setResults(mcds);
    });
  };

  const getPlaceDetails = (placeId, description, mainText) => {
    if (!apiReady) return;
    const dummy = document.createElement("div");
    const service = new window.google.maps.places.PlacesService(dummy);
    service.getDetails({ placeId, fields: ["place_id", "name", "formatted_address", "geometry"] }, (place, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) return;
      const loc = {
        id: place.place_id,
        name: place.name,
        fullName: `${place.name}${place.formatted_address ? ', ' + place.formatted_address.split(',').slice(1,2).join('').trim() : ''}`,
        address: place.formatted_address,
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };
      setSelected(loc);
      setQuery(loc.name);
      setShowResults(false);
      onSelect(loc);
    });
  };

  const handleChange = e => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onSelect(null);
    setShowResults(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  // Fallback UI when no API key provided
  if (noApiKey) {
    return (
      <div>
        <div style={{ background:"#FFF3CD", border:`1px solid ${Y}`, borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
          <div style={{ fontWeight:700, fontSize:13, color:"#856404", marginBottom:4, display:"flex", alignItems:"center", gap:6 }}><AlertTriangle size={14} color="#856404"/> Google Places API Key Required</div>
          <div style={{ fontSize:12, color:"#856404", lineHeight:1.5 }}>
            To enable real location search, add your Google Places API key to the app. Replace <code>YOUR_GOOGLE_PLACES_API_KEY</code> at the top of the file with your key from{" "}
            <span style={{ textDecoration:"underline" }}>console.cloud.google.com</span>. Enable the "Places API" in your project.
          </div>
        </div>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onSelect({ id:"manual_"+Date.now(), name:e.target.value, address:"" }); }}
          placeholder="Type location name manually…"
          style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${LG}`, borderRadius:12, fontSize:14, fontFamily:"inherit", outline:"none", background:W, color:DARK }}
        />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Search suburb or area…"
          style={{ width:"100%", padding:"11px 40px 11px 14px", border:`1.5px solid ${selected?"#22c55e":LG}`, borderRadius:12, fontSize:14, fontFamily:"inherit", outline:"none", background:W, color:DARK }}
        />
        <div style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)" }}>
          {loading ? <span style={{ fontSize:11, color:GRAY }}>⏳</span> : selected ? <span style={{ color:"#22c55e", fontWeight:700 }}>✓</span> : <span>🔍</span>}
        </div>
      </div>

      {selected && (
        <div style={{ fontSize:12, color:GRAY, marginTop:4, paddingLeft:4, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11} color={GRAY}/>{selected.address}</div>
      )}

      {showResults && !selected && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:W, borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", zIndex:200, overflow:"hidden", border:`1px solid ${LG}` }}>
          {loading && (
            <div style={{ padding:"14px", textAlign:"center", fontSize:13, color:GRAY }}>Searching…</div>
          )}
          {!loading && results.length > 0 && results.map((p, i) => (
            <div key={p.place_id}
              onClick={() => getPlaceDetails(p.place_id, p.description, p.structured_formatting.main_text)}
              style={{ padding:"12px 14px", borderBottom: i < results.length-1 ? `1px solid ${LG}` : "none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}
              onMouseEnter={e => e.currentTarget.style.background = BG}
              onMouseLeave={e => e.currentTarget.style.background = W}
            >
              <MapPin size={16} color={GRAY} style={{ flexShrink:0 }}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:14, color:DARK }}>{p.structured_formatting.main_text}</div>
                <div style={{ fontSize:12, color:GRAY, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.structured_formatting.secondary_text}</div>
              </div>
            </div>
          ))}
          {!loading && results.length === 0 && query.trim().length > 1 && (
            <div style={{ padding:"14px", fontSize:13, color:GRAY, textAlign:"center" }}>
              No McDonald's found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Post Flow ────────────────────────────────────────────────────────────
function AddPostFlow({ onClose, onSubmit, locations, defaultLocationId }) {
  const [step, setStep] = useState("photo");
  const [images, setImages] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [foodItem, setFoodItem] = useState(MENU_ITEMS[0]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [cats, setCats] = useState({ hot:0, wellBuilt:0, fresh:0, portionSize:0 });
  const [text, setText] = useState("");
  const fileRef = useRef(null);
  const defaultLocation = defaultLocationId ? locations.find(l => l.id === defaultLocationId) : null;

  const handleFiles = e => {
    const files = Array.from(e.target.files).slice(0, 3 - images.length);
    let loaded = 0;
    const results = [];
    files.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = ev => {
        results[i] = ev.target.result;
        loaded++;
        if (loaded === files.length) {
          setImages(prev => { const next = [...prev, ...results].slice(0,3); return next; });
          setStep("details");
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = idx => {
    setImages(prev => prev.filter((_,i) => i !== idx));
    setPreviewIdx(p => Math.min(p, Math.max(0, images.length - 2)));
  };

  const submit = () => {
    if (!rating || !selectedLocation || images.length === 0) return;
    onSubmit({ locationId:selectedLocation.id||selectedLocation.name, locationName:selectedLocation.fullName||selectedLocation.name, locationAddress:selectedLocation.address||"", foodItem, rating, categories:cats, text, images, image:images[0], verified:false });
    onClose();
  };

  const canShare = rating && selectedLocation && images.length > 0;

  return (
    <div style={{ position:"fixed", inset:0, background:W, zIndex:600, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:R, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:W, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:Y, letterSpacing:1.5, flex:1 }}>{step==="photo"?"NEW POST":"ADD DETAILS"}</div>
        {step==="details" && <button onClick={submit} disabled={!canShare} style={{ background:canShare?Y:LG, color:canShare?DARK:GRAY, border:"none", borderRadius:50, padding:"7px 18px", fontWeight:700, fontSize:14, cursor:canShare?"pointer":"not-allowed" }}>Share</button>}
      </div>

      {step==="photo" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:28 }}>
          <Camera size={72} color={LG}/>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:DARK, textAlign:"center" }}>SHARE YOUR MEAL</div>
          <div style={{ fontSize:15, color:GRAY, textAlign:"center", lineHeight:1.5 }}>Add up to 3 photos of your order</div>
          <button onClick={()=>fileRef.current?.click()} style={{ background:R, color:W, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:16, cursor:"pointer", width:"100%" }}>Select Photos from Library</button>
          <button onClick={()=>fileRef.current?.click()} style={{ background:LG, color:DARK, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:16, cursor:"pointer", width:"100%" }}>Take Photo</button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={handleFiles}/>
        </div>
      )}

      {step==="details" && (
        <div style={{ flex:1, overflow:"auto" }}>
          {/* Photo preview */}
          <div style={{ position:"relative", background:DARK }}>
            <img src={images[previewIdx]} alt="" style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", display:"block" }}/>
            {images.length > 1 && (
              <div style={{ position:"absolute", bottom:52, left:0, right:0, display:"flex", justifyContent:"center", gap:5 }}>
                {images.map((_,i) => <div key={i} onClick={()=>setPreviewIdx(i)} style={{ width:i===previewIdx?16:6, height:6, borderRadius:3, background:i===previewIdx?W:"rgba(255,255,255,0.5)", transition:"all 0.2s", cursor:"pointer" }}/>)}
              </div>
            )}
            {/* Thumbnail strip */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.55)", padding:"8px 12px", display:"flex", gap:8, alignItems:"center" }}>
              {images.map((img,i) => (
                <div key={i} style={{ position:"relative", flexShrink:0 }}>
                  <img src={img} alt="" onClick={()=>setPreviewIdx(i)} style={{ width:44, height:44, borderRadius:8, objectFit:"cover", border:i===previewIdx?`2.5px solid ${Y}`:"2.5px solid transparent", cursor:"pointer" }}/>
                  <button onClick={()=>removeImage(i)} style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:R, border:"none", color:W, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                  {i===0 && <div style={{ position:"absolute", bottom:-1, left:0, right:0, background:Y, borderRadius:"0 0 6px 6px", fontSize:8, fontWeight:700, textAlign:"center", color:DARK, padding:"1px 0" }}>COVER</div>}
                </div>
              ))}
              {images.length < 3 && (
                <button onClick={()=>fileRef.current?.click()} style={{ width:44, height:44, borderRadius:8, border:"2px dashed rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.1)", color:W, fontSize:22, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>+</button>
              )}
              {images.length > 1 && <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginLeft:"auto", textAlign:"right", lineHeight:1.4 }}>First photo<br/>is cover</div>}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={handleFiles}/>

          <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Location</div>
              <LocationSearch onSelect={setSelectedLocation} defaultLocation={defaultLocation}/>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Menu Item</div>
              <select value={foodItem} onChange={e=>setFoodItem(e.target.value)} style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${LG}`, borderRadius:12, fontSize:14, fontFamily:"inherit", outline:"none", background:W }}>
                {MENU_ITEMS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Overall Rating</div>
              <div style={{ display:"flex", gap:6 }}>
                {[1,2,3,4,5].map(n=><button key={n} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(n)} style={{ fontSize:36, background:"none", border:"none", cursor:"pointer", color:n<=(hover||rating)?Y:LG, transition:"color 0.1s", padding:0 }}>★</button>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Food Ratings</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[["hot","Hot"],["wellBuilt","Well Built"],["fresh","Fresh"],["portionSize","Portion Size"]].map(([k,label])=>(
                  <div key={k} style={{ background:BG, borderRadius:12, padding:"10px 12px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:GRAY, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
                    <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setCats(p=>({...p,[k]:n}))} style={{ fontSize:18, background:"none", border:"none", cursor:"pointer", color:n<=cats[k]?Y:LG, padding:0 }}>★</button>)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Caption</div>
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a caption…" style={{ width:"100%", minHeight:80, padding:"10px 14px", border:`1.5px solid ${LG}`, borderRadius:12, fontSize:14, fontFamily:"inherit", resize:"vertical", outline:"none" }}/>
            </div>
            <button onClick={submit} disabled={!canShare} style={{ background:canShare?R:LG, color:canShare?W:GRAY, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:16, cursor:canShare?"pointer":"not-allowed", fontFamily:"inherit" }}>Share Post</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notifications Panel ──────────────────────────────────────────────────────
function NotificationsPanel({ notifications, onClose, onMarkRead }) {
  const icon = t => ({
    agree: <ThumbsUp size={18} color={DARK}/>,
    disagree: <ThumbsDown size={18} color={DARK}/>,
    comment: <MessageCircle size={18} color={DARK}/>,
    reply: <Reply size={18} color={DARK}/>
  }[t] || <Bell size={18} color={DARK}/>);
  const label = n => ({ agree:`${n.fromUser} agreed with your review`, disagree:`${n.fromUser} disagreed with your review`, comment:`${n.fromUser} commented on your review`, reply:`${n.fromUser} replied to your comment` }[n.type]||"New notification");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:"rgba(0,0,0,0.4)", position:"absolute", inset:0 }} onClick={onClose}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, background:W, borderRadius:"24px 24px 0 0", maxHeight:"85vh", overflow:"auto", animation:"slideUp 0.25s ease" }}>
        <div style={{ position:"sticky", top:0, background:W, padding:"16px 20px 12px", borderBottom:`1px solid ${LG}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:DARK, letterSpacing:1.5 }}>NOTIFICATIONS</div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={()=>onMarkRead("all")} style={{ fontSize:12, color:R, fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>Mark all read</button>
            <button onClick={onClose} style={{ background:LG, border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
        </div>
        {notifications.length===0&&<div style={{ textAlign:"center", padding:"60px 20px", color:GRAY }}><Bell size={48} color={LG}/><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, color:DARK, marginTop:12 }}>ALL CAUGHT UP</div></div>}
        {notifications.map(n=>(
          <div key={n.id} onClick={()=>{onMarkRead(n.id);onClose();}} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderBottom:`1px solid ${LG}`, background:n.read?W:"#FFFBF0", cursor:"pointer" }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:n.read?LG:Y, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon(n.type)}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, color:DARK, lineHeight:1.4, fontWeight:n.read?400:600 }}>{label(n)}</div>
              <div style={{ fontSize:12, color:GRAY, marginTop:2 }}>"{n.reviewSnippet}"</div>
              <div style={{ fontSize:11, color:GRAY, marginTop:2 }}>{timeAgo(n.date)}</div>
            </div>
            {!n.read&&<div style={{ width:8, height:8, borderRadius:"50%", background:R, flexShrink:0 }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Menu Item Page ───────────────────────────────────────────────────────────
function MenuItemPage({ item, reviews, onBack, onAddComment, onReact, currentUser }) {
  const itemReviews = reviews.filter(r => r.foodItem === item);
  const sorted = [...itemReviews].sort((a,b) => a.rating - b.rating); // worst first
  const avg = itemReviews.length ? (itemReviews.reduce((a,r)=>a+r.rating,0)/itemReviews.length) : 0;

  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:300, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:R, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:W, width:32, height:32, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color={W}/>
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:Y, letterSpacing:1, lineHeight:1 }}>{item}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>{itemReviews.length} review{itemReviews.length!==1?"s":""}</div>
        </div>
        {avg>0 && (
          <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:50, padding:"4px 12px", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:Y }}>{avg.toFixed(1)}</span>
            <span style={{ color:Y, fontSize:14 }}>★</span>
          </div>
        )}
      </div>
      <div style={{ flex:1, overflow:"auto" }}>
        {sorted.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:GRAY }}>
            <div style={{ fontSize:48 }}>🍔</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:1.5, color:DARK, marginTop:8 }}>NO REVIEWS YET</div>
            <div style={{ fontSize:13, marginTop:6 }}>Be the first to review the {item}!</div>
          </div>
        ) : (
          <>
            <div style={{ padding:"12px 16px 4px", fontFamily:"'Bebas Neue',sans-serif", fontSize:15, letterSpacing:1.5, color:GRAY }}>
              WORST RATED FIRST
            </div>
            {sorted.map(r => (
              <FeedPost key={r.id} review={r} currentUser={currentUser} onAgree={()=>{}} onDisagree={()=>{}} onAddComment={onAddComment} onReact={onReact} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Rankings Tab ─────────────────────────────────────────────────────────────
function BestWorstTab({ reviews, onOpenLocation, onOpenMenuItem }) {
  const [scope, setScope] = useState("local");
  const [view, setView] = useState("locations");
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [showMoreWorst, setShowMoreWorst] = useState(10);
  const [showMoreBest, setShowMoreBest] = useState(10);
  const [showMoreLocal, setShowMoreLocal] = useState(10);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Haversine distance in km
  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = x => x * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setLocError(true); return; }
    setLocating(true); setLocError(false);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        fetchNearby(pos.coords.latitude, pos.coords.longitude);
      },
      () => { setLocError(true); setLocating(false); }
    );
  };

  // Fetch real nearby McDonald's from Google Places - closest 8 regardless of distance
  const fetchNearby = (lat, lng) => {
    if (!window.google?.maps?.places) return;
    setLoadingNearby(true);
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.nearbySearch({
      location: { lat, lng },
      rankBy: window.google.maps.places.RankBy.DISTANCE,
      keyword: "McDonald's",
      type: "restaurant"
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const mcds = results
          .filter(p => p.name.toLowerCase().includes("mcdonald"))
          .slice(0, 8)
          .map(p => ({
            id: p.place_id,
            name: p.name,
            address: p.vicinity,
            lat: p.geometry.location.lat(),
            lng: p.geometry.location.lng(),
          }));
        setNearbyPlaces(mcds);
      }
      setLoadingNearby(false);
    });
  };

  useEffect(() => {
    if (scope === "local") getLocation();
  }, [scope]);

  // Also try to fetch nearby when Maps loads
  useEffect(() => {
    if (userCoords && window.google?.maps?.places && nearbyPlaces.length === 0) {
      fetchNearby(userCoords.lat, userCoords.lng);
    }
  }, [userCoords]);

  // Build location stats from real reviews
  const getStats = id => {
    const r = reviews.filter(x => x.locationId === id);
    if (!r.length) return null;
    return { avg:(r.reduce((a,x)=>a+x.rating,0)/r.length).toFixed(1), count:r.length };
  };

  // Global: build from real reviews grouped by location
  const locationMap = {};
  reviews.forEach(r => {
    if (!locationMap[r.locationId]) {
      locationMap[r.locationId] = { id:r.locationId, name:r.locationName||r.locationId, address:"", ratings:[] };
    }
    locationMap[r.locationId].ratings.push(r.rating);
    if (r.locationName) locationMap[r.locationId].name = r.locationName;
  });
  const globalLocData = Object.values(locationMap).map(l => ({
    ...l,
    avg: (l.ratings.reduce((a,b)=>a+b,0)/l.ratings.length).toFixed(1),
    count: l.ratings.length,
    hasReviews: true,
    distance: userCoords && l.lat && l.lng ? calcDistance(userCoords.lat, userCoords.lng, l.lat, l.lng) : "?"
  }));

  // Local: real nearby places from Google, enriched with McRate reviews
  const localLocData = nearbyPlaces.map(l => {
    const stats = getStats(l.id);
    const dist = userCoords ? calcDistance(userCoords.lat, userCoords.lng, l.lat, l.lng) : "?";
    return { ...l, ...(stats||{}), distance:dist, hasReviews:!!stats };
  }).sort((a,b) => parseFloat(a.distance) - parseFloat(b.distance));

  const best = [...globalLocData].sort((a,b)=>parseFloat(b.avg)-parseFloat(a.avg));
  const worst = [...globalLocData].sort((a,b)=>parseFloat(a.avg)-parseFloat(b.avg));

  const itemRatings = {};
  reviews.forEach(r=>{ if(!itemRatings[r.foodItem]) itemRatings[r.foodItem]=[]; itemRatings[r.foodItem].push(r.rating); });
  const itemData = Object.entries(itemRatings).map(([item,rats])=>({ item, avg:(rats.reduce((a,b)=>a+b,0)/rats.length).toFixed(1), count:rats.length })).sort((a,b)=>parseFloat(b.avg)-parseFloat(a.avg));

  const LocCard = ({ loc, rank, isBest, showDistance=false }) => (
    <div onClick={()=>onOpenLocation(loc)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:W, borderRadius:16, marginBottom:8, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", borderLeft:`4px solid ${!loc.hasReviews?"#CBD5E1":showDistance?"#3b82f6":isBest?"#22c55e":R}`, cursor:"pointer" }}>
      {rank && <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:!loc.hasReviews?LG:showDistance?"#3b82f6":isBest?"#22c55e":R, width:36, textAlign:"center" }}>#{rank}</div>}
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:15, color:DARK }}>{loc.name}</div>
        <div style={{ fontSize:12, color:GRAY, marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
          {showDistance
            ? <><MapPin size={11} color="#3b82f6"/><span style={{ color:"#3b82f6", fontWeight:600 }}>{loc.distance}km away</span></>
            : <><MapPin size={11} color={GRAY}/><span>{loc.distance}km</span></>
          }
          {loc.hasReviews && <span>· {loc.count} review{loc.count!==1?"s":""}</span>}
        </div>
        {loc.hasReviews
          ? <Stars n={parseFloat(loc.avg)} size={13}/>
          : <div style={{ fontSize:12, color:R, fontWeight:600, marginTop:4 }}>⭐ Be the first to review!</div>
        }
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {loc.hasReviews
          ? <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:showDistance?DARK:isBest?"#22c55e":R }}>{loc.avg}</div>
          : <div style={{ fontSize:12, color:GRAY, textAlign:"center", lineHeight:1.3 }}>No<br/>rating</div>
        }
        <span style={{ color:LG, fontSize:18 }}>›</span>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, overflow:"auto", background:BG }}>
      <div style={{ background:W, padding:"12px 16px", borderBottom:`1px solid ${LG}`, display:"flex", gap:8, alignItems:"center", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={()=>setScope("local")} style={{ flex:1, padding:"8px 0", borderRadius:50, border:"none", background:scope==="local"?R:LG, color:scope==="local"?W:GRAY, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <MapPin size={13} color={scope==="local"?W:GRAY}/> Local
        </button>
        <button onClick={()=>setScope("global")} style={{ flex:1, padding:"8px 0", borderRadius:50, border:"none", background:scope==="global"?R:LG, color:scope==="global"?W:GRAY, fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <Globe size={13} color={scope==="global"?W:GRAY}/> Global
        </button>
      </div>

      {/* Geolocation status bar — local only */}
      {scope==="local" && (
        <div style={{ background:"#FFFBF0", borderBottom:`1px solid ${LG}`, padding:"8px 16px", display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
          {locating && <><MapPin size={14} color={GRAY}/><span style={{ color:GRAY }}>Getting your location…</span></>}
          {!locating && userCoords && <><MapPin size={14} color="#155724"/><span style={{ color:"#155724", fontWeight:600 }}>Sorted by distance from you</span></>}
          {!locating && !userCoords && !locError && <><MapPin size={14} color={GRAY}/><span style={{ color:GRAY }}>Using approximate distances</span></>}
          {locError && <>
            <AlertTriangle size={14} color="#856404"/>
            <span style={{ color:GRAY, flex:1 }}>Could not get location — using approximate distances</span>
            <button onClick={getLocation} style={{ background:R, color:W, border:"none", borderRadius:50, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Retry</button>
          </>}
        </div>
      )}
      <div style={{ padding:"10px 16px 0", display:"flex", gap:8 }}>
        <button onClick={()=>setView("locations")} style={{ padding:"6px 16px", borderRadius:50, border:"none", background:view==="locations"?DARK:LG, color:view==="locations"?W:GRAY, fontWeight:600, fontSize:13, cursor:"pointer" }}>Locations</button>
        <button onClick={()=>setView("items")} style={{ padding:"6px 16px", borderRadius:50, border:"none", background:view==="items"?DARK:LG, color:view==="items"?W:GRAY, fontWeight:600, fontSize:13, cursor:"pointer" }}>Menu Items</button>
      </div>
      <div style={{ padding:16 }}>
        {view==="locations"?(
          <>
            {scope==="local" ? (
              <>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:DARK, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                  <MapPin size={16} color={DARK}/> NEAREST TO YOU
                </div>
                {loadingNearby && <div style={{ textAlign:"center", padding:"20px 0", color:GRAY, fontSize:14 }}>Finding nearby McDonald's…</div>}
                {!loadingNearby && localLocData.length === 0 && !locError && userCoords && (
                  <div style={{ textAlign:"center", padding:"20px 0", color:GRAY, fontSize:14 }}>No nearby McDonald's found. Try allowing location access.</div>
                )}
                {localLocData.slice(0,showMoreLocal).map((loc,i)=><LocCard key={loc.id} loc={loc} rank={i+1} isBest={null} showDistance={true}/>)}
                {localLocData.length>showMoreLocal&&(
                  <button onClick={()=>setShowMoreLocal(v=>v+10)} style={{ width:"100%", background:LG, border:"none", borderRadius:12, padding:"10px 0", fontWeight:700, fontSize:14, cursor:"pointer", color:DARK, marginBottom:16 }}>
                    Show More ({localLocData.length-showMoreLocal} remaining)
                  </button>
                )}
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:"#8b5cf6", margin:"20px 0 10px" }}>💎 HIDDEN GEMS</div>
                {localLocData.filter(l=>l.hasReviews&&parseInt(l.count)<3&&parseFloat(l.avg)>=4).map(loc=>(
                  <div key={loc.id} onClick={()=>onOpenLocation(loc)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:W, borderRadius:16, marginBottom:8, borderLeft:"4px solid #8b5cf6", cursor:"pointer" }}>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{loc.name}</div><div style={{ fontSize:12, color:GRAY }}>Only {loc.count} review{loc.count!==1?"s":""} — be first!</div><Stars n={parseFloat(loc.avg)} size={13}/></div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"#8b5cf6" }}>{loc.avg}</div>
                  </div>
                ))}
                {localLocData.filter(l=>l.hasReviews&&parseInt(l.count)<3&&parseFloat(l.avg)>=4).length===0&&<div style={{ fontSize:14, color:GRAY, textAlign:"center" }}>No hidden gems yet!</div>}
              </>
            ) : (
              <>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:R, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}><TrendingDown size={16} color={R}/> WORST RATED</div>
                {worst.slice(0,showMoreWorst).map((loc,i)=><LocCard key={loc.id} loc={loc} rank={i+1} isBest={false}/>)}
                {worst.length>showMoreWorst&&(
                  <button onClick={()=>setShowMoreWorst(v=>v+10)} style={{ width:"100%", background:LG, border:"none", borderRadius:12, padding:"10px 0", fontWeight:700, fontSize:14, cursor:"pointer", color:DARK, marginBottom:8 }}>
                    Show More ({worst.length-showMoreWorst} remaining)
                  </button>
                )}
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:"#22c55e", margin:"20px 0 10px", display:"flex", alignItems:"center", gap:8 }}><Trophy size={16} color="#22c55e"/> BEST RATED</div>
                {best.slice(0,showMoreBest).map((loc,i)=><LocCard key={loc.id} loc={loc} rank={i+1} isBest={true}/>)}
                {best.length>showMoreBest&&(
                  <button onClick={()=>setShowMoreBest(v=>v+10)} style={{ width:"100%", background:LG, border:"none", borderRadius:12, padding:"10px 0", fontWeight:700, fontSize:14, cursor:"pointer", color:DARK, marginBottom:8 }}>
                    Show More ({best.length-showMoreBest} remaining)
                  </button>
                )}
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:"#3b82f6", margin:"20px 0 10px", display:"flex", alignItems:"center", gap:8 }}>
                  <Flame size={16} color="#3b82f6"/> MOST REVIEWED
                </div>
                {[...locData].sort((a,b)=>parseInt(b.count)-parseInt(a.count)).slice(0,5).map((loc,i)=>(
                  <div key={loc.id} onClick={()=>onOpenLocation(loc)} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:W, borderRadius:16, marginBottom:8, borderLeft:"4px solid #3b82f6", cursor:"pointer" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:"#3b82f6", width:32, textAlign:"center" }}>#{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{loc.name}</div>
                      <div style={{ fontSize:12, color:GRAY, marginTop:2 }}>{loc.count} review{loc.count!==1?"s":""}</div>
                      <Stars n={parseFloat(loc.avg)} size={12}/>
                    </div>
                    <span style={{ color:LG, fontSize:18 }}>›</span>
                  </div>
                ))}
              </>
            )}
          </>
        ):(
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:DARK, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}><Star size={16} color={Y} fill={Y}/> MENU ITEM RANKINGS</div>
            {itemData.sort((a,b)=>parseFloat(a.avg)-parseFloat(b.avg)).map((item,i)=>(
              <div key={item.item} onClick={()=>onOpenMenuItem(item.item)} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:W, borderRadius:16, marginBottom:8, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:i===itemData.length-1?Y:i===itemData.length-2?"#A8A9AD":i===itemData.length-3?"#CD7F32":LG, width:28, textAlign:"center" }}>#{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{item.item}</div>
                  <div style={{ fontSize:12, color:GRAY }}>{item.count} review{item.count!==1?"s":""}</div>
                  <Stars n={parseFloat(item.avg)} size={12}/>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:R }}>{item.avg}</div>
                  <span style={{ color:LG, fontSize:18 }}>›</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Journey Tab ──────────────────────────────────────────────────────────────
function JourneyTab({ reviews, onOpenLocation }) {
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromPlace, setFromPlace] = useState(null);
  const [toPlace, setToPlace] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromACRef = useRef(null);
  const toACRef = useRef(null);

  // Wait for Maps script loaded at app level
  useEffect(() => {
    if (window.google?.maps?.DirectionsService) { setMapReady(true); return; }
    const check = setInterval(() => {
      if (window.google?.maps?.DirectionsService) { setMapReady(true); clearInterval(check); }
    }, 100);
    return () => clearInterval(check);
  }, []);

  // Set up autocomplete on inputs
  useEffect(() => {
    if (!mapReady || !fromInputRef.current || !toInputRef.current) return;
    fromACRef.current = new window.google.maps.places.Autocomplete(fromInputRef.current, { fields: ["place_id","name","geometry","formatted_address"] });
    fromACRef.current.addListener("place_changed", () => {
      const p = fromACRef.current.getPlace();
      if (p.geometry) { setFromPlace(p); setFromText(p.name || p.formatted_address); }
    });
    toACRef.current = new window.google.maps.places.Autocomplete(toInputRef.current, { fields: ["place_id","name","geometry","formatted_address"] });
    toACRef.current.addListener("place_changed", () => {
      const p = toACRef.current.getPlace();
      if (p.geometry) { setToPlace(p); setToText(p.name || p.formatted_address); }
    });
  }, [mapReady]);

  // Init map once results are shown
  useEffect(() => {
    if (!mapReady || !results || !mapRef.current) return;
    if (mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: fromPlace?.geometry?.location || { lat: -33.8688, lng: 151.2093 },
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      styles: [{ featureType:"poi", elementType:"labels", stylers:[{visibility:"off"}] }]
    });
  }, [results, mapReady]);

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const addr = results[0].formatted_address;
            setFromText(addr);
            setFromPlace({ geometry: { location: new window.google.maps.LatLng(lat, lng) }, formatted_address: addr });
            if (fromInputRef.current) fromInputRef.current.value = addr;
          }
        });
      } catch {}
      setLocating(false);
    }, () => { setError("Could not get location"); setLocating(false); });
  };

  const getAvgRating = (placeId) => {
    const r = reviews.filter(x => x.locationId === placeId);
    return r.length ? (r.reduce((a,x)=>a+x.rating,0)/r.length).toFixed(1) : null;
  };

  const findRoute = async () => {
    if (!fromPlace || !toPlace) { setError("Please select both start and end points from the suggestions"); return; }
    if (!window.google?.maps?.DirectionsService) { setError("Maps still loading — please try again in a moment"); return; }
    setLoading(true); setError(""); setResults(null);
    mapInstanceRef.current = null;

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({ suppressMarkers: false });

      // Get route
      const routeResult = await new Promise((resolve, reject) => {
        directionsService.route({
          origin: fromPlace.geometry.location,
          destination: toPlace.geometry.location,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === "OK") resolve(result);
          else reject(new Error(status));
        });
      });

      const route = routeResult.routes[0];
      const leg = route.legs[0];
      const totalDuration = leg.duration.value; // seconds

      // Sample points along the route to search for McDonald's
      const path = route.overview_path;
      const totalPoints = path.length;
      const samplePoints = [];
      for (let i = 0; i < 5; i++) {
        samplePoints.push(path[Math.floor((i / 4) * (totalPoints - 1))]);
      }

      // Search for McDonald's near each sample point
      const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
      const allMcds = new Map();

      await Promise.all(samplePoints.map(point => new Promise(resolve => {
        placesService.nearbySearch({
          location: point,
          radius: 5000,
          keyword: "McDonald's",
          type: "restaurant"
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(p => {
              if (p.name.toLowerCase().includes("mcdonald") && !allMcds.has(p.place_id)) {
                allMcds.set(p.place_id, p);
              }
            });
          }
          resolve();
        });
      })));

      // Calculate detour time for each McDonald's
      const distanceMatrix = new window.google.maps.DistanceMatrixService();
      const mcdsArray = Array.from(allMcds.values()).slice(0, 10);

      const detourResults = await Promise.all(mcdsArray.map(async mcd => {
        return new Promise(resolve => {
          distanceMatrix.getDistanceMatrix({
            origins: [fromPlace.geometry.location],
            destinations: [mcd.geometry.location],
            travelMode: window.google.maps.TravelMode.DRIVING,
          }, (res, status) => {
            if (status === "OK") {
              const element = res.rows[0].elements[0];
              const detourSecs = element.duration?.value || 0;
              // Rough detour: time to McDonald's + time from McDonald's to destination vs direct
              const detourMins = Math.round(Math.max(0, detourSecs - totalDuration / 2) / 60);
              resolve({
                placeId: mcd.place_id,
                name: mcd.name,
                address: mcd.vicinity,
                lat: mcd.geometry.location.lat(),
                lng: mcd.geometry.location.lng(),
                rating: getAvgRating(mcd.place_id),
                googleRating: mcd.rating,
                detourMins,
                location: mcd.geometry.location,
              });
            } else resolve(null);
          });
        });
      }));

      // Filter nulls and sort by position along route
      const validResults = detourResults
        .filter(Boolean)
        .sort((a, b) => {
          // Sort by how far along the route each McDonald's is
          const pathLatLng = path.map(p => new window.google.maps.LatLng(p.lat(), p.lng()));
          const getClosestIdx = (loc) => {
            let minDist = Infinity, minIdx = 0;
            pathLatLng.forEach((p, i) => {
              const d = window.google.maps.geometry.spherical.computeDistanceBetween(p, loc);
              if (d < minDist) { minDist = d; minIdx = i; }
            });
            return minIdx;
          };
          return getClosestIdx(a.location) - getClosestIdx(b.location);
        });

      setResults({ mcds: validResults, route: routeResult, leg });

      // Draw map
      setTimeout(() => {
        if (!mapRef.current) return;
        const map = new window.google.maps.Map(mapRef.current, {
          mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
          styles: [{ featureType:"poi", elementType:"labels", stylers:[{visibility:"off"}] }]
        });
        mapInstanceRef.current = map;
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(routeResult);

        // Add McDonald's markers
        validResults.forEach((mcd, i) => {
          const marker = new window.google.maps.Marker({
            position: { lat: mcd.lat, lng: mcd.lng },
            map,
            title: mcd.name,
            label: { text: `${i+1}`, color: "white", fontWeight: "bold" },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: "#DA291C",
              fillOpacity: 1,
              strokeColor: "#FFC72C",
              strokeWeight: 2,
            }
          });
          marker.addListener("click", () => {
            onOpenLocation({ id: mcd.placeId, name: mcd.name, address: mcd.address });
          });
        });
      }, 100);

    } catch(e) {
      setError(`Could not find route: ${e.message}. Please check your start and end points.`);
    }
    setLoading(false);
  };

  return (
    <div style={{ flex:1, overflow:"auto", background:BG }}>
      <div style={{ background:W, padding:16, borderBottom:`1px solid ${LG}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Map size={20} color={R}/>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:R, letterSpacing:1.5 }}>MY JOURNEY</div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* From */}
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", zIndex:1 }}>
              <MapPin size={14} color="#22c55e"/>
            </span>
            <input
              ref={fromInputRef}
              defaultValue={fromText}
              onChange={e => { setFromText(e.target.value); setFromPlace(null); }}
              placeholder="Starting point…"
              style={{ width:"100%", padding:"12px 14px 12px 36px", border:`1.5px solid ${LG}`, borderRadius:12, fontSize:14, fontFamily:"inherit", outline:"none" }}
            />
          </div>

          {/* Use my location button */}
          <button onClick={useMyLocation} disabled={!mapReady || locating} style={{ background:"none", border:`1.5px solid ${LG}`, borderRadius:12, padding:"10px 14px", fontSize:13, color:R, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
            <MapPin size={14} color={R}/>{locating ? "Getting location…" : "Use my current location"}
          </button>

          {/* To */}
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", zIndex:1 }}>
              <MapPin size={14} color={R}/>
            </span>
            <input
              ref={toInputRef}
              defaultValue={toText}
              onChange={e => { setToText(e.target.value); setToPlace(null); }}
              placeholder="Destination…"
              style={{ width:"100%", padding:"12px 14px 12px 36px", border:`1.5px solid ${LG}`, borderRadius:12, fontSize:14, fontFamily:"inherit", outline:"none" }}
            />
          </div>

          {error && <div style={{ fontSize:13, color:R, fontWeight:600 }}>{error}</div>}

          <button onClick={findRoute} disabled={loading || !mapReady || !fromPlace || !toPlace}
            style={{ background: fromPlace&&toPlace ? R : LG, color: fromPlace&&toPlace ? W : GRAY, border:"none", borderRadius:50, padding:"12px 0", fontWeight:700, fontSize:15, cursor: fromPlace&&toPlace ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit" }}>
            <Navigation size={16} color={fromPlace&&toPlace?W:GRAY}/>
            {loading ? "Finding McDonald's on route…" : "Find McDonald's on Route"}
          </button>
        </div>
      </div>

      {/* Map */}
      {results && (
        <div ref={mapRef} style={{ width:"100%", height:280, background:LG }}/>
      )}

      {/* Results */}
      {results && (
        <div style={{ padding:16 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:DARK, marginBottom:4 }}>
            {results.mcds.length} MACCAS ON YOUR ROUTE
          </div>
          <div style={{ fontSize:12, color:GRAY, marginBottom:12 }}>
            {results.leg.distance.text} · {results.leg.duration.text} total journey
          </div>
          {results.mcds.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 0", color:GRAY }}>
              <div style={{ fontSize:14 }}>No McDonald's found along this route</div>
            </div>
          )}
          {results.mcds.map((mcd, i) => (
            <div key={mcd.placeId} onClick={() => onOpenLocation({ id:mcd.placeId, name:mcd.name, address:mcd.address })}
              style={{ background:W, borderRadius:16, padding:"14px 16px", marginBottom:10, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", cursor:"pointer", display:"flex", gap:14, alignItems:"center" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:R, color:W, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:16, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{mcd.name}</div>
                <div style={{ fontSize:12, color:GRAY, marginTop:2, display:"flex", alignItems:"center", gap:3 }}><MapPin size={10} color={GRAY}/>{mcd.address}</div>
                <div style={{ display:"flex", gap:8, marginTop:6, alignItems:"center" }}>
                  {mcd.detourMins !== undefined && (
                    <div style={{ background: mcd.detourMins<=3?"#D4EDDA":mcd.detourMins<=8?"#FFF3CD":"#F8D7DA", borderRadius:50, padding:"3px 10px", fontSize:12, fontWeight:700, color:mcd.detourMins<=3?"#155724":mcd.detourMins<=8?"#856404":"#721c24" }}>
                      +{mcd.detourMins} min
                    </div>
                  )}
                  {mcd.rating && <div style={{ display:"flex", alignItems:"center", gap:4 }}><Stars n={parseFloat(mcd.rating)} size={12}/><span style={{ fontSize:12, color:GRAY }}>{mcd.rating} McRate</span></div>}
                  {!mcd.rating && mcd.googleRating && <span style={{ fontSize:12, color:GRAY }}>★ {mcd.googleRating} Google</span>}
                </div>
              </div>
              <span style={{ color:LG, fontSize:18 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:GRAY }}>
          <Navigation size={56} color={LG} style={{ margin:"0 auto 12px" }}/>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, color:DARK, marginTop:8 }}>PLAN YOUR MACCAS ROUTE</div>
          <div style={{ fontSize:14, marginTop:8, lineHeight:1.6 }}>Enter your start and end point to find McDonald's along the way.</div>
        </div>
      )}
    </div>
  );
}

// ─── Location Page ────────────────────────────────────────────────────────────
function LocationPage({ location, reviews, onBack, onAddReview, onAddComment, onReact, currentUser }) {
  const locReviews = reviews.filter(r=>r.locationId===location.id);
  const avg = locReviews.length?(locReviews.reduce((a,r)=>a+r.rating,0)/locReviews.length):0;
  const catKeys = [["hot","Hot"],["wellBuilt","Well Built"],["fresh","Fresh"],["portionSize","Portion Size"]];
  const catAvgs = catKeys.reduce((acc,[k])=>{ const vs=locReviews.filter(r=>r.categories?.[k]).map(r=>r.categories[k]); acc[k]=vs.length?(vs.reduce((a,b)=>a+b,0)/vs.length):0; return acc; },{});
  const srt=[...locReviews].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const mid=Math.floor(srt.length/2);
  const oldAvg=mid>0?srt.slice(0,mid).reduce((a,r)=>a+r.rating,0)/mid:null;
  const newAvg=mid>0?srt.slice(mid).reduce((a,r)=>a+r.rating,0)/(srt.length-mid):null;
  const tDir=oldAvg&&newAvg?(newAvg>oldAvg+0.2?"up":newAvg<oldAvg-0.2?"down":"flat"):"flat";
  const tColor=tDir==="up"?"#22c55e":tDir==="down"?R:GRAY;

  const TrendLine = () => {
    const pts=srt.map((r,i)=>({i:i+1,rating:r.rating}));
    if(pts.length<2) return <div style={{ fontSize:13, color:GRAY }}>Not enough data yet</div>;
    const W2=220,H=56,pad=8;
    const xs=pts.map(p=>pad+((p.i-1)/(pts.length-1))*(W2-pad*2));
    const ys=pts.map(p=>H-pad-((p.rating-1)/4)*(H-pad*2));
    return <svg width={W2} height={H}><polyline points={xs.map((x,i)=>`${x},${ys[i]}`).join(" ")} fill="none" stroke={tColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>{xs.map((x,i)=><circle key={i} cx={x} cy={ys[i]} r={3} fill={tColor}/>)}</svg>;
  };

  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:300, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:R, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:W, width:32, height:32, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color={W}/>
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:Y, letterSpacing:1, lineHeight:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{location.name}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>{location.address}</div>
        </div>
        <button onClick={()=>onAddReview(location)} style={{ background:Y, color:DARK, border:"none", borderRadius:50, padding:"7px 14px", fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Review</button>
      </div>
      <div style={{ flex:1, overflow:"auto" }}>
        <div style={{ background:W, margin:14, borderRadius:20, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:R, lineHeight:1 }}>{avg?avg.toFixed(1):"—"}</div>
              <div style={{ fontSize:11, color:GRAY, fontWeight:600, textTransform:"uppercase" }}>Overall</div>
            </div>
            <div style={{ flex:1 }}>
              <Stars n={avg} size={18}/>
              <div style={{ fontSize:13, color:GRAY, marginTop:4 }}>{locReviews.length} review{locReviews.length!==1?"s":""}</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6, background:tDir==="up"?"#D4EDDA":tDir==="down"?"#F8D7DA":LG, borderRadius:50, padding:"3px 10px" }}>
                <span style={{ fontSize:13, color:tColor, fontWeight:700 }}>{tDir==="up"?"↑":tDir==="down"?"↓":"→"}</span>
                <span style={{ fontSize:12, fontWeight:700, color:tColor }}>{tDir==="up"?"Improving":tDir==="down"?"Declining":"Steady"}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {catKeys.map(([k,label])=>(
              <div key={k}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:600, color:GRAY, textTransform:"uppercase", marginBottom:4 }}><span>{label}</span><span style={{ color:R }}>{catAvgs[k]?catAvgs[k].toFixed(1):"—"}</span></div>
                <div style={{ height:5, background:LG, borderRadius:3 }}><div style={{ height:"100%", width:`${(catAvgs[k]/5)*100}%`, background:R, borderRadius:3 }}/></div>
              </div>
            ))}
          </div>
          {locReviews.length>=2&&<div><div style={{ fontSize:11, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Rating Trend</div><TrendLine/>{oldAvg&&newAvg&&<div style={{ display:"flex", gap:16, marginTop:6, fontSize:12, color:GRAY }}><span>Earlier: <strong>{oldAvg.toFixed(1)}</strong></span><span>Recent: <strong style={{ color:tColor }}>{newAvg.toFixed(1)}</strong></span></div>}</div>}
        </div>
        <div style={{ padding:"0 14px 24px" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:1.5, color:DARK, marginBottom:10 }}>ALL REVIEWS ({locReviews.length})</div>
          {locReviews.length===0&&<div style={{ textAlign:"center", padding:"40px 0", color:GRAY }}><div style={{ fontSize:48 }}>🍔</div><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:1.5 }}>NO REVIEWS YET</div><button onClick={()=>onAddReview(location)} style={{ marginTop:14, background:R, color:W, border:"none", borderRadius:50, padding:"10px 24px", fontWeight:700, fontSize:14, cursor:"pointer" }}>Write a Review</button></div>}
          {locReviews.map(r=><div key={r.id} style={{ background:W, borderRadius:16, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}><FeedPost review={r} currentUser={currentUser} onAgree={()=>{}} onDisagree={()=>{}} onAddComment={onAddComment} onReact={onReact}/></div>)}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setAvatar(ev.target.result);
    r.readAsDataURL(f);
  };

  const handleSave = async () => {
    setUploading(true);
    let avatarUrl = user.avatar;
    // Upload new photo if changed
    if (avatar && avatar !== user.avatar && avatar.startsWith("data:")) {
      const uploaded = await sb.uploadPhoto(avatar, `avatars/${user.id}_${Date.now()}.jpg`, user.token).catch(()=>null);
      if (uploaded) avatarUrl = uploaded;
    }
    onSave({ name, avatar: avatarUrl, avatar_url: avatarUrl });
    setUploading(false);
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:600, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:W, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, padding:24, animation:"slideUp 0.25s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:DARK, letterSpacing:1.5 }}>EDIT PROFILE</div>
          <button onClick={onClose} style={{ background:LG, border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>×</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div onClick={()=>fileRef.current?.click()} style={{ position:"relative", cursor:"pointer" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:R, border:`3px solid ${Y}`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:Y }}>{name?.[0]?.toUpperCase()||"?"}</span>}
            </div>
            <div style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:R, border:`2px solid ${W}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Camera size={13} color={W}/>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          {avatar && avatar !== user.avatar && (
            <div style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>✓ New photo selected — will save when you tap Save</div>
          )}
          <div style={{ width:"100%" }}>
            <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Display Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${LG}`, borderRadius:12, fontSize:15, fontFamily:"inherit", outline:"none" }}/>
          </div>
          <button onClick={handleSave} disabled={uploading} style={{ width:"100%", background:R, color:W, border:"none", borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
            {uploading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, reviews, onLogout, onUpdateUser, onOpenLocation, token }) {
  const myReviews = reviews.filter(r => r.userId === user?.id);
  const [aiDNA, setAiDNA] = useState(null);
  const [loadingDNA, setLoadingDNA] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const totalAgrees=myReviews.reduce((a,r)=>a+(r.agrees||0),0);
  const totalDisagrees=myReviews.reduce((a,r)=>a+(r.disagrees||0),0);
  const reliability=totalAgrees+totalDisagrees>0?Math.round((totalAgrees/(totalAgrees+totalDisagrees))*100):user.reliabilityScore;
  const tierProgress=user.tier==="bronze"?33:user.tier==="silver"?66:100;

  const getDNA = async () => {
    setLoadingDNA(true);
    try {
      const s=myReviews.map(r=>`${r.foodItem}: ${r.rating}/5`).join(", ")||"no reviews yet";
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Based on these McDonald's reviews: ${s}. Create a fun 1-sentence "McDonald's DNA" profile. Be creative and specific.`}]})});
      const d=await res.json(); setAiDNA(d.content?.[0]?.text||"");
    } catch{setAiDNA("Could not generate DNA.");}
    setLoadingDNA(false);
  };

  const challenges=[
    {label:"Review 3 locations this week",progress:Math.min(myReviews.length,3),total:3,reward:"🔥 Streak Badge"},
    {label:"Get 10 agrees",progress:Math.min(totalAgrees,10),total:10,reward:"✅ Trusted Badge"},
    {label:"Try 5 different items",progress:new Set(myReviews.map(r=>r.foodItem)).size,total:5,reward:"🍔 Foodie Badge"},
  ];

  return (
    <div style={{ flex:1, overflow:"auto", background:BG }}>
      <div style={{ background:R, padding:"24px 20px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div style={{ position:"relative" }}>
            <Avatar name={user.name} size={64} tier={user.tier}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:Y, letterSpacing:1.5 }}>{user.name}</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>{tierLabel(user.tier)} · {user.streak||0} day streak 🔥</div>
            <div style={{ display:"flex", gap:6, marginTop:6 }}>{(user.badges||[]).map(b=>{const bd=BADGES.find(x=>x.id===b);return bd?<span key={b} title={bd.label} style={{ fontSize:18 }}>{bd.icon}</span>:null;})}</div>
          </div>
          <button onClick={()=>setShowEdit(true)} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:W, borderRadius:50, padding:"7px 14px", fontWeight:700, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}>Edit</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {[{label:"Reviews",value:myReviews.length||user.reviewCount},{label:"Reliability",value:`${reliability}%`},{label:"Agrees",value:totalAgrees||0}].map(s=>(
            <div key={s.label} style={{ background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"10px 0", textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:Y }}>{s.value}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600, textTransform:"uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:14 }}>
        {/* Tier */}
        <div style={{ background:W, borderRadius:20, padding:16, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><div style={{ fontWeight:700, fontSize:15 }}>Reviewer Tier</div><div style={{ fontSize:13, color:GRAY }}>🥉→🥈→🥇</div></div>
          <div style={{ height:8, background:LG, borderRadius:4, overflow:"hidden" }}><div style={{ height:"100%", width:`${tierProgress}%`, background:`linear-gradient(90deg,#CD7F32,${Y})`, borderRadius:4 }}/></div>
          <div style={{ fontSize:12, color:GRAY, marginTop:6 }}>{tierLabel(user.tier)} · {100-tierProgress}% to next tier</div>
        </div>

        {/* DNA */}
        <div style={{ background:W, borderRadius:20, padding:16, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}><Zap size={16} color={Y} fill={Y}/>Your McDonald's DNA</div>
          {aiDNA?<div style={{ background:"#FFF8E1", border:`1px solid ${Y}`, borderRadius:12, padding:"12px 14px", fontSize:14, color:"#555", lineHeight:1.6, fontStyle:"italic" }}>{aiDNA}</div>:<button onClick={getDNA} disabled={loadingDNA} style={{ width:"100%", background:Y, border:"none", borderRadius:12, padding:"10px 0", fontWeight:700, fontSize:14, cursor:"pointer", color:DARK }}>{loadingDNA?"Analysing…":"✨ Generate My DNA"}</button>}
        </div>

        {/* Challenges */}
        <div style={{ background:W, borderRadius:20, padding:16, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}><Award size={16} color={Y}/>Weekly Challenges</div>
          {challenges.map((c,i)=>(
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}><span style={{ fontWeight:500 }}>{c.label}</span><span style={{ color:GRAY }}>{c.progress}/{c.total}</span></div>
              <div style={{ height:6, background:LG, borderRadius:3, overflow:"hidden", marginBottom:3 }}><div style={{ height:"100%", width:`${(c.progress/c.total)*100}%`, background:c.progress>=c.total?"#22c55e":R, borderRadius:3 }}/></div>
              <div style={{ fontSize:11, color:GRAY }}>Reward: {c.reward}</div>
            </div>
          ))}
        </div>

        {/* My reviews */}
        <div style={{ background:W, borderRadius:20, padding:16, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}><Star size={15} color={Y} fill={Y}/>My Reviews ({myReviews.length})</div>
          {myReviews.length===0&&<div style={{ color:GRAY, fontSize:14, textAlign:"center", padding:"12px 0" }}>No reviews yet — start posting!</div>}
          {myReviews.map(r=>(
            <div key={r.id} onClick={()=>onOpenLocation&&onOpenLocation({id:r.locationId, name:r.locationName, address:""})}
              style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${LG}`, cursor:"pointer" }}>
              <img src={r.image} alt="" style={{ width:56, height:56, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{r.foodItem}</div>
                <div style={{ fontSize:12, color:GRAY, marginTop:2, display:"flex", alignItems:"center", gap:3 }}>
                  <MapPin size={10} color={GRAY}/>{r.locationName}
                </div>
                <div style={{ display:"flex", gap:10, marginTop:4, fontSize:12, color:GRAY, alignItems:"center" }}>
                  <Stars n={r.rating} size={12}/>
                  <ThumbsUp size={11} color={GRAY}/><span>{r.agrees}</span>
                  <ThumbsDown size={11} color={GRAY}/><span>{r.disagrees}</span>
                </div>
              </div>
              <span style={{ color:LG, fontSize:18, alignSelf:"center" }}>›</span>
            </div>
          ))}
        </div>

        {/* Log out */}
        {!confirmLogout ? (
          <button onClick={()=>setConfirmLogout(true)} style={{ width:"100%", background:W, border:`1.5px solid ${LG}`, borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", color:GRAY, fontFamily:"inherit", marginBottom:24 }}>
            Log Out
          </button>
        ) : (
          <div style={{ background:W, borderRadius:20, padding:16, marginBottom:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", textAlign:"center" }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>Are you sure?</div>
            <div style={{ fontSize:13, color:GRAY, marginBottom:14 }}>You'll need to log back in to post reviews.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmLogout(false)} style={{ flex:1, background:LG, border:"none", borderRadius:50, padding:"11px 0", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={onLogout} style={{ flex:1, background:R, color:W, border:"none", borderRadius:50, padding:"11px 0", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Log Out</button>
            </div>
          </div>
        )}
      </div>

      {showEdit && <EditProfileModal user={{...user, token}} onClose={()=>setShowEdit(false)} onSave={onUpdateUser}/>}
    </div>
  );
}

// ─── Onboarding Infographic ───────────────────────────────────────────────────
function OnboardingSlide({ onDone }) {
  const [page, setPage] = useState(0);
  const slides = [
    { icon: <Camera size={56} color={W}/>, title:"Post Your Meal", body:"Take a photo of your McDonald's order and rate it 1–5 stars. Be honest — the community is watching." },
    { icon: <ThumbsUp size={56} color={W}/>, title:"Agree or Disagree", body:"See someone's review? Tell them if you agree with their rating. Community trust drives the rankings." },
    { icon: <Trophy size={56} color={W}/>, title:"Climb the Ranks", body:"The more you review, the higher your tier. Bronze → Silver → Gold. Earn badges along the way." },
    { icon: <MapPin size={56} color={W}/>, title:"Find the Best Near You", body:"Rankings show the best and worst McDonald's near you. Journey finds Maccas along any route." },
  ];
  const s = slides[page];
  return (
    <div style={{ position:"fixed", inset:0, background:R, zIndex:900, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, maxWidth:480, margin:"0 auto" }}>
      <div style={{ marginBottom:32 }}>{s.icon}</div>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:Y, letterSpacing:2, textAlign:"center", marginBottom:16 }}>{s.title}</div>
      <div style={{ fontSize:16, color:"rgba(255,255,255,0.85)", textAlign:"center", lineHeight:1.7, marginBottom:40 }}>{s.body}</div>
      <div style={{ display:"flex", gap:8, marginBottom:32 }}>
        {slides.map((_,i) => <div key={i} style={{ width:i===page?24:8, height:8, borderRadius:4, background:i===page?Y:"rgba(255,255,255,0.3)", transition:"all 0.2s" }}/>)}
      </div>
      <div style={{ display:"flex", gap:12, width:"100%" }}>
        {page < slides.length - 1 ? (
          <>
            <button onClick={onDone} style={{ flex:1, background:"rgba(255,255,255,0.15)", color:W, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>Skip</button>
            <button onClick={()=>setPage(p=>p+1)} style={{ flex:2, background:Y, color:DARK, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>Next →</button>
          </>
        ) : (
          <button onClick={onDone} style={{ flex:1, background:Y, color:DARK, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit" }}>Let's Go! 🍔</button>
        )}
      </div>
    </div>
  );
}
function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", inset:0, background:R, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
        @keyframes popIn { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ animation:"popIn 0.6s ease forwards" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:120, color:Y, lineHeight:1, textShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>M</div>
      </div>
      <div style={{ animation:"fadeUp 0.5s ease 0.5s both", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <McRateLogo size={44} onRed />
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", textAlign:"center", letterSpacing:2, marginTop:8, textTransform:"uppercase" }}>Rate Your Maccas</div>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGoSignUp, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const data = await sb.signIn(email, password);
      if (data.error) { setError(data.error_description || "Login failed. Please check your details."); setLoading(false); return; }
      saveSession({ token: data.access_token, userId: data.user.id });
      const profile = await sb.query("profiles", `?id=eq.${data.user.id}`, data.access_token);
      onLogin({ token: data.access_token, id: data.user.id, ...profile[0] });
    } catch { setError("Could not connect. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:W, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", zIndex:900 }}>
      {/* Red top section */}
      <div style={{ background:R, padding:"60px 32px 40px", display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
        {onClose && (
          <button onClick={onClose} style={{ position:"absolute", top:16, left:16, background:"rgba(255,255,255,0.2)", border:"none", color:W, width:32, height:32, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <ArrowLeft size={16} color={W}/>
          </button>
        )}
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:72, color:Y, lineHeight:1 }}>M</div>
        <McRateLogo size={36} onRed />
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginTop:6, letterSpacing:1.5, textTransform:"uppercase" }}>Rate Your Maccas</div>
      </div>

      {/* Form */}
      <div style={{ flex:1, padding:"32px 24px", display:"flex", flexDirection:"column", gap:16, overflow:"auto" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:DARK, letterSpacing:1.5 }}>WELCOME BACK</div>

        {error && <div style={{ background:"#FEE2E2", border:`1px solid ${R}`, borderRadius:12, padding:"10px 14px", fontSize:13, color:R, fontWeight:600 }}>{error}</div>}

        <div>
          <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Email</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email"
            style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${LG}`, borderRadius:14, fontSize:15, fontFamily:"inherit", outline:"none", color:DARK }}/>
        </div>

        <div>
          <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Password</div>
          <div style={{ position:"relative" }}>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type={showPass?"text":"password"}
              style={{ width:"100%", padding:"13px 48px 13px 16px", border:`1.5px solid ${LG}`, borderRadius:14, fontSize:15, fontFamily:"inherit", outline:"none", color:DARK }}/>
            <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:GRAY }}>
              {showPass?"🙈":"👁️"}
            </button>
          </div>
        </div>

        <button style={{ background:"none", border:"none", color:R, fontWeight:700, fontSize:13, cursor:"pointer", textAlign:"right", padding:0 }}>
          Forgot password?
        </button>

        <button onClick={handleLogin} disabled={loading} style={{ background:R, color:W, border:"none", borderRadius:50, padding:"15px 0", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit", marginTop:4 }}>
          {loading ? "Logging in…" : "Log In"}
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1, height:1, background:LG }}/>
          <span style={{ fontSize:12, color:GRAY, fontWeight:600 }}>OR</span>
          <div style={{ flex:1, height:1, background:LG }}/>
        </div>

        {/* Social login */}
        <button onClick={()=>handleLogin()} style={{ background:DARK, color:W, border:"none", borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Continue with Apple
        </button>
        <button onClick={()=>handleLogin()} style={{ background:W, color:DARK, border:`1.5px solid ${LG}`, borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ textAlign:"center", fontSize:14, color:GRAY, marginTop:8 }}>
          Don't have an account?{" "}
          <button onClick={onGoSignUp} style={{ background:"none", border:"none", color:R, fontWeight:700, fontSize:14, cursor:"pointer", padding:0 }}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up Screen ───────────────────────────────────────────────────────────
function SignUpScreen({ onSignUp, onGoLogin }) {
  const [step, setStep] = useState("details"); // "details" | "photo"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleNext = () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setStep("photo");
  };

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleCreate = async () => {
    setLoading(true); setError("");
    try {
      const data = await sb.signUp(email, password, name.trim());
      if (data.error) { setError(data.error_description || data.error || "Sign up failed. Please try again."); setLoading(false); return; }
      if (!data.access_token) { setError("Account created but login failed — please go back and log in."); setLoading(false); return; }
      let avatarUrl = null;
      if (avatar && data.access_token) {
        avatarUrl = await sb.uploadPhoto(avatar, `avatars/${data.user.id}_avatar.jpg`, data.access_token).catch(()=>null);
      }
      if (avatarUrl && data.access_token) {
        await sb.update("profiles", `id=eq.${data.user.id}`, { avatar_url: avatarUrl }, data.access_token).catch(()=>{});
      }
      saveSession({ token: data.access_token, userId: data.user.id });
      onSignUp({ token: data.access_token, id: data.user.id, name: name.trim(), avatar, tier: "bronze", streak: 0, badges: ["first"], reliabilityScore: 0, reviewCount: 0 });
    } catch(e) { setError("Could not connect to server. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:W, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", zIndex:900 }}>
      {/* Header */}
      <div style={{ background:R, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={step==="photo"?()=>setStep("details"):onGoLogin} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:W, width:32, height:32, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color={W}/>
        </button>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:Y, letterSpacing:1.5, flex:1 }}>
          {step==="details" ? "CREATE ACCOUNT" : "ADD A PHOTO"}
        </div>
        {/* Step indicator */}
        <div style={{ display:"flex", gap:6 }}>
          {["details","photo"].map((s,i)=>(
            <div key={s} style={{ width:8, height:8, borderRadius:"50%", background:step===s?Y:"rgba(255,255,255,0.3)" }}/>
          ))}
        </div>
      </div>

      {step==="details" && (
        <div style={{ flex:1, padding:"28px 24px", display:"flex", flexDirection:"column", gap:16, overflow:"auto" }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:DARK, letterSpacing:1.5 }}>JOIN McRATE</div>
            <div style={{ fontSize:14, color:GRAY, marginTop:4 }}>Rate McDonald's. Name and shame. Find the best near you.</div>
          </div>

          {error && <div style={{ background:"#FEE2E2", border:`1px solid ${R}`, borderRadius:12, padding:"10px 14px", fontSize:13, color:R, fontWeight:600 }}>{error}</div>}

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Your Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="First name or username"
              style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${LG}`, borderRadius:14, fontSize:15, fontFamily:"inherit", outline:"none", color:DARK }}/>
          </div>

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Email</div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email"
              style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${LG}`, borderRadius:14, fontSize:15, fontFamily:"inherit", outline:"none", color:DARK }}/>
          </div>

          <div>
            <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Password</div>
            <div style={{ position:"relative" }}>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" type={showPass?"text":"password"}
                style={{ width:"100%", padding:"13px 48px 13px 16px", border:`1.5px solid ${LG}`, borderRadius:14, fontSize:15, fontFamily:"inherit", outline:"none", color:DARK }}/>
              <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center" }}>
                {showPass ? <EyeOff size={16} color={GRAY}/> : <Eye size={16} color={GRAY}/>}
              </button>
            </div>
          </div>

          <button onClick={handleNext} style={{ background:R, color:W, border:"none", borderRadius:50, padding:"15px 0", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit", marginTop:4 }}>
            Next →
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1, height:1, background:LG }}/>
            <span style={{ fontSize:12, color:GRAY, fontWeight:600 }}>OR</span>
            <div style={{ flex:1, height:1, background:LG }}/>
          </div>

          <button onClick={()=>handleCreate()} style={{ background:DARK, color:W, border:"none", borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Continue with Apple
          </button>
          <button onClick={()=>handleCreate()} style={{ background:W, color:DARK, border:`1.5px solid ${LG}`, borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ textAlign:"center", fontSize:14, color:GRAY }}>
            Already have an account?{" "}
            <button onClick={onGoLogin} style={{ background:"none", border:"none", color:R, fontWeight:700, fontSize:14, cursor:"pointer", padding:0 }}>Log In</button>
          </div>
        </div>
      )}

      {step==="photo" && (
        <div style={{ flex:1, padding:"28px 24px", display:"flex", flexDirection:"column", gap:20, alignItems:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:DARK, letterSpacing:1.5 }}>ADD A PHOTO</div>
            <div style={{ fontSize:14, color:GRAY, marginTop:4 }}>Help the community recognise you</div>
          </div>

          {/* Avatar preview */}
          <div onClick={()=>fileRef.current?.click()} style={{ cursor:"pointer", position:"relative" }}>
            <div style={{ width:120, height:120, borderRadius:"50%", background:avatar?"transparent":R, border:`4px solid ${Y}`, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:Y }}>{name?.[0]?.toUpperCase()||"?"}</span>
              }
            </div>
            <div style={{ position:"absolute", bottom:4, right:4, width:32, height:32, borderRadius:"50%", background:R, border:`2px solid ${W}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Camera size={15} color={W}/>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>

          <button onClick={()=>fileRef.current?.click()} style={{ background:LG, color:DARK, border:"none", borderRadius:50, padding:"12px 32px", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
            Choose Photo
          </button>

          {/* Bronze tier welcome card */}
          <div style={{ background:BG, borderRadius:20, padding:"16px 20px", width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:6 }}>🥉</div>
            <div style={{ fontWeight:700, fontSize:15, color:DARK }}>Welcome, {name}!</div>
            <div style={{ fontSize:13, color:GRAY, marginTop:4, lineHeight:1.5 }}>You're starting as a Bronze reviewer. Rate more locations to level up to Silver and Gold.</div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%" }}>
            <button onClick={handleCreate} disabled={loading} style={{ background:R, color:W, border:"none", borderRadius:50, padding:"15px 0", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit" }}>
              {loading ? "Creating account…" : "Let's Go!"}
            </button>
            <button onClick={handleCreate} disabled={loading} style={{ background:"none", border:"none", color:GRAY, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
              Skip photo for now
            </button>
          </div>
          {error && <div style={{ background:"#FEE2E2", border:`1px solid ${R}`, borderRadius:12, padding:"10px 14px", fontSize:13, color:R, fontWeight:600, width:"100%", textAlign:"center" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authStage, setAuthStage] = useState(loadAuthStage);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [reviews, setReviews] = useState(SEED);
  const [notifications, setNotifications] = useState(SEED_NOTIFS);
  const [appLoading, setAppLoading] = useState(false);
  const [tab, setTab] = useState("home");
  const [showAddPost, setShowAddPost] = useState(false);
  const [addPostLocation, setAddPostLocation] = useState(null);
  const [locationPage, setLocationPage] = useState(null);
  const [menuItemPage, setMenuItemPage] = useState(null);
  const [userProfilePage, setUserProfilePage] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const visits = parseInt(localStorage.getItem("mcrate_visits") || "0");
      const newVisits = visits + 1;
      localStorage.setItem("mcrate_visits", newVisits);
      return newVisits <= 3;
    } catch { return false; }
  });

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),2500); };
  const unread = notifications.filter(n=>!n.read).length;
  const setAuth = stage => { setAuthStage(stage); saveAuthStage(stage); };

  // Load Google Maps once at app level with ALL required libraries
  useEffect(() => {
    if (window.google?.maps?.DirectionsService) return;
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;
    if (GOOGLE_API_KEY === "YOUR_GOOGLE_PLACES_API_KEY") return;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry,directions`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Restore session on mount — load reviews regardless of auth state
  useEffect(()=>{
    const session = loadSession();
    // Safety timeout — never stay on loading screen more than 5 seconds
    const timeout = setTimeout(() => setAppLoading(false), 5000);
    (async ()=>{
      try {
        // Load reviews inline so there's no closure issue
        const reviewData = await sb.query("reviews","?select=*,profiles(name,tier),locations(name)&order=created_at.desc&limit=50", session?.token||null);
        if (Array.isArray(reviewData) && reviewData.length>0) {
          setReviews(reviewData.map(r=>({
            id:r.id, locationId:r.location_id,
            locationName:r.locations?.name || r.location_id || "Unknown Location",
            userId:r.user_id, userName:r.profiles?.name||"User", userTier:r.profiles?.tier||"bronze",
            foodItem:r.food_item, rating:r.rating, text:r.text,
            images:r.images||[], image:(r.images||[])[0]||IMGS[0],
            verified:r.verified, categories:r.categories||{},
            agrees:r.agrees, disagrees:r.disagrees,
            comments:[], reactions:{}, date:r.created_at,
          })));
        }
      } catch {}

      if (session?.token) {
        try {
          const userData = await sb.getUser(session.token);
          if (userData?.id) {
            const profiles = await sb.query("profiles", `?id=eq.${userData.id}`, session.token);
            setUser({ id:userData.id, token:session.token, ...(profiles[0]||{}) });
            setToken(session.token);
            setAuthStage("app");
            await loadNotifs(session.token, userData.id);
          } else { saveSession(null); setAuthStage("app"); }
        } catch { setAuthStage("app"); }
      } else {
        setAuthStage("app");
      }
      clearTimeout(timeout);
      setAppLoading(false);
    })();
  },[]);

  const loadReviews = async (tok) => {
    try {
      const data = await sb.query("reviews","?select=*,profiles(name,tier),locations(name)&order=created_at.desc&limit=50",tok);
      if (Array.isArray(data) && data.length>0) {
        setReviews(data.map(r=>({
          id:r.id, locationId:r.location_id,
          locationName:r.locations?.name || r.location_id || "Unknown Location",
          userId:r.user_id, userName:r.profiles?.name||"User", userTier:r.profiles?.tier||"bronze",
          foodItem:r.food_item, rating:r.rating, text:r.text,
          images:r.images||[], image:(r.images||[])[0]||IMGS[0],
          verified:r.verified, categories:r.categories||{},
          agrees:r.agrees, disagrees:r.disagrees,
          comments:[], reactions:{}, date:r.created_at,
        })));
      }
    } catch {}
  };

  const loadNotifs = async (tok, userId) => {
    try {
      const data = await sb.query("notifications",`?user_id=eq.${userId}&order=created_at.desc&limit=30`,tok);
      if (Array.isArray(data)) setNotifications(data.map(n=>({ id:n.id, type:n.type, fromUser:n.from_user_name, reviewId:n.review_id, reviewSnippet:n.review_snippet, read:n.read, date:n.created_at })));
    } catch {}
  };

  const handleLogin = async (userData) => {
    setUser(userData); setToken(userData.token);
    saveSession({ token:userData.token, userId:userData.id });
    setAuth("app");
    await loadReviews(userData.token);
    await loadNotifs(userData.token, userData.id);
  };

  const handleSignUp = async (userData) => {
    setUser(userData); setToken(userData.token);
    saveSession({ token:userData.token, userId:userData.id });
    setAuth("app");
    showToast("Welcome to McRate! 🍔");
  };

  const handleLogout = async () => {
    if (token) await sb.signOut(token).catch(()=>{});
    saveSession(null); setUser(null); setToken(null);
    setReviews(SEED); setNotifications(SEED_NOTIFS);
    setAuth("login"); setTab("home");
  };

  const handleUpdateUser = async (updates) => {
    if (token && user) await sb.update("profiles",`id=eq.${user.id}`,updates,token).catch(()=>{});
    setUser(u=>({...u,...updates}));
    showToast("Profile updated!");
  };

  const handleAgree = async (reviewId, currentVote) => {
    if (!token||!user) { setAuth("login"); return; }
    try {
      if (currentVote === "agree") {
        // Undo agree
        await sb.delete("votes", `review_id=eq.${reviewId}&user_id=eq.${user.id}`, token);
        setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,agrees:Math.max(0,r.agrees-1)}:r));
      } else {
        if (currentVote === "disagree") {
          // Switch from disagree to agree
          await sb.update("votes", `review_id=eq.${reviewId}&user_id=eq.${user.id}`, {vote_type:"agree"}, token);
          setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,agrees:r.agrees+1,disagrees:Math.max(0,r.disagrees-1)}:r));
        } else {
          // New agree vote
          await sb.insert("votes",{review_id:reviewId,user_id:user.id,vote_type:"agree"},token);
          setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,agrees:r.agrees+1}:r));
        }
        const rev=reviews.find(r=>r.id===reviewId);
        if (rev&&rev.userId!==user.id) await sb.insert("notifications",{user_id:rev.userId,from_user_id:user.id,from_user_name:user.name,type:"agree",review_id:reviewId,review_snippet:(rev.text||"").slice(0,40)},token).catch(()=>{});
      }
    } catch {}
  };

  const handleDisagree = async (reviewId, currentVote) => {
    if (!token||!user) { setAuth("login"); return; }
    try {
      if (currentVote === "disagree") {
        // Undo disagree
        await sb.delete("votes", `review_id=eq.${reviewId}&user_id=eq.${user.id}`, token);
        setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,disagrees:Math.max(0,r.disagrees-1)}:r));
      } else {
        if (currentVote === "agree") {
          // Switch from agree to disagree
          await sb.update("votes", `review_id=eq.${reviewId}&user_id=eq.${user.id}`, {vote_type:"disagree"}, token);
          setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,disagrees:r.disagrees+1,agrees:Math.max(0,r.agrees-1)}:r));
        } else {
          // New disagree vote
          await sb.insert("votes",{review_id:reviewId,user_id:user.id,vote_type:"disagree"},token);
          setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,disagrees:r.disagrees+1}:r));
        }
        const rev=reviews.find(r=>r.id===reviewId);
        if (rev&&rev.userId!==user.id) await sb.insert("notifications",{user_id:rev.userId,from_user_id:user.id,from_user_name:user.name,type:"disagree",review_id:reviewId,review_snippet:(rev.text||"").slice(0,40)},token).catch(()=>{});
      }
    } catch {}
  };

  const handleAddComment = async (reviewId, text, parentId=null) => {
    if (!token||!user) { setAuth("login"); return; }
    try {
      const result = await sb.insert("comments",{review_id:reviewId,user_id:user.id,parent_id:parentId,text},token);
      const nc={id:result[0]?.id||Date.now().toString(),userId:user.id,user:user.name,userTier:user.tier,text,date:new Date().toISOString(),replies:[]};
      const addReply=cs=>cs.map(c=>c.id===parentId?{...c,replies:[...(c.replies||[]),nc]}:{...c,replies:addReply(c.replies||[])});
      setReviews(rs=>rs.map(r=>r.id!==reviewId?r:!parentId?{...r,comments:[...(r.comments||[]),nc]}:{...r,comments:addReply(r.comments||[])}));
      const rev=reviews.find(r=>r.id===reviewId);
      if (rev&&rev.userId!==user.id) await sb.insert("notifications",{user_id:rev.userId,from_user_id:user.id,from_user_name:user.name,type:parentId?"reply":"comment",review_id:reviewId,review_snippet:(rev.text||"").slice(0,40)},token).catch(()=>{});
      showToast(parentId?"Reply posted!":"Comment posted!");
    } catch { showToast("Could not post comment."); }
  };

  const handleReact = (reviewId,reaction) => {
    setReviews(rs=>rs.map(r=>r.id===reviewId?{...r,reactions:{...(r.reactions||{}),[reaction]:((r.reactions||{})[reaction]||0)+1}}:r));
  };

  const handleSubmitPost = async (data) => {
    if (!token||!user) return;
    showToast("Uploading…");
    try {
      const uploadedUrls=[];
      for (let i=0;i<(data.images||[]).length;i++) {
        const path=`${user.id}/${Date.now()}_${i}.jpg`;
        const url=await sb.uploadPhoto(data.images[i],path,token);
        if (url) uploadedUrls.push(url);
      }
      if (data.locationId) await sb.insert("locations",{id:data.locationId, name:data.locationName||data.locationId, address:data.locationAddress||""}, token).catch(()=>{});
      const result=await sb.insert("reviews",{user_id:user.id,location_id:data.locationId,food_item:data.foodItem,rating:data.rating,text:data.text,images:uploadedUrls.length>0?uploadedUrls:data.images,categories:data.categories,verified:false},token);
      const newReview={id:result[0]?.id||Date.now().toString(),locationId:data.locationId,locationName:data.locationName||data.locationId,userId:user.id,userName:user.name,userTier:user.tier,foodItem:data.foodItem,rating:data.rating,text:data.text,images:uploadedUrls.length>0?uploadedUrls:data.images,image:(uploadedUrls[0]||data.images?.[0]),categories:data.categories,verified:false,agrees:0,disagrees:0,comments:[],reactions:{},date:new Date().toISOString()};
      setReviews(rs=>[newReview,...rs]);
      showToast("Posted!");
    } catch { showToast("Could not post review."); }
  };

  const handleMarkRead = async (id) => {
    if (id==="all") {
      setNotifications(ns=>ns.map(n=>({...n,read:true})));
      if (token&&user) await sb.update("notifications",`user_id=eq.${user.id}&read=eq.false`,{read:true},token).catch(()=>{});
    } else {
      setNotifications(ns=>ns.map(n=>n.id===id?{...n,read:true}:n));
      if (token) await sb.update("notifications",`id=eq.${id}`,{read:true},token).catch(()=>{});
    }
  };

  const handleOpenUser = (review) => {
    if (user && review.userId === user.id) { setTab("profile"); return; }
    setUserProfilePage({ userId:review.userId, userName:review.userName, userTier:review.userTier });
  };

  const currentUser = user||{id:"guest",name:"You",tier:"bronze"};

  const TABS = [
    {id:"home",icon:Home,label:"Home"},
    {id:"bestworst",icon:Trophy,label:"Rankings"},
    {id:"add",icon:null,label:""},
    {id:"journey",icon:Map,label:"Journey"},
    {id:"profile",icon:User,label:"Profile"},
  ];

  if (appLoading) return (
    <div style={{ maxWidth:480, margin:"0 auto", height:"100vh", background:R, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:80, color:Y, lineHeight:1 }}>M</div>
      <McRateLogo size={36} onRed/>
    </div>
  );

  return (
    <div style={{ maxWidth:480, margin:"0 auto", height:"100vh", display:"flex", flexDirection:"column", background:BG, fontFamily:"'DM Sans',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {showOnboarding && authStage==="app" && <OnboardingSlide onDone={()=>setShowOnboarding(false)}/>}
      {authStage==="signup"&&<SignUpScreen onSignUp={handleSignUp} onGoLogin={()=>setAuth("login")}/>}

      {authStage==="app"&&<>
        <div style={{ background:R, height:56, display:"flex", alignItems:"center", padding:"0 16px", justifyContent:"space-between", flexShrink:0, zIndex:20 }}>
          <McRateLogo size={32} onRed/>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {!user && (
              <button onClick={()=>setAuth("login")} style={{ background:Y, color:DARK, border:"none", borderRadius:50, padding:"7px 16px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Log In
              </button>
            )}
            {user && (
              <button onClick={()=>setShowNotifs(true)} style={{ position:"relative", background:"rgba(255,255,255,0.15)", border:"none", color:W, width:38, height:38, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Bell size={18} color={W} strokeWidth={2}/>
                {unread>0&&<div style={{ position:"absolute", top:2, right:2, background:Y, color:DARK, borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${R}` }}>{unread}</div>}
              </button>
            )}
          </div>
        </div>
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {tab==="home"&&<FeedTab reviews={reviews} user={currentUser} onAgree={handleAgree} onDisagree={handleDisagree} onAddComment={handleAddComment} onReact={handleReact} onOpenUser={handleOpenUser}/>}
          {tab==="bestworst"&&<BestWorstTab reviews={reviews} onOpenLocation={setLocationPage} onOpenMenuItem={setMenuItemPage}/>}
          {tab==="journey"&&<JourneyTab reviews={reviews} onOpenLocation={setLocationPage}/>}
          {tab==="profile"&&(user
            ? <ProfileTab user={currentUser} reviews={reviews} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onOpenLocation={setLocationPage} token={token}/>
            : <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, gap:20, background:BG }}>
                <User size={64} color={LG}/>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:DARK, textAlign:"center" }}>YOUR PROFILE</div>
                <div style={{ fontSize:15, color:GRAY, textAlign:"center", lineHeight:1.6 }}>Create an account to track your reviews, earn badges, and build your reviewer reputation.</div>
                <button onClick={()=>setAuth("signup")} style={{ background:R, color:W, border:"none", borderRadius:50, padding:"14px 0", fontWeight:700, fontSize:16, cursor:"pointer", width:"100%", fontFamily:"inherit" }}>Create Account</button>
                <button onClick={()=>setAuth("login")} style={{ background:W, color:DARK, border:`1.5px solid ${LG}`, borderRadius:50, padding:"13px 0", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%", fontFamily:"inherit" }}>Log In</button>
              </div>
          )}
        </div>
        <div style={{ background:W, borderTop:`1px solid ${LG}`, display:"flex", height:64, flexShrink:0, zIndex:20, position:"relative", alignItems:"center", padding:"0 4px" }}>
          {TABS.map(t=>t.id==="add"?(
            <div key="add" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <button onClick={()=>{ if(!user){setAuth("login");return;} setAddPostLocation(null);setShowAddPost(true);}} style={{ width:48, height:48, borderRadius:16, background:R, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 6px 20px rgba(218,41,28,0.5)", transform:"translateY(-14px)" }}>
                <Plus size={26} color={W} strokeWidth={2.2}/>
              </button>
            </div>
          ):(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, border:"none", background:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, cursor:"pointer", padding:"4px 0" }}>
              <div style={{ width:40, height:32, borderRadius:50, background:tab===t.id?"#FEE2E2":"none", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}>
                <t.icon size={20} color={tab===t.id?R:GRAY} strokeWidth={tab===t.id?2.5:1.8}/>
              </div>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", color:tab===t.id?R:GRAY }}>{t.label}</span>
            </button>
          ))}
        </div>
        {locationPage&&<LocationPage location={locationPage} reviews={reviews} onBack={()=>setLocationPage(null)} onAddReview={loc=>{setAddPostLocation(loc);setShowAddPost(true);}} onAddComment={handleAddComment} onReact={handleReact} currentUser={currentUser}/>}
        {menuItemPage&&<MenuItemPage item={menuItemPage} reviews={reviews} onBack={()=>setMenuItemPage(null)} onAddComment={handleAddComment} onReact={handleReact} currentUser={currentUser}/>}
        {userProfilePage&&<UserProfilePage userId={userProfilePage.userId} userName={userProfilePage.userName} userTier={userProfilePage.userTier} reviews={reviews} onBack={()=>setUserProfilePage(null)}/>}
        {showAddPost&&<AddPostFlow onClose={()=>{setShowAddPost(false);setAddPostLocation(null);}} onSubmit={handleSubmitPost} locations={MOCK_LOCATIONS} defaultLocationId={addPostLocation?.id}/>}
        {showNotifs&&<NotificationsPanel notifications={notifications} onClose={()=>setShowNotifs(false)} onMarkRead={handleMarkRead}/>}
      </>}

      <Toast msg={toast}/>
    </div>
  );
}
