// Field Notes Atlas: tactile map surfaces, ink-blue route thread, asymmetric editorial rail, and purposeful motion.
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { referencePointFromClick } from "@/lib/mapCoordinates";
import {
  Bookmark,
  ChevronRight,
  Clock3,
  Compass,
  Crosshair,
  ExternalLink,
  Footprints,
  Info,
  Layers3,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Menu,
  Minus,
  MousePointer2,
  Navigation,
  PanelLeft,
  Plus,
  Route as RouteIcon,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { MapView } from "@/components/Map";

const CAMPUS_MAP_URL = "/manus-storage/campus-map_7997e293.jpeg";
const GOOGLE_CONTEXT_URL = "/manus-storage/full-campus-road-context_3d6a1486.png";
const LOGO_URL = "/manus-storage/campus-navigator-mark_b66de1a6.png";
const AERIAL_URL = "/manus-storage/campus-navigator-aerial_9063dade.jpg";
const WALK_URL = "/manus-storage/campus-navigator-walk_f35f4910.jpg";
const PAPER_URL = "/manus-storage/campus-navigator-paper_07129b65.jpg";
const GOOGLE_ROUTE_URL =
  "https://www.google.com/maps/dir/Sri+Krishna+Arts+and+Science+College,+Sri+krishna+arts+and+science+college,+BK+Pudur,+Sugunapuram+East,+Coimbatore,+Kuniyamuthur,+Tamil+Nadu+641008/Sri+Krishna+College+of+Engineering+and+Technology+-+SKCET,+BK+Pudur,+Kuniyamuthur,+Tamil+Nadu+641008/@10.9373383,76.9561336,17z/data=!4m13!4m12!1m5!1m1!1s0x3ba85bb248b739a9:0xc8c6366878f5122d!2m2!1d76.9592033!2d10.9379272!1m5!1m1!1s0x3ba85bb22369d571:0x72cc0bed93b5b2b6!2m2!1d76.9522005!2d10.9390304?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D";

const currentPoint = { x: 17.4, y: 14.6 };
const STORAGE_KEY = "campus-navigator-custom-pins";
const CAMPUS_REFERENCE = { lat: 10.9379272, lng: 76.9592033, x: 17.4, y: 14.6 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function screenPointFromGps(latitude: number, longitude: number) {
  return {
    x: clamp(CAMPUS_REFERENCE.x + ((longitude - CAMPUS_REFERENCE.lng) / 0.0032) * 45, 5, 95),
    y: clamp(CAMPUS_REFERENCE.y - ((latitude - CAMPUS_REFERENCE.lat) / 0.0023) * 40, 5, 95),
  };
}

function gpsFromScreenPoint(x: number, y: number) {
  return {
    lat: CAMPUS_REFERENCE.lat - ((y - CAMPUS_REFERENCE.y) / 40) * 0.0023,
    lng: CAMPUS_REFERENCE.lng + ((x - CAMPUS_REFERENCE.x) / 45) * 0.0032,
  };
}

type MapMode = "campus" | "road";
type LocationKind = "building" | "amenity" | "gate" | "parking" | "hostel" | "atm" | "custom";

type LocationItem = {
  id: string;
  name: string;
  shortName: string;
  kind: LocationKind;
  description: string;
  zone: string;
  x: number;
  y: number;
  color: string;
  tags: string[];
  floor?: string;
  databaseId?: number;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
};

type CustomPin = LocationItem & { createdAt: number };

const locations: LocationItem[] = [
  { id: "main-gate", name: "Main Gate 1", shortName: "Main Gate 1", kind: "gate", description: "Primary arrival point on Main Road with direct access to campus security.", zone: "North arrival", x: 79, y: 7, color: "blue", tags: ["entry", "security"] },
  { id: "gate-2", name: "Gate 2", shortName: "Gate 2", kind: "gate", description: "Secondary arrival point beside the bike parking area.", zone: "Northwest arrival", x: 6.5, y: 7, color: "blue", tags: ["entry", "bike"] },
  { id: "bike-parking", name: "Bike Parking", shortName: "Bike Parking", kind: "parking", description: "Visitor-friendly bike parking beside the northwest approach.", zone: "Northwest", x: 32, y: 13.5, color: "orange", tags: ["parking", "bike"] },
  { id: "arts-car-parking", name: "Arts Car Parking", shortName: "Arts Car Parking", kind: "parking", description: "Car parking closest to the Arts side of the campus.", zone: "North", x: 61.5, y: 13.5, color: "orange", tags: ["parking", "car"] },
  { id: "bike-mud", name: "Bike Mud Parking", shortName: "Bike Mud", kind: "parking", description: "Additional two-wheeler parking beside the H Block route.", zone: "West edge", x: 18, y: 30, color: "orange", tags: ["parking", "bike"] },
  { id: "h-block", name: "H. Block", shortName: "H. Block", kind: "building", description: "Academic block on the upper campus spine.", zone: "Upper campus", x: 33, y: 25, color: "blue", tags: ["classrooms", "academic"] },
  { id: "j-block", name: "J. Block", shortName: "J. Block", kind: "building", description: "Academic block beside the library approach.", zone: "Upper campus", x: 56.5, y: 25, color: "blue", tags: ["classrooms", "academic"] },
  { id: "management", name: "Management Block", shortName: "Management", kind: "building", description: "Administration and management offices below H Block.", zone: "Central west", x: 33, y: 36, color: "blue", tags: ["office", "admin"] },
  { id: "library", name: "Library Block", shortName: "Library", kind: "building", description: "Library Block on the central north-south pedestrian lane.", zone: "Central north", x: 68.5, y: 36, color: "green", tags: ["study", "books"] },
  { id: "food-court", name: "Food Court", shortName: "Food Court", kind: "amenity", description: "Large central food court with a direct route from the west parking areas.", zone: "Central west", x: 33, y: 50, color: "yellow", tags: ["food", "break"] },
  { id: "a-block", name: "A Block", shortName: "A Block", kind: "building", description: "Central academic block in the A–D cluster.", zone: "Central", x: 51, y: 48.5, color: "blue", tags: ["classrooms", "academic"] },
  { id: "b-block", name: "B Block", shortName: "B Block", kind: "building", description: "Central academic block beside A Block.", zone: "Central", x: 62, y: 48.5, color: "blue", tags: ["classrooms", "academic"] },
  { id: "c-block", name: "C Block", shortName: "C Block", kind: "building", description: "Lower block in the central A–D teaching cluster.", zone: "Central", x: 51, y: 58, color: "blue", tags: ["classrooms", "academic"] },
  { id: "d-block", name: "D Block", shortName: "D Block", kind: "building", description: "Lower block in the central A–D teaching cluster.", zone: "Central", x: 62, y: 58, color: "blue", tags: ["classrooms", "academic"] },
  { id: "commerce", name: "Commerce Block", shortName: "Commerce", kind: "building", description: "Commerce Block on the east side of the central academic cluster.", zone: "East central", x: 72.5, y: 52, color: "blue", tags: ["classrooms", "commerce"] },
  { id: "catering", name: "Catering Science Block", shortName: "Catering Science", kind: "building", description: "Catering Science Block along the west edge of the lower campus.", zone: "Southwest", x: 17.5, y: 71.5, color: "pink", tags: ["catering", "lab"] },
  { id: "f-block", name: "F. Block", shortName: "F. Block", kind: "building", description: "Southwest academic block near the auditorium approach.", zone: "Lower campus", x: 33, y: 67.5, color: "blue", tags: ["classrooms", "academic"] },
  { id: "e-block", name: "E Block", shortName: "E Block", kind: "building", description: "Lower west academic block.", zone: "Lower campus", x: 27, y: 75, color: "blue", tags: ["classrooms", "academic"] },
  { id: "i-block", name: "I Block", shortName: "I Block", kind: "building", description: "Lower west academic block beside E Block.", zone: "Lower campus", x: 39, y: 75, color: "blue", tags: ["classrooms", "academic"] },
  { id: "auditorium", name: "Open Auditorium", shortName: "Open Auditorium", kind: "amenity", description: "Open-air gathering space at the heart of the lower campus.", zone: "Lower campus", x: 56, y: 74, color: "green", tags: ["events", "gathering"] },
  { id: "n-block", name: "N Block", shortName: "N Block", kind: "building", description: "Destination highlighted in the supplied map route from the northwest start point.", zone: "Southeast", x: 75.5, y: 67.5, color: "blue", tags: ["classrooms", "featured"], floor: "Ground + 2" },
  { id: "cafeteria", name: "Cafeteria", shortName: "Cafeteria", kind: "amenity", description: "Cafeteria beside N Block for a quick meal stop.", zone: "Southeast", x: 75.5, y: 76, color: "yellow", tags: ["food", "break"] },
  { id: "boys-hostel", name: "Boys Hostel", shortName: "Boys Hostel", kind: "hostel", description: "Residential block at the southern campus edge.", zone: "South", x: 23, y: 91, color: "red", tags: ["residence", "hostel"] },
  { id: "krishna-hall", name: "Krishna Hall", shortName: "Krishna Hall", kind: "amenity", description: "Hall and residence landmark near the southern arrival edge.", zone: "South", x: 43, y: 91, color: "blue", tags: ["hall", "residence"] },
  { id: "sbi-atm", name: "SBI ATM", shortName: "SBI ATM", kind: "atm", description: "SBI ATM beside the lower east road.", zone: "South east", x: 78, y: 91, color: "blue", tags: ["cash", "service"] },
  { id: "axis-atm", name: "AXIS Bank ATM", shortName: "AXIS ATM", kind: "atm", description: "AXIS Bank ATM at the far southeast edge.", zone: "South east", x: 91.5, y: 91, color: "blue", tags: ["cash", "service"] },
];

const kindLabel: Record<LocationKind, string> = {
  building: "Building",
  amenity: "Amenity",
  gate: "Gate",
  parking: "Parking",
  hostel: "Residence",
  atm: "Service",
  custom: "Personal pin",
};

function readPins(): CustomPin[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as CustomPin[];
  } catch {
    return [];
  }
}

function formatDistance(location: LocationItem) {
  if (location.id === "n-block") return { distance: "240 m", duration: "4 min" };
  if (location.id === "food-court") return { distance: "150 m", duration: "3 min" };
  if (location.id === "library") return { distance: "370 m", duration: "6 min" };
  if (location.id === "auditorium") return { distance: "460 m", duration: "7 min" };
  const meters = Math.max(80, Math.round(Math.hypot(location.x - currentPoint.x, location.y - currentPoint.y) * 7.6));
  return { distance: `${meters} m`, duration: `${Math.max(2, Math.round(meters / 65))} min` };
}

function routePathFor(location: LocationItem) {
  if (location.id === "n-block") return "M 17.4 14.6 L 31 14.6 L 48 14.6 L 66 14.6 L 79 28 L 79 67";
  if (location.id === "food-court") return "M 17.4 14.6 L 17.4 31 L 24 31 L 24 50 L 33 50";
  if (location.id === "library") return "M 17.4 14.6 L 31 14.6 L 48 14.6 L 66 14.6 L 68.5 36";
  if (location.id === "auditorium") return "M 17.4 14.6 L 31 14.6 L 31 35 L 48 35 L 48 63 L 56 74";
  return `M ${currentPoint.x} ${currentPoint.y} L ${Math.max(currentPoint.x, location.x - 9)} ${currentPoint.y} L ${location.x} ${location.y}`;
}

const SURVEY_LABELS = ["A Block", "B Block", "C Block", "D Block", "E Block", "F Block", "H Block", "J Block", "N Block", "Management Block", "Parking", "Canteen"];

function RoadContextMap({ surveyMode, onSurveyPoint, onCurrentLocation }: { surveyMode: boolean; onSurveyPoint: (point: { lat: number; lng: number }) => void; onCurrentLocation: () => void }) {
  const handleReferenceClick = (event: MouseEvent<HTMLImageElement>) => {
    if (!surveyMode) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    onSurveyPoint(referencePointFromClick(x, y));
    toast.info("Reference point selected. Confirm the details below before saving.");
  };

  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const surveyModeRef = useRef(surveyMode);
  useEffect(() => { surveyModeRef.current = surveyMode; }, [surveyMode]);
  const [mapError, setMapError] = useState(false);

  const handleMapReady = (map: google.maps.Map) => {
    setMapReady(true);
    mapRef.current = map;
    try {
      let surveyMarker: google.maps.Marker | null = null;
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (!event.latLng || !surveyModeRef.current) return;
        const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        surveyMarker?.setMap(null);
        surveyMarker = new google.maps.Marker({ map, position: point, title: "Selected exact field-survey point", animation: google.maps.Animation.DROP });
        onSurveyPoint(point);
      });

      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: { strokeColor: "#164A7B", strokeOpacity: 0.92, strokeWeight: 5 },
      });
      service.route(
        {
          origin: { lat: 10.9379272, lng: 76.9592033 },
          destination: { lat: 10.9390304, lng: 76.9522005 },
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === "OK" && result) renderer.setDirections(result);
        },
      );
    } catch {
      toast.error("The road route could not be loaded. Use the Google Maps handoff below.");
    }
  };

  return (
    <div className="road-map-shell">
      <MapView
        className="road-map"
        initialCenter={{ lat: 10.9373383, lng: 76.9561336 }}
        initialZoom={17}
        onMapReady={handleMapReady}
        onMapError={() => setMapError(true)}
      />
      {mapError && <div className="road-map-fallback"><img src={GOOGLE_CONTEXT_URL} alt="Open-source route reference around Sri Krishna Arts and Science College" onClick={handleReferenceClick} />
<div><span className="eyebrow">Map provider unavailable in preview</span><strong>Use the reference route or open Google Maps</strong><p>GPS recording and exact user-placed pin saving still work. Use the road map as your high-definition field-survey surface.</p>
<a href={GOOGLE_ROUTE_URL} target="_blank" rel="noreferrer">Open route handoff <ExternalLink size={12} /></a></div></div>}
      <div className="road-map-badge">
        <div className="eyebrow"><span className="status-dot" /> High-definition live survey map</div>
        <strong>Arts & Science College → SKCET</strong>
        <span>Walk the road, pin the exact place, and save detailed coordinates.</span>
      </div>
      <div className="road-map-source">
        <span className={mapReady ? "source-live" : "source-pending"} />
        {mapError ? "Reference route fallback" : mapReady ? "Live Google route" : "Loading Google route"}
      </div>
      <div className="road-map-context">
        <img src={GOOGLE_CONTEXT_URL} alt="Google Maps walking route context around the college" />
        <div>
          <span className="eyebrow">Reference layer</span>
          <strong>Krishna College Rd</strong>
          <p>Full-campus context: Sri Krishna Hall, residence area, Administrative Block/SKCET, institute buildings, playgrounds, and SIDCO–Sugunapuram Road.</p>
        </div>
      </div>
      <button className="map-crosshair" onClick={onCurrentLocation} title="Center on my current GPS location" aria-label="Center on my current GPS location"><LocateFixed size={23} /></button>
      {surveyMode && <div className="survey-map-hint"><span className="eyebrow">Field survey mode</span><strong>Click the exact place on the map</strong><span>Then choose the block name and save its real coordinates.</span></div>}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<MapMode>(() => new URLSearchParams(window.location.search).get("layer") === "road" ? "road" : "campus");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("n-block");
  const [pins, setPins] = useState<CustomPin[]>(readPins);
  const [pinMode, setPinMode] = useState(false);
  const [routeActive, setRouteActive] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [railOpen, setRailOpen] = useState(false);
  const [gpsState, setGpsState] = useState<"idle" | "locating" | "located" | "error">("idle");
  const [surveyMode, setSurveyMode] = useState(() => new URLSearchParams(window.location.search).get("survey") === "1");
  const [surveyPoint, setSurveyPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [surveyLabel, setSurveyLabel] = useState(SURVEY_LABELS[0]);
  const [surveyNotes, setSurveyNotes] = useState("");
  const [gpsPoint, setGpsPoint] = useState<{ x: number; y: number; accuracy: number; label: string; latitude: number; longitude: number } | null>(null);
  const { isAuthenticated } = useAuth();
  const recordedPointsQuery = trpc.recordedPoints.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const createRecordedPoint = trpc.recordedPoints.create.useMutation({ onSuccess: () => recordedPointsQuery.refetch() });
  const deleteRecordedPoint = trpc.recordedPoints.delete.useMutation({ onSuccess: () => recordedPointsQuery.refetch() });
  const recordedPins = useMemo<LocationItem[]>(() => (recordedPointsQuery.data ?? []).map((point) => ({
    id: `db-${point.id}`,
    databaseId: point.id,
    name: point.label,
    shortName: point.label,
    kind: "custom",
    description: point.notes || "Field-recorded location saved to the Campus Navigator database.",
    zone: "Database field notes",
    x: screenPointFromGps(point.latitude, point.longitude).x,
    y: screenPointFromGps(point.latitude, point.longitude).y,
    color: "orange",
    tags: ["gps", "database", "recorded"],
    verified: point.category === "verified-campus-point",
    latitude: point.latitude,
    longitude: point.longitude,
  })), [recordedPointsQuery.data]);
  const savedLocations = useMemo(() => [...pins, ...recordedPins], [pins, recordedPins]);
  const allLocations = useMemo(() => [...locations, ...savedLocations], [savedLocations]);
  const selected = allLocations.find((location) => location.id === selectedId) || locations[0];
  const routeMeta = formatDistance(selected);
  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return locations;
    return allLocations.filter((location) =>
      [location.name, location.shortName, location.zone, ...location.tags].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [allLocations, query]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  }, [pins]);

  const selectLocation = (id: string) => {
    setSelectedId(id);
    setRouteActive(true);
    setRailOpen(false);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode) return;
    if ((event.target as HTMLElement).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Number((((event.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const y = Number((((event.clientY - rect.top) / rect.height) * 100).toFixed(2));
    const label = window.prompt("Name this saved pin", "My campus note");
    if (!label?.trim()) return;
    const pin: CustomPin = {
      id: `pin-${Date.now()}`,
      name: label.trim(),
      shortName: label.trim(),
      kind: "custom",
      description: "A personal location saved in this browser.",
      zone: "Personal notes",
      x,
      y,
      color: "orange",
      tags: ["saved", "personal"],
      createdAt: Date.now(),
    };
    setPins((current) => [...current, pin]);
    setSelectedId(pin.id);
    setPinMode(false);
    toast.success("Pin saved to your campus notes.");
  };

  const removePin = (id: string) => {
    const databaseId = savedLocations.find((pin) => pin.id === id)?.databaseId;
    if (databaseId) {
      deleteRecordedPoint.mutate({ id: databaseId }, { onSuccess: () => toast.success("Database field note removed.") });
    } else {
      setPins((current) => current.filter((pin) => pin.id !== id));
      toast.success("Pin removed from this browser.");
    }
    if (selectedId === id) setSelectedId("n-block");
  };

  const resetView = () => {
    setZoom(1);
    setSelectedId("n-block");
    setRouteActive(true);
    setPinMode(false);
    setGpsState("idle");
    setGpsPoint(null);
    toast.success("Campus view reset.");
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGpsState("error");
      toast.error("Browser GPS is not available on this device.");
      return;
    }
    setGpsState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = screenPointFromGps(position.coords.latitude, position.coords.longitude);
        const nearest = locations.reduce((closest, location) => {
          const currentDistance = Math.hypot(location.x - point.x, location.y - point.y);
          const closestDistance = Math.hypot(closest.x - point.x, closest.y - point.y);
          return currentDistance < closestDistance ? location : closest;
        }, locations[0]);
        setGpsPoint({ x: point.x, y: point.y, accuracy: Math.round(position.coords.accuracy), label: `GPS · ${nearest.shortName}`, latitude: position.coords.latitude, longitude: position.coords.longitude });
        setSelectedId(nearest.id);
        setRouteActive(false);
        setMode("campus");
        setGpsState("located");
        toast.success(`GPS found near ${nearest.name}.`);
      },
      () => {
        setGpsState("error");
        toast.error("Location permission was unavailable. You can still place a pin manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const saveSurveyPoint = () => {
    if (!surveyPoint) return;
    if (!isAuthenticated) {
      toast.info("Sign in to save the exact surveyed point to the database.");
      startLogin();
      return;
    }
    createRecordedPoint.mutate({
      label: surveyLabel,
      category: "verified-campus-point",
      latitude: surveyPoint.lat,
      longitude: surveyPoint.lng,
      notes: surveyNotes.trim() || "Exact coordinates selected by the field surveyor on the live map.",
    }, {
      onSuccess: (point) => {
        if (point) setSelectedId(`db-${point.id}`);
        setSurveyPoint(null);
        setSurveyNotes("");
        setSurveyMode(false);
        toast.success(`${surveyLabel} saved with exact map coordinates.`);
      },
      onError: () => toast.error("The surveyed point could not be saved. Please try again."),
    });
  };

  const saveGpsPin = () => {
    if (!gpsPoint) return;
    if (!isAuthenticated) {
      toast.info("Sign in to save this field note to the shared database.");
      startLogin();
      return;
    }
    createRecordedPoint.mutate({
      label: gpsPoint.label,
      category: "gps-field-recording",
      latitude: gpsPoint.latitude,
      longitude: gpsPoint.longitude,
      accuracyMeters: gpsPoint.accuracy,
      notes: `Recorded while walking the Sri Krishna Arts and Science College campus.`,
    }, {
      onSuccess: (point) => {
        if (point) setSelectedId(`db-${point.id}`);
        setRouteActive(false);
        toast.success("Current GPS location saved to the database.");
      },
      onError: () => toast.error("The GPS point could not be saved. Please try again."),
    });
  };

  return (
    <div className="atlas-app">
      <header className="topbar">
        <div className="brand-lockup">
          <img src={LOGO_URL} alt="Campus Navigator compass pin" className="brand-mark" />
          <div>
            <div className="brand-kicker">Sri Krishna Arts and Science College</div>
            <div className="brand-name">Campus Navigator</div>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="open-source-pill"><span className="status-dot" /> Open-source guide</div>
          <button className="icon-button mobile-only" aria-label="Open location list" onClick={() => setRailOpen(true)}><Menu size={18} /></button>
          <a className="topbar-link" href={GOOGLE_ROUTE_URL} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Google Maps</a>
        </div>
      </header>

      <div className="app-layout">
        <aside className={`control-rail ${railOpen ? "rail-open" : ""}`}>
          <div className="rail-mobile-head mobile-only">
            <span className="eyebrow">Field notes</span>
            <button className="icon-button" aria-label="Close location list" onClick={() => setRailOpen(false)}><X size={18} /></button>
          </div>
          <div className="rail-intro">
            <div className="eyebrow">Wayfinding index · 01</div>
            <h1>Find the room.<br /><em>Follow the blue thread.</em></h1>
            <p>Search the illustrated campus map, plot a walking route, or leave a pin for the next visitor.</p>
          </div>

          <div className="search-wrap">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blocks, food, parking..." aria-label="Search campus locations" />
            {query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
            <kbd>⌘ K</kbd>
          </div>

          <div className="rail-section location-section">
            <div className="section-head"><span>Campus index</span><span className="count-badge">{filteredLocations.length}</span></div>
            <div className="location-list">
              {filteredLocations.length === 0 ? (
                <div className="empty-search"><Search size={18} /><span>No matching locations.<br /><small>Try “library” or “food”.</small></span></div>
              ) : filteredLocations.map((location) => (
                <button key={location.id} className={`location-row ${selectedId === location.id ? "is-selected" : ""}`} onClick={() => selectLocation(location.id)}>
                  <span className={`location-swatch swatch-${location.color}`}><MapPin size={14} /></span>
                  <span className="location-copy"><strong>{location.name}</strong><small>{kindLabel[location.kind]} · {location.zone}</small></span>
                  <ChevronRight size={15} className="row-chevron" />
                </button>
              ))}
            </div>
          </div>

                    <div className="rail-section saved-section">
            <div className="section-head"><span><Bookmark size={14} /> Your pins</span><span className="count-badge">{savedLocations.length}</span></div>
            {!isAuthenticated && <button className="login-hint" onClick={startLogin}><LocateFixed size={15} /><span><b>Sign in to save walking records</b><small>GPS points will be stored in your database.</small></span></button>}
            {savedLocations.length === 0 ? (

              <button className="save-hint" onClick={() => setPinMode(true)}><MousePointer2 size={16} /><span>Click <b>Pin a spot</b> to save a note on this map.</span></button>
            ) : savedLocations.map((pin) => (
              <div key={pin.id} className={`saved-row ${selectedId === pin.id ? "is-selected" : ""}`}>
                <button onClick={() => selectLocation(pin.id)}><span className="pin-mini"><MapPin size={13} /></span><span>{pin.name}{pin.databaseId ? " · database" : ""}</span>{pin.verified && <b className="verified-badge">Verified survey</b>}
</button>
                <button className="delete-pin" onClick={() => removePin(pin.id)} aria-label={`Remove ${pin.name}`}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          <div className="rail-footnote">
            <Info size={15} /> <span>Campus map coordinates are a visual guide. Use the road layer for the wider Arts College → SKCET walk.</span>
          </div>
        </aside>

        <main className="map-stage">
          <div className="stage-toolbar">
            <div className="mode-switcher" role="tablist" aria-label="Map layers">
              <button className={mode === "campus" ? "active" : ""} onClick={() => setMode("campus")}><MapIcon size={15} /> Campus map</button>
              <button className={mode === "road" ? "active" : ""} onClick={() => setMode("road")}><Navigation size={15} /> Road context</button>
            </div>
            <div className="toolbar-actions">
              <button className={`tool-button gps-tool ${gpsState === "located" ? "active" : ""}`} onClick={locateMe} disabled={gpsState === "locating"} title="Mark this location with open browser GPS"><LocateFixed size={15} /> {gpsState === "locating" ? "Locating…" : gpsState === "located" ? "GPS found" : "Mark here"}</button>
              <button className={`tool-button ${pinMode || (mode === "road" && surveyMode) ? "active" : ""}`} onClick={() => { if (mode === "road") { setSurveyMode(true); setSurveyPoint(null); } else { setPinMode((current) => !current); setMode("campus"); } }}><MapPin size={15} /> {mode === "road" ? "Pin road point" : pinMode ? "Click map" : "Pin a spot"}</button>
              <button className={`tool-button ${surveyMode ? "active" : ""}`} onClick={() => { setSurveyMode((current) => !current); setMode("road"); setSurveyPoint(null); }}><MousePointer2 size={15} /> {surveyMode ? "Survey on" : "Survey map"}</button>
              <button className="tool-button icon-only" onClick={resetView} aria-label="Reset campus view"><LocateFixed size={16} /></button>
            </div>
          </div>
          {gpsState !== "idle" && <div className={`gps-notice gps-${gpsState}`}><span className="gps-notice-copy"><LocateFixed size={14} /><span>{gpsState === "locating" ? "Reading your device location…" : gpsState === "located" && gpsPoint ? `${gpsPoint.label} · approx. ${gpsPoint.accuracy} m accuracy` : "GPS permission was unavailable. Manual pinning is still ready."}</span></span>{gpsState === "located" && gpsPoint ? <button onClick={saveGpsPin}>{isAuthenticated ? "Mark here & save" : "Sign in & save"}</button> : gpsState === "error" ? <button onClick={locateMe}>Try again</button> : null}</div>}

          <div className="map-frame-wrap">
            {surveyMode && <div className="survey-save-bar"><div><b>{surveyPoint ? "Exact point selected" : "Walk to the location, then click it on the map"}</b><span>{surveyPoint ? `${surveyPoint.lat.toFixed(6)}, ${surveyPoint.lng.toFixed(6)}` : "No guessed markers are used in survey mode."}</span></div>{surveyPoint && <><select value={surveyLabel} onChange={(event) => setSurveyLabel(event.target.value)} aria-label="Campus location name">{SURVEY_LABELS.map((label) => <option key={label}>{label}</option>)}</select><input className="survey-notes-input" value={surveyNotes} onChange={(event) => setSurveyNotes(event.target.value)} placeholder="Details: entrance, floor, landmark…" aria-label="Point details" /><button onClick={saveSurveyPoint} disabled={createRecordedPoint.isPending}>{createRecordedPoint.isPending ? "Saving…" : isAuthenticated ? "Save exact point" : "Sign in & save"}</button>
</>}</div>}
            {mode === "campus" ? (
              <div className={`campus-map-frame ${pinMode ? "pin-mode" : ""}`} onClick={handleMapClick}>
                <div className="map-paper-underlay" style={{ backgroundImage: `url(${PAPER_URL})` }} />
                <div className="map-zoom-layer" style={{ transform: `scale(${zoom})` }}>
                  <img className="campus-map-image" src={CAMPUS_MAP_URL} alt="Illustrated Sri Krishna Arts and Science College campus map" />
                  <div className="map-title-correction">Sri Krishna Arts and Science College — Campus Map</div>
                  {routeActive && (
                    <svg className="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={`Walking route to ${selected.name}`}>
                      <path className="route-shadow" d={routePathFor(selected)} />
                      <path className="route-line" d={routePathFor(selected)} />
                      <circle className="route-start" cx={currentPoint.x} cy={currentPoint.y} r="1.2" />
                      <circle className="route-end" cx={selected.x} cy={selected.y} r="1.6" />
                    </svg>
                  )}
                  <div className="you-are-here" style={{ left: `${gpsPoint?.x ?? currentPoint.x}%`, top: `${gpsPoint?.y ?? currentPoint.y}%` }}><span /><b>{gpsPoint ? "GPS location" : "You are here"}</b></div>
                  {gpsPoint && <div className="gps-marker" style={{ left: `${gpsPoint.x}%`, top: `${gpsPoint.y}%` }}><span><LocateFixed size={14} /></span><b>{gpsPoint.label}</b></div>}
                  {allLocations.map((location) => (
                    <button key={location.id} className={`map-marker marker-${location.color} ${selectedId === location.id ? "selected" : ""} ${location.kind === "custom" ? "custom-marker" : ""}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} onClick={(event) => { event.stopPropagation(); selectLocation(location.id); }} aria-label={`Select ${location.name}`}>
                      <span className="marker-dot"><MapPin size={14} fill="currentColor" /></span>
                      {selectedId === location.id && <span className="marker-label">{location.shortName}</span>}
                    </button>
                  ))}
                </div>
                {pinMode && <div className="pin-mode-hint"><MousePointer2 size={15} /> Click anywhere on the map to drop a pin</div>}
                <div className="map-compass"><Compass size={23} /><span>N</span></div>
                <div className="map-controls">
                  <button onClick={() => setZoom((value) => Math.min(1.32, Number((value + 0.08).toFixed(2))))} aria-label="Zoom in"><Plus size={17} /></button>
                  <button onClick={() => setZoom((value) => Math.max(1, Number((value - 0.08).toFixed(2))))} aria-label="Zoom out"><Minus size={17} /></button>
                  <span className="zoom-readout">{Math.round(zoom * 100)}%</span>
                </div>
              </div>
            ) :               <RoadContextMap surveyMode={surveyMode} onSurveyPoint={setSurveyPoint} onCurrentLocation={locateMe} />
}

            <div className="map-meta-card">
              <div className="eyebrow"><Layers3 size={13} /> {mode === "campus" ? "Full campus overview" : "High-definition live road layer"}</div>
              <strong>{mode === "campus" ? "Sri Krishna Arts and Science College" : "Pin the exact road location"}</strong>
              <span>{mode === "campus" ? "Yellow campus area · buildings · amenities · parking" : "Full campus context · click the road to place a detailed field-survey point"}</span>
            </div>
          </div>

          <div className="route-dock">
            <div className="route-dock-primary">
              <div className={`route-icon route-${selected.color}`}><RouteIcon size={18} /></div>
              <div className="route-dock-copy"><span className="eyebrow">Selected destination</span><strong>{selected.name}</strong><span>{selected.description}</span></div>
            </div>
            <div className="route-stats"><div><Footprints size={15} /><strong>{routeMeta.distance}</strong><span>from start</span></div><div><Clock3 size={15} /><strong>{routeMeta.duration}</strong><span>on foot</span></div></div>
            <div className="route-actions">
              <button className={`route-button ${routeActive ? "route-active" : ""}`} onClick={() => setRouteActive((current) => !current)}><RouteIcon size={16} /> {routeActive ? "Route plotted" : "Plot route"}</button>
              <a className="route-link" href={GOOGLE_ROUTE_URL} target="_blank" rel="noreferrer">Open Maps <ExternalLink size={14} /></a>
            </div>
          </div>

          <section className="context-strip">
            <div className="context-image"><img src={AERIAL_URL} alt="Aerial view of a leafy college campus" /></div>
            <div className="context-copy"><span className="eyebrow">Read the campus</span><h2>One map, two scales.</h2><p>Use the illustrated layer for the buildings inside the gates. Switch to Road context when you are walking between institutions.</p><button className="text-button" onClick={() => setMode(mode === "campus" ? "road" : "campus")}>{mode === "campus" ? "See surrounding roads" : "Return to campus map"} <ChevronRight size={15} /></button></div>
            <div className="context-image context-image-small"><img src={WALK_URL} alt="Student walking on a shaded campus path" /></div>
          </section>
        </main>
      </div>

      <footer className="app-footer"><span>Campus Navigator · v0.1 field edition</span><span>Open-source campus mapping project · <a href="https://github.com/sukhee-2626/CAMPUS-NAV" target="_blank" rel="noreferrer">View repository</a></span></footer>
      <button className="mobile-rail-trigger mobile-only" onClick={() => setRailOpen(true)}><PanelLeft size={16} /> Locations <span>{filteredLocations.length}</span></button>
    </div>
  );
}
