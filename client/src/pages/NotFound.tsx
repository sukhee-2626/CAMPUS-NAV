// Field Notes Atlas: lost-page states stay inside the parchment, compass-pin, and blue route-thread system.
import { ArrowLeft, Compass, MapPin, Route as RouteIcon } from "lucide-react";

const LOGO_URL = "/manus-storage/campus-navigator-mark_b66de1a6.png";

export default function NotFound() {
  return (
    <main className="lost-page">
      <div className="lost-paper" />
      <div className="lost-header">
        <a href="/" className="lost-brand"><img src={LOGO_URL} alt="Campus Navigator compass pin" /><span>Campus Navigator</span></a>
        <span className="lost-index">Field note · 404</span>
      </div>
      <section className="lost-card">
        <div className="lost-illustration" aria-hidden="true">
          <div className="lost-coordinate">N 10° 56′ · E 76° 57′</div>
          <svg viewBox="0 0 260 150" role="presentation">
            <path className="lost-route-shadow" d="M24 120 C64 120 54 53 114 69 S159 127 232 32" />
            <path className="lost-route-line" d="M24 120 C64 120 54 53 114 69 S159 127 232 32" />
            <circle className="lost-start" cx="24" cy="120" r="7" />
            <circle className="lost-end" cx="232" cy="32" r="8" />
          </svg>
          <div className="lost-pin"><MapPin size={29} fill="currentColor" /></div>
          <div className="lost-compass"><Compass size={35} /><span>N</span></div>
        </div>
        <div className="lost-copy">
          <span className="eyebrow"><RouteIcon size={13} /> Route note 404</span>
          <h1>This path<br /><em>isn’t on the map.</em></h1>
          <p>We looked along the blue thread, but this page is outside the campus index. Return to the illustrated map and choose a known destination.</p>
          <a className="lost-cta" href="/"><ArrowLeft size={16} /> Back to the campus atlas</a>
        </div>
      </section>
      <p className="lost-footer">If you followed a shared link, the destination may have moved. The campus map is still open.</p>
    </main>
  );
}
