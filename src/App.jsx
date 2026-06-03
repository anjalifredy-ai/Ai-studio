import { useState, useEffect, useRef } from "react";

const API_KEY = "2dca580c2a14b55200e784d157207b4d";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const BACKDROP = "https://image.tmdb.org/t/p/original";

const MOVIE_GENRES = [
  { id: "", name: "All" }, { id: 28, name: "Action" }, { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" }, { id: 27, name: "Horror" }, { id: 878, name: "Sci-Fi" },
  { id: 10749, name: "Romance" }, { id: 16, name: "Animation" }, { id: 53, name: "Thriller" },
];

const TV_GENRES = [
  { id: "", name: "All" }, { id: 10759, name: "Action" }, { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" }, { id: 10765, name: "Sci-Fi" }, { id: 9648, name: "Mystery" },
];

function StarRating({ rating }) {
  const stars = Math.round(rating / 2);
  return (
    <span style={{ color: "#f5c518", fontSize: 12 }}>
      {"★".repeat(Math.max(0,stars))}{"☆".repeat(Math.max(0,5-stars))}
      <span style={{ color: "#aaa", marginLeft: 4 }}>{rating?.toFixed(1)}</span>
    </span>
  );
}

function Card({ item, onClick, isInWatchlist, onWatchlist, type }) {
  const [hovered, setHovered] = useState(false);
  const title = item.title || item.name;
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "transform 0.25s, box-shadow 0.25s", transform: hovered ? "scale(1.04)" : "scale(1)", boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.7)" : "0 4px 12px rgba(0,0,0,0.4)", background: "#1a1a2e" }}>
      <div onClick={() => onClick(item)}>
        <img src={item.poster_path ? `${IMG}${item.poster_path}` : `https://via.placeholder.com/300x450/1a1a2e/fff?text=${encodeURIComponent(title)}`}
          alt={title} style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: hovered ? "linear-gradient(to top, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.1) 100%)" : "linear-gradient(to top, rgba(0,0,0,0.8) 20%, transparent 60%)", transition: "all 0.3s" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 8px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3, lineHeight: 1.3 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <StarRating rating={item.vote_average || 0} />
            <span style={{ fontSize: 10, color: "#aaa" }}>{(item.release_date || item.first_air_date)?.slice(0, 4)}</span>
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onWatchlist(item, type); }}
        style={{ position: "absolute", top: 8, right: 8, background: isInWatchlist ? "#e50914" : "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        {isInWatchlist ? "♥" : "♡"}
      </button>
    </div>
  );
}

function TrailerModal({ videoKey, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 800, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: -40, right: 0, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>✕ Close</button>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12, border: "none" }} allowFullScreen allow="autoplay" />
        </div>
      </div>
    </div>
  );
}

function Modal({ item, onClose, onWatchlist, isInWatchlist, type }) {
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const title = item?.title || item?.name;

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    const fetchTrailer = async () => {
      try {
        const endpoint = type === "movie" ? `movie/${item.id}/videos` : type === "anime" ? `movie/${item.id}/videos` : `tv/${item.id}/videos`;
        const res = await fetch(`${BASE}/${endpoint}?api_key=${API_KEY}`);
        const data = await res.json();
        const yt = data.results?.find(v => v.site === "YouTube" && v.type === "Trailer");
        setTrailer(yt?.key || null);
      } catch {}
    };
    fetchTrailer();
    return () => { document.body.style.overflow = "auto"; };
  }, [item]);

  if (!item) return null;
  return (
    <>
      {showTrailer && trailer && <TrailerModal videoKey={trailer} onClose={() => setShowTrailer(false)} />}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#0f0f1a", borderRadius: 20, overflow: "hidden", maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)" }}>
          {item.backdrop_path && (
            <div style={{ position: "relative", height: 220 }}>
              <img src={`${BACKDROP}${item.backdrop_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), #0f0f1a)" }} />
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>×</button>
          <div style={{ padding: "20px 24px 28px", display: "flex", gap: 20, flexWrap: "wrap" }}>
            <img src={item.poster_path ? `${IMG}${item.poster_path}` : "https://via.placeholder.com/120x180/1a1a2e/fff?text=No+Image"} alt="" style={{ width: 120, height: 180, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8, fontFamily: "'Bebas Neue', cursive" }}>{title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <StarRating rating={item.vote_average || 0} />
                <span style={{ fontSize: 12, color: "#aaa", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 20 }}>{(item.release_date || item.first_air_date)?.slice(0, 4)}</span>
                <span style={{ fontSize: 12, color: "#e50914", background: "rgba(229,9,20,0.15)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(229,9,20,0.3)" }}>HD</span>
              </div>
              <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, marginBottom: 16 }}>{item.overview || "No description available."}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {trailer && (
                  <button onClick={() => setShowTrailer(true)} style={{ padding: "10px 20px", background: "#e50914", border: "none", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>▶ Watch Trailer</button>
                )}
                <button onClick={() => onWatchlist(item, type)} style={{ padding: "10px 20px", background: isInWatchlist ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.1)", border: `1px solid ${isInWatchlist ? "#e50914" : "rgba(255,255,255,0.2)"}`, color: isInWatchlist ? "#e50914" : "#fff", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                  {isInWatchlist ? "♥ Saved" : "♡ Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState("movie");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("popular");
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("watchlist") || "[]"); } catch { return []; }
  });
  const debounce = useRef(null);

  const saveWatchlist = (list) => {
    setWatchlist(list);
    try { localStorage.setItem("watchlist", JSON.stringify(list)); } catch {}
  };

  const toggleWatchlist = (item, type) => {
    const exists = watchlist.find(w => w.id === item.id);
    if (exists) saveWatchlist(watchlist.filter(w => w.id !== item.id));
    else saveWatchlist([...watchlist, { ...item, _type: type }]);
  };

  const isInWatchlist = (id) => watchlist.some(w => w.id === id);

  const fetchContent = async (q, g, p, s, t) => {
    setLoading(true);
    try {
      let url;
      if (q) {
        const searchType = t === "movies" ? "movie" : t === "anime" ? "movie" : "tv";
        url = `${BASE}/search/${searchType}?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${p}`;
        if (t === "anime") url += "&with_genres=16&with_origin_country=JP";
      } else if (t === "movies") {
        const ep = s === "popular" ? "popular" : s === "top" ? "top_rated" : s === "upcoming" ? "upcoming" : "now_playing";
        url = `${BASE}/movie/${ep}?api_key=${API_KEY}&page=${p}${g ? `&with_genres=${g}` : ""}`;
      } else if (t === "anime") {
        url = `${BASE}/discover/movie?api_key=${API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=${p}`;
      } else {
        const ep = s === "popular" ? "popular" : s === "top" ? "top_rated" : "on_the_air";
        url = `${BASE}/tv/${ep}?api_key=${API_KEY}&page=${p}${g ? `&with_genres=${g}` : ""}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 20));
      if (p === 1 && data.results?.length > 0) setFeatured(data.results[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab !== "watchlist") fetchContent(query, genre, page, section, tab);
  }, [query, genre, page, section, tab]);

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setQuery(v); setPage(1); }, 500);
  };

  const handleTab = (t) => { setTab(t); setPage(1); setQuery(""); setSearch(""); setGenre(""); setSection("popular"); };
  const handleSelect = (item, type) => { setSelected(item); setSelectedType(type || (tab === "movies" ? "movie" : tab === "anime" ? "movie" : "tv")); };

  const genres = tab === "tvshows" ? TV_GENRES : MOVIE_GENRES;
  const displayItems = tab === "watchlist" ? watchlist : movies;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#e50914;border-radius:4px;}
        input::placeholder{color:#555;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* HERO */}
      {featured && !query && tab !== "watchlist" && (
        <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
          <img src={featured.backdrop_path ? `${BACKDROP}${featured.backdrop_path}` : ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,8,16,0.95) 30%, rgba(8,8,16,0.3) 70%, rgba(8,8,16,0.8)), linear-gradient(to top, #080810 0%, transparent 40%)" }} />
          <div style={{ position: "absolute", bottom: 60, left: 0, padding: "0 28px", maxWidth: 560 }}>
            <div style={{ fontSize: 10, color: "#e50914", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>🔥 {tab === "anime" ? "FEATURED ANIME" : tab === "tvshows" ? "FEATURED SHOW" : "FEATURED MOVIE"}</div>
            <div style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Bebas Neue', cursive", lineHeight: 1, marginBottom: 10 }}>{featured.title || featured.name}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <StarRating rating={featured.vote_average || 0} />
              <span style={{ fontSize: 12, color: "#aaa" }}>{(featured.release_date || featured.first_air_date)?.slice(0, 4)}</span>
            </div>
            <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{featured.overview}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleSelect(featured)} style={{ padding: "10px 24px", background: "#e50914", border: "none", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>▶ Watch Now</button>
              <button onClick={() => toggleWatchlist(featured, tab === "movies" ? "movie" : "tv")} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                {isInWatchlist(featured.id) ? "♥ Saved" : "+ Watchlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Bebas Neue', cursive", color: "#e50914", letterSpacing: 2, flexShrink: 0 }}>MOVIEFLIX</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[["movies","🎬 Movies"],["anime","⛩️ Anime"],["tvshows","📺 TV Shows"],["watchlist","❤️ Watchlist"]].map(([t,l]) => (
              <button key={t} onClick={() => handleTab(t)} style={{ padding: "5px 12px", borderRadius: 20, border: tab===t ? "1px solid #e50914" : "1px solid #333", background: tab===t ? "rgba(229,9,20,0.2)" : "transparent", color: tab===t ? "#e50914" : "#888", fontSize: 12, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                {l}{t==="watchlist"?` (${watchlist.length})`:""}
              </button>
            ))}
          </div>
          {tab !== "watchlist" && (
            <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 14 }}>🔍</span>
              <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "7px 12px 7px 32px", color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
          )}
        </div>

        {tab !== "watchlist" && tab !== "anime" && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {(tab === "movies" ? ["popular","top","upcoming","now"] : ["popular","top","on_air"]).map(s => (
              <button key={s} onClick={() => { setSection(s); setPage(1); }} style={{ padding: "4px 12px", borderRadius: 16, border: section===s ? "1px solid #e50914" : "1px solid #333", background: section===s ? "rgba(229,9,20,0.15)" : "transparent", color: section===s ? "#e50914" : "#777", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600 }}>
                {s==="popular"?"Popular":s==="top"?"Top Rated":s==="upcoming"?"Upcoming":s==="now"?"Now Playing":"On Air"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GENRES */}
      {tab !== "watchlist" && tab !== "anime" && (
        <div style={{ padding: "10px 20px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
          {genres.map(g => (
            <button key={g.id} onClick={() => { setGenre(g.id); setPage(1); }} style={{ padding: "5px 14px", borderRadius: 20, border: genre===g.id ? "1px solid #e50914" : "1px solid #2a2a3a", background: genre===g.id ? "#e50914" : "transparent", color: genre===g.id ? "#fff" : "#777", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, transition: "all 0.2s" }}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      <div style={{ padding: "0 20px 32px" }}>
        {tab === "watchlist" && watchlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#555" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Watchlist Empty</div>
            <div style={{ fontSize: 14 }}>Movies aur shows save karo ♡ button se!</div>
          </div>
        ) : loading && tab !== "watchlist" ? (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
            <div style={{ fontSize: 36, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
            <div style={{ marginTop: 12 }}>Loading...</div>
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
            <div>Kuch nahi mila!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
            {displayItems.map(item => (
              <Card key={item.id} item={item} onClick={handleSelect}
                isInWatchlist={isInWatchlist(item.id)}
                onWatchlist={toggleWatchlist}
                type={tab === "movies" || tab === "anime" ? "movie" : "tv"} />
            ))}
          </div>
        )}

        {!loading && tab !== "watchlist" && displayItems.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #333", background: "transparent", color: page===1?"#333":"#fff", cursor: page===1?"default":"pointer", fontSize: 13 }}>← Prev</button>
            <span style={{ color: "#666", fontSize: 13 }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #333", background: "transparent", color: page===totalPage
