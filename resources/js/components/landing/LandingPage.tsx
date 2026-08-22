import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Globe,
  Smartphone,
  Database,
  LayoutDashboard,
  LifeBuoy,
  Cloud,
  Shield,
  Sparkles,
  Users,
  FileText,
  Headphones,
  Layers,
  MessageSquare,
  PhoneCall,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Waves as WavesIcon,
  Quote,
  Rocket,
  Award,
  Zap,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Search,
  Lightbulb,
  Palette,
  Code2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  Tag,
  Pin,
  LinkedinIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { useLandingData, TestimonialItem } from "@/hooks/useLandingData";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogContentFullscreen,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import p5 from "@/assets/portfolio-5.jpg";
import p6 from "@/assets/portfolio-6.jpg";

import laptopImg from "@/assets/Hero/Laptop Image.svg";
import robotImg from "@/assets/Hero/Robot.svg";
import logo from "../../assets/logo/LOGO PUTIH.png";

/* ────────────────────────────────────────────────────────────────
 *  Reusable primitives
 * ──────────────────────────────────────────────────────────────── */

function WaveDivider({
  flip = false,
  from = "var(--surface)",
  to = "var(--background)",
}: {
  flip?: boolean;
  from?: string;
  to?: string;
}) {
  return (
    <div
      className="relative -mt-px h-16 w-full sm:h-24"
      style={{ background: from, transform: flip ? "scaleY(-1)" : undefined }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M0,64 C240,120 480,0 720,40 C960,80 1200,120 1440,56 L1440,120 L0,120 Z"
          style={{ fill: to }}
        />
        <path
          d="M0,80 C240,40 480,110 720,70 C960,30 1200,80 1440,72 L1440,120 L0,120 Z"
          style={{ fill: to, opacity: 0.55 }}
        />
      </svg>
    </div>
  );
}

function OceanBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 gradient-ocean" />
      <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[oklch(0.78_0.14_195/0.35)] blur-3xl" />
      <div className="absolute -right-32 top-40 h-[460px] w-[460px] rounded-full bg-[oklch(0.55_0.14_235/0.35)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-background" />
      {/* particles */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(1 0 0 / 0.6) 1px, transparent 1.5px), radial-gradient(circle at 70% 80%, oklch(1 0 0 / 0.5) 1px, transparent 1.5px), radial-gradient(circle at 40% 70%, oklch(0.78 0.14 195 / 0.6) 1px, transparent 1.5px)",
          backgroundSize: "220px 220px, 340px 340px, 180px 180px",
        }}
      />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
  center = true,
  invert = false,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
  invert?: boolean;
}) {
  return (
    <div className={`max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl ${center ? "mx-auto text-center" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className={`mt-4 font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl ${invert ? "text-primary-foreground" : "text-primary"
          }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${invert ? "text-primary-foreground/75" : "text-muted-foreground"
            }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("id-ID") + suffix);
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

interface SectionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SectionPagination({ currentPage, totalPages, onPageChange }: SectionPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 rounded-full border-primary/20 bg-white/80 px-4 text-xs font-semibold text-primary hover:bg-white disabled:opacity-40 cursor-pointer shadow-sm"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Sebelumnya
      </Button>

      <div className="flex flex-wrap items-center gap-1.5 px-2">
        {getPageNumbers().map((page, idx) =>
          typeof page === "number" ? (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 rounded-full text-xs font-bold transition-all cursor-pointer ${currentPage === page
                ? "bg-[#004AAD] text-white shadow-md scale-105"
                : "border border-primary/15 bg-white/70 text-primary/70 hover:bg-white hover:text-primary"
                }`}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground select-none">
              ...
            </span>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 rounded-full border-primary/20 bg-white/80 px-4 text-xs font-semibold text-primary hover:bg-white disabled:opacity-40 cursor-pointer shadow-sm"
      >
        Selanjutnya
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function BrandMark() {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <img src="/storage/images/logo.png" alt="Asta Digital Agency" className="h-9 w-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
      <div className="leading-tight">
        <div className="font-display text-base font-bold text-primary">ASTA Digital Agency</div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Digital Agency & IT Solutions
        </div>
      </div>
    </a>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Navbar
 * ──────────────────────────────────────────────────────────────── */

/* Local Navbar replaced by imported Navbar component */

// navLinks still used by Footer component
const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/#portofolio", label: "Portofolio" },
  { href: "/#proses", label: "Proses" },
  { href: "/#kontak", label: "Kontak" },
];


/* ────────────────────────────────────────────────────────────────
 *  Hero
 * ──────────────────────────────────────────────────────────────── */

const heroStats = [
  { value: 20, suffix: "+", label: "PROYEK" },
  { value: 8, suffix: "+", label: "KLIEN" },
  { value: 4, suffix: "+", label: "TAHUN" },
  { value: 98, suffix: "%", label: "KEPUASAN" },
];

interface ClientItem {
  id: number;
  name: string;
  image?: string;
}

const defaultClientNames = ["Kominfo", "BUMD Jaya", "SMAN 1", "Koperasi Mitra", "PT Andalan", "Yayasan Cipta"];

function Hero() {
  const { data: landingData } = useLandingData();
  const clientsList = (landingData?.clients && landingData.clients.length > 0) ? landingData.clients : [];

  return (
    <section id="top" className="relative overflow-hidden pt-26 pb-6 sm:pt-26 lg:pb-6">
      <OceanBackdrop />

      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <Eyebrow>Agensi Digital Premium · Est. 2022</Eyebrow>
            <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-primary sm:text-6xl lg:text-[4.25rem] 2xl:text-[4.75rem] 3xl:text-[5.25rem]">
              Membangun{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-secondary via-gradient-accent to-primary bg-clip-text text-transparent">
                  pengalaman digital
                </span>
                <svg
                  className="absolute -bottom-2 left-0 h-2 w-full text-accent/70"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q 50 -2 100 4 T 200 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              terbaik untuk bisnis modern.
            </h1>
            <p className="mt-6 max-w-xl xl:max-w-2xl 2xl:max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg xl:text-xl">
              Asta Digital Agency adalah studio teknologi yang membangun website,
              aplikasi, dan sistem informasi terbaik — dirancang dengan standar enterprise
              dan desain yang elegan serta imersif.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full gradient-accent px-6 text-accent-foreground shadow-glass hover:opacity-95"
              >
                <a href="#kontak" className="text-white">
                  Mulai Proyek <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-primary/20 bg-white/70 px-6 text-primary backdrop-blur hover:bg-white"
              >
                <a href="#portofolio">Lihat Portofolio</a>
              </Button>
            </div>

            {/* Floating trust chips */}
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-medium text-primary/70">
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft">
                <Shield className="h-3.5 w-3.5 text-success" /> Keamanan Siap terjamin
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft">
                <Award className="h-3.5 w-3.5 text-secondary" /> Kualitas Penghargaan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 shadow-soft">
                <Zap className="h-3.5 w-3.5 text-accent" /> Fast & Scalable
              </span>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[520px] xl:max-w-[600px] 2xl:max-w-[680px] 3xl:max-w-[760px]">
              {/* mesh orb */}
              <div className="absolute inset-0 rounded-[42%_58%_45%_55%/55%_40%_60%_45%] gradient-mesh opacity-90 blur-[2px]" />
              <div className="absolute inset-6 rounded-[52%_48%_40%_60%/45%_55%_45%_55%] gradient-hero shadow-glass" />
              {/* animated ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute inset-2 rounded-full border border-dashed border-accent/40" />
              </motion.div>

              {/* Main Visual Content: Laptop Base + Robot Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-2">
                <div className="relative w-full h-full flex items-center justify-center overflow-visible">

                  {/* Laptop Asset */}
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    <img
                      src={laptopImg}
                      alt="Laptop ASTA Digital Agency"
                      className="w-full h-full object-contain drop-shadow-2xl select-none scale-[2.8] sm:scale-[2.8] lg:scale-[2.9] translate-x-[87.3%] translate-y-[60.15%]"
                    />
                  </motion.div>

                  {/* Robot Asset (Floating in front & aligned on laptop screen) */}
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      rotate: [-0.8, 0.8, -0.8]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <img
                      src={robotImg}
                      alt="3D Robot ASTA Digital Agency"
                      className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] select-none scale-[2.6] sm:scale-[2.5] lg:scale-[2.7] translate-x-[75.9%] translate-y-[40.5%]"
                    />
                  </motion.div>

                </div>
              </div>

              {/* floating stat cards */}
              {heroStats.map((s, i) => {
                const pos = [
                  "left-0 top-6",
                  "right-0 top-16",
                  "left-4 bottom-10",
                  "right-6 bottom-0",
                ][i];
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className={`absolute ${pos}`}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                      className="rounded-2xl glass px-4 py-3 shadow-glass"
                    >
                      <div className="font-display text-2xl font-bold text-primary">
                        <Counter to={s.value} suffix={s.suffix} />
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Client strip */}
        <div className="mt-6 rounded-2xl glass px-6 py-5 shadow-soft overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground shrink-0 text-center lg:text-left z-10">
              Dipercaya oleh berbagai organisasi terkemuka
            </div>

            <div className="relative w-full lg:flex-1 overflow-hidden">
              {/* Soft fade gradients on edges */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background/80 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background/80 to-transparent" />

              {(() => {
                const rawList =
                  clientsList.length > 0
                    ? clientsList
                    : defaultClientNames.map((n, i) => ({ id: i, name: n, image: undefined }));

                const renderTrack = (prefix: string) => (
                  <div className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12 shrink-0">
                    {[...rawList, ...rawList].map((client, idx) => (
                      <div
                        key={`${prefix}-${client.id}-${idx}`}
                        className="flex items-center justify-center h-10 px-3 shrink-0"
                        title={client.name}
                      >
                        {client.image ? (
                          <img
                            src={client.image}
                            alt={client.name}
                            className="max-h-10 max-w-[120px] object-contain filter opacity-70 hover:opacity-100 transition-all duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLElement;
                              target.style.display = "none";
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = "block";
                              }
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-center text-sm font-bold tracking-tight text-primary/70 whitespace-nowrap ${
                            client.image ? "hidden" : "block"
                          }`}
                        >
                          {client.name}
                        </span>
                      </div>
                    ))}
                  </div>
                );

                return (
                  <motion.div
                    className="flex items-center w-max will-change-transform"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                      x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: Math.max(20, rawList.length * 4),
                        ease: "linear",
                      },
                    }}
                  >
                    {renderTrack("track-1")}
                    {renderTrack("track-2")}
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  About
 * ──────────────────────────────────────────────────────────────── */

interface DiscoverListItem {
  id: number;
  description: string;
}

interface DiscoverData {
  id: number;
  name: string;
  category?: string;
  date?: string;
  year?: string;
  short_description?: string;
  show_name?: number;
  is_pinned?: boolean;
  logo?: string;
  image?: string;
  DiscoverLists?: DiscoverListItem[];
}

const defaultDiscovers: DiscoverData[] = [
  {
    id: 1,
    name: "Kenapa Bisnis Anda Membutuhkan Sistem Digital Terintegrasi?",
    category: "Wawasan Teknologi",
    date: "19 Agustus 2026 • 5 mnt baca",
    short_description: "Pelajari bagaimana sistem digital terintegrasi dapat membantu meningkatkan efisiensi, mengurangi pekerjaan manual, dan mendukung pertumbuhan bisnis.",
    show_name: 1,
    image: p1,
    DiscoverLists: [
      { id: 1, description: "Analisis kebutuhan sistem gratis" },
      { id: 2, description: "Rekomendasi teknologi & keamanan" },
      { id: 3, description: "Estimasi waktu & timeline projek" },
    ],
  },
  {
    id: 2,
    name: "ERP: Solusi untuk Mengelola Bisnis dalam Satu Sistem",
    category: "Transformasi Digital",
    date: "19 Agustus 2026 • 5 mnt baca",
    short_description: "Kenali bagaimana ERP mengintegrasikan berbagai proses bisnis mulai dari keuangan, SDM, inventori, hingga operasional.",
    show_name: 1,
    image: p2,
    DiscoverLists: [
      { id: 4, description: "Standardisasi ISO-ready security" },
      { id: 5, description: "Integrasi database terpusat" },
      { id: 6, description: "Pendampingan & training SDM" },
    ],
  },
  {
    id: 3,
    name: "Website Saja Tidak Cukup, Saatnya Bisnis Beralih ke Custom System",
    category: "Solusi IT",
    date: "19 Agustus 2026 • 5 mnt baca",
    short_description: "Setiap bisnis memiliki kebutuhan yang berbeda. Temukan kapan bisnis membutuhkan sistem yang dirancang khusus sesuai alur kerja.",
    show_name: 1,
    image: p3,
    DiscoverLists: [
      { id: 7, description: "SLA garansi & 24/7 maintenance" },
      { id: 8, description: "Kode bersih & arsitektur scalable" },
      { id: 9, description: "Transparansi progress per milestone" },
    ],
  },
];

const values = [
  { icon: Shield, title: "Profesional", text: "Standar pengerjaan dan pengiriman setara enterprise." },
  { icon: FileText, title: "Transparan", text: "Komunikasi jelas, milestone terukur, dan dokumentasi lengkap." },
  { icon: Sparkles, title: "Inovatif", text: "Teknologi modern dan praktik terbaik industri." },
  { icon: Users, title: "Mengutamakan Manusia", text: "Dirancang untuk kebutuhan nyata manusia di setiap konteks." },
];

function About({ discoversList = defaultDiscovers }: { discoversList?: DiscoverData[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTimelineImage, setSelectedTimelineImage] = useState<DiscoverData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef<{ cx: number; cy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyTransform = (z: number, px: number, py: number) => {
    if (imgRef.current) {
      imgRef.current.style.transform = `scale(${z}) translate(${px / z}px, ${py / z}px)`;
    }
  };

  const handleZoomChange = (newZ: number) => {
    const clamped = Math.max(1, Math.min(4, newZ));
    if (clamped === 1) { posRef.current = { x: 0, y: 0 }; }
    zoomRef.current = clamped;
    setZoomLevel(clamped);
    applyTransform(clamped, posRef.current.x, posRef.current.y);
  };

  const handleZoomIn = () => handleZoomChange(zoomRef.current + 0.5);
  const handleZoomOut = () => handleZoomChange(zoomRef.current - 0.5);
  const handleZoomReset = () => handleZoomChange(1);

  /* ── Mouse drag (uses ref — no re-render on every move) ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomRef.current <= 1) return;
    e.preventDefault();
    dragOrigin.current = { cx: e.clientX - posRef.current.x, cy: e.clientY - posRef.current.y };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragOrigin.current) return;
    posRef.current = { x: e.clientX - dragOrigin.current.cx, y: e.clientY - dragOrigin.current.cy };
    applyTransform(zoomRef.current, posRef.current.x, posRef.current.y);
  };
  const handleMouseUp = () => {
    dragOrigin.current = null;
    if (containerRef.current) containerRef.current.style.cursor = zoomRef.current > 1 ? "grab" : "default";
  };

  /* ── Touch drag ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomRef.current <= 1 || e.touches.length !== 1) return;
    dragOrigin.current = { cx: e.touches[0].clientX - posRef.current.x, cy: e.touches[0].clientY - posRef.current.y };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragOrigin.current || e.touches.length !== 1) return;
    e.preventDefault();
    posRef.current = { x: e.touches[0].clientX - dragOrigin.current.cx, y: e.touches[0].clientY - dragOrigin.current.cy };
    applyTransform(zoomRef.current, posRef.current.x, posRef.current.y);
  };
  const handleTouchEnd = () => { dragOrigin.current = null; };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedTimelineImage(null);
      zoomRef.current = 1;
      posRef.current = { x: 0, y: 0 };
      setZoomLevel(1);
    }
  };

  const timelineItems = discoversList && discoversList.length > 0 ? discoversList : defaultDiscovers;
  const activeItem = timelineItems[selectedIndex] || timelineItems[0];

  useEffect(() => {
    if (timelineItems.length <= 1) return;

    const interval = window.setInterval(() => {
      setSelectedIndex((currentIndex) => (currentIndex + 1) % timelineItems.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [timelineItems.length]);

  const scrollToDiscover = () => {
    const elem = document.getElementById("discover");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="tentang" className="relative overflow-hidden py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid items-start gap-14 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-5"
          >
            <SectionHeading
              center={false}
              eyebrow="Tentang Kami"
              title="Studio teknologi untuk transformasi enterprise."
              desc="Kami memadukan kepercayaan dan ketelitian setara instansi pemerintah dengan kreativitas agensi digital premium — dirancang untuk skala besar, diciptakan untuk kepuasan."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 rounded-2xl glass p-5 shadow-soft">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Visi
                </div>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80">
                  Menjadi mitra digital paling terpercaya di Indonesia.
                </p>
              </div>
              <div className="min-w-0 rounded-2xl glass p-5 shadow-soft">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Misi
                </div>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground/80">
                  Membangun produk yang aman, elegan, dan modern yang menciptakan dampak nyata.
                </p>
              </div>
            </div>

            <div className="mt-6 min-w-0 rounded-2xl glass p-6 shadow-glass">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Linimasa
              </div>
              <ul className="mt-4 space-y-3">
                {timelineItems.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <li
                      key={item.id || idx}
                      onClick={() => {
                        setSelectedIndex(idx);
                        scrollToDiscover();
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${isSelected
                        ? "bg-white/95 shadow-sm border border-secondary/30 scale-[1.02]"
                        : "hover:bg-white/60"
                        }`}
                    >
                      <span className="grid text-white h-8 px-3 shrink-0 place-items-center rounded-lg gradient-accent text-xs font-bold text-accent-foreground shadow-soft">
                        {item.year || "2026/01"}
                      </span>
                      <span className="min-w-0 break-words text-sm font-semibold text-foreground/90 line-clamp-1">
                        {item.is_pinned && (
                          <Pin className="mr-1 inline-block h-3.5 w-3.5 fill-[#004AAD] text-[#004AAD]" aria-label="Pinned" />
                        )}
                        {item.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>

          <div className="min-w-0 lg:col-span-7">
            <div className="-mx-4 overflow-hidden sm:mx-0 sm:overflow-visible">
              <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-1 sm:scroll-pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {values.map((v, i) => (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative w-[78%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-7 shadow-glass backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:w-auto sm:shrink ${i % 3 === 0 ? "rounded-tl-[8px]" : ""
                      } ${i % 3 === 1 ? "rounded-br-[8px]" : ""}`}
                  >
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="relative grid h-12 w-12 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-soft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <v.icon className="h-5 w-5 text-white" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-bold text-primary">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Large image connected to selected timeline/discover event */}
            <div
              onClick={() => setSelectedTimelineImage(activeItem)}
              className="group relative mt-6 overflow-hidden rounded-[32px] border border-white/60 shadow-glass cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
            >
              <img
                src={activeItem.image || p3}
                alt={activeItem.name}
                className="h-64 w-full object-cover sm:h-80 transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-primary-foreground">
                <div>
                  {activeItem.year && (
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-cyan-300">
                      {activeItem.year}
                    </div>
                  )}
                  <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {activeItem.name}
                  </div>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full glass-dark text-white transition-all duration-300 group-hover:bg-[#004AAD] group-hover:scale-110">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Timeline News Image Dialog Modal — Full Image + Zoom */}
      <Dialog open={!!selectedTimelineImage} onOpenChange={handleOpenChange}>
        <DialogContentFullscreen>
          {selectedTimelineImage && (
            <>
              {/* ── Top bar: nama & tahun ── */}
              <div className="flex items-center justify-between gap-2 px-4 py-3 bg-black/95 border-b border-white/10 shrink-0 z-10">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedTimelineImage.year && (
                    <span className="flex items-center gap-1 shrink-0 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                      <Calendar className="h-3 w-3" />
                      {selectedTimelineImage.year}
                    </span>
                  )}
                  <h2 className="text-sm font-bold text-white truncate">
                    {selectedTimelineImage.name}
                  </h2>
                </div>
                {/* Desktop zoom controls */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button onClick={handleZoomOut} disabled={zoomLevel <= 1}
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Zoom Out">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-xs font-mono text-white/50">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={handleZoomIn} disabled={zoomLevel >= 4}
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Zoom In">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button onClick={handleZoomReset} disabled={zoomLevel === 1}
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Reset">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Image viewer (flex-1 = fills remaining height) ── */}
              <div
                ref={containerRef}
                className="relative flex-1 overflow-hidden bg-gray-950 select-none"
                style={{ cursor: zoomLevel > 1 ? "grab" : "default" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  ref={imgRef}
                  src={selectedTimelineImage.image || p3}
                  alt={selectedTimelineImage.name}
                  draggable={false}
                  className="h-full w-full object-contain"
                  style={{ transformOrigin: "center center" }}
                />

                {/* Mobile floating zoom buttons */}
                <div className="sm:hidden absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                  <button onClick={handleZoomIn} disabled={zoomLevel >= 4}
                    className="grid h-11 w-11 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg active:scale-95 disabled:opacity-30 transition-all">
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  {zoomLevel > 1 && (
                    <button onClick={handleZoomReset}
                      className="grid h-11 w-11 place-items-center rounded-full bg-cyan-500/80 backdrop-blur-md text-white border border-cyan-400/30 shadow-lg active:scale-95 transition-all">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={handleZoomOut} disabled={zoomLevel <= 1}
                    className="grid h-11 w-11 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg active:scale-95 disabled:opacity-30 transition-all">
                    <ZoomOut className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile zoom percent badge */}
                {zoomLevel > 1 && (
                  <div className="sm:hidden absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-white/70 pointer-events-none">
                    {Math.round(zoomLevel * 100)}%
                  </div>
                )}
              </div>

              {/* ── Bottom bar: nama & tanggal ── */}
              <div className="shrink-0 px-4 py-3 bg-black/95 border-t border-white/10 flex items-center gap-3 z-10">
                <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="text-white text-sm font-semibold flex-1 min-w-0 truncate">
                  {selectedTimelineImage.name}
                </span>
                {selectedTimelineImage.year && (
                  <span className="text-white/40 text-xs font-mono shrink-0">{selectedTimelineImage.year}</span>
                )}
              </div>
            </>
          )}
        </DialogContentFullscreen>
      </Dialog>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Services (dynamic from Filament API with Detail Modal)
 * ──────────────────────────────────────────────────────────────── */

interface ServiceListMainItem {
  id: number;
  description: string;
}

interface ServiceData {
  id: number | string;
  name: string;
  show_name?: number;
  header?: string;
  description?: string;
  short_description?: string;
  logo?: string;
  image?: string | string[];
  serviceListMains?: ServiceListMainItem[];
  span?: string;
}

function getServiceImages(image?: string | string[]): string[] {
  if (!image) return [];
  return (Array.isArray(image) ? image : [image]).filter(Boolean);
}

const defaultServicesData: ServiceData[] = [
  { id: 1, name: "Website & Portal", header: "Situs & Portal Publik Aksesibilitas Tinggi", short_description: "Situs institusional dan portal pemasaran dengan aksesibilitas tinggi.", description: "Pengembangan portal informasi resmi instansi pemerintah, BUMD, dan perusahaan dengan standar keamanan tinggi.", span: "lg:col-span-3" },
  { id: 2, name: "Aplikasi Mobile", header: "Aplikasi Mobile Performa Tinggi", short_description: "Aplikasi iOS & Android berkualitas native untuk layanan publik dan bisnis.", description: "Aplikasi Android & iOS performa tinggi untuk kemudahan akses layanan masyarakat.", span: "lg:col-span-3" },
  { id: 3, name: "Sistem Informasi", header: "Sistem Informasi Manajemen Terpadu", short_description: "SIM, ERP, dan platform internal yang disesuaikan dengan alur kerja Anda.", description: "Pengembangan SIM, ERP, dan platform internal yang disesuaikan dengan alur kerja organisasi.", span: "lg:col-span-2" },
  { id: 4, name: "Dashboard & Data", header: "Visualisasi & Analitika Data Real-Time", short_description: "Analitik real-time dan visualisasi pendukung keputusan.", description: "Dashboard analitik terpusat untuk membantu pengambilan keputusan strategis.", span: "lg:col-span-2" },
  { id: 5, name: "Cloud & Hosting", header: "Infrastruktur Cloud Scalable & Safe", short_description: "Infrastruktur cloud terkelola yang berkembang sesuai pertumbuhan Anda.", description: "Layanan infrastruktur cloud terkelola dengan jaminan uptime dan enkripsi data.", span: "lg:col-span-2" },
];

const SERVICES_PER_PAGE = 5;

function Services() {
  const { data: landingData } = useLandingData();
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [serviceImageIndex, setServiceImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setServiceImageIndex(0);
  }, [selectedService?.id]);

  const spans = [
    "lg:col-span-3",
    "lg:col-span-3",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
  ];

  const servicesList: ServiceData[] = (landingData?.services && landingData.services.length > 0)
    ? landingData.services.map((s: any, i: number) => ({
      ...s,
      span: spans[i % spans.length],
    }))
    : defaultServicesData;

  const totalPages = Math.ceil(servicesList.length / SERVICES_PER_PAGE);
  const paginatedServices = servicesList.slice(
    (currentPage - 1) * SERVICES_PER_PAGE,
    currentPage * SERVICES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} id="layanan" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-70" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow="Layanan"
            title="Kapabilitas digital menyeluruh."
            desc="Layanan teknologi dan transformasi digital terpadu untuk kebutuhan instansi dan bisnis Anda."
          />
        </motion.div>

        <div className="-mx-4 mt-12 overflow-hidden sm:mx-0 sm:overflow-visible">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:auto-rows-[minmax(220px,auto)] sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-2 sm:scroll-pl-0 lg:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedServices.map((s, i) => {
              const globalIndex = (currentPage - 1) * SERVICES_PER_PAGE + i;
              return (
                <motion.div
                  key={s.id || i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedService(s)}
                  className={`${s.span} group relative w-[80%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-7 shadow-glass backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 cursor-pointer sm:w-auto sm:shrink`}
                >
                  {/* gradient border wash */}
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-accent/20 via-transparent to-secondary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      {s.logo ? (
                        <img src={s.logo} alt={s.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <motion.span
                          whileHover={{ rotate: -8, scale: 1.08 }}
                          className="grid h-14 w-14 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-glass"
                        >
                          <Globe className="h-6 w-6 text-white" />
                        </motion.span>
                      )}
                      <span className="rounded-full border border-primary/10 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/60">
                        {globalIndex + 1 < 10 ? `0${globalIndex + 1}` : globalIndex + 1}
                      </span>
                    </div>
                    {s.show_name !== 0 && (
                      <h3 className="mt-5 font-display text-xl font-bold text-primary group-hover:text-[#004AAD] transition-colors">
                        {s.name}
                      </h3>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {s.short_description || s.header || "Solusi produk dan layanan unggulan Asta Digital."}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(s);
                      }}
                      className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-semibold text-secondary transition-colors hover:text-accent cursor-pointer"
                    >
                      Pelajari Selengkapnya
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <SectionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Service Detail Dialog / Modal */}
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent className="w-[92vw] sm:w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-0 border border-gray-100 shadow-2xl">
            {selectedService && (
              <div className="flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header Image or Banner */}
                <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-[#004AAD] flex items-center justify-center shrink-0">
                  {getServiceImages(selectedService.image).length > 0 ? (
                    <img
                      src={getServiceImages(selectedService.image)[serviceImageIndex]}
                      alt={selectedService.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] via-[#052848] to-[#02182d] p-8 flex flex-col justify-end">
                      {selectedService.logo && (
                        <img src={selectedService.logo} alt={selectedService.name} className="w-16 h-16 object-contain mb-4" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {getServiceImages(selectedService.image).length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Gambar sebelumnya"
                        onClick={() => {
                          const images = getServiceImages(selectedService.image);
                          setServiceImageIndex((index) => (index - 1 + images.length) % images.length);
                        }}
                        className="absolute left-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Gambar berikutnya"
                        onClick={() => {
                          const images = getServiceImages(selectedService.image);
                          setServiceImageIndex((index) => (index + 1) % images.length);
                        }}
                        className="absolute right-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {getServiceImages(selectedService.image).map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Tampilkan gambar ${index + 1}`}
                            onClick={() => setServiceImageIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${index === serviceImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-sm">
                        Layanan Asta Digital
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                        {selectedService.name}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                  {selectedService.header && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-l-4 border-[#004AAD] pl-3">
                        {selectedService.header}
                      </h3>
                    </div>
                  )}

                  {selectedService.description && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD] mb-2">
                        Deskripsi Layanan
                      </h4>
                      <div
                        className="text-gray-700 text-base leading-relaxed space-y-3 prose prose-blue max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedService.description }}
                      />
                    </div>
                  )}

                  {/* Service List Mains (Bullet Points) */}
                  {selectedService.serviceListMains && selectedService.serviceListMains.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD] mb-3">
                        Fitur & Keunggulan Layanan
                      </h4>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {selectedService.serviceListMains.map((item) => (
                          <li key={item.id} className="flex items-start gap-2.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100/60 text-xs font-medium text-gray-800">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#004AAD] mt-0.5" />
                            <span>{item.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Tertarik dengan layanan {selectedService.name}?</p>
                      <p className="text-sm font-bold text-gray-900">Konsultasikan kebutuhan Anda secara gratis dengan tim kami.</p>
                    </div>
                    <Button
                      asChild
                      onClick={() => setSelectedService(null)}
                      className="rounded-full bg-[#004AAD] text-white hover:bg-blue-800 px-6 py-3 font-semibold shadow-md"
                    >
                      <a href="#kontak">
                        Konsultasi Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Portfolio (dynamic from Filament API with Detail Modal)
 * ──────────────────────────────────────────────────────────────── */

interface PortfolioProject {
  id: string | number;
  img: string;
  title: string;
  category: string;
  type: string;
  description: string;
  span: string;
  demo_url?: string;
}

const defaultProjects: PortfolioProject[] = [
  { id: "p1", img: p1, title: "Portal Kominfo", category: "Institutional", type: "desktop", description: "Pengembangan portal informasi resmi instansi pemerintah dengan standar keamanan dan aksesibilitas tinggi.", span: "lg:col-span-2 lg:row-span-2" },
  { id: "p2", img: p2, title: "Layanan Publik App", category: "Mobile", type: "mobile", description: "Aplikasi mobile layanan publik terpadu untuk mempermudah masyarakat mengakses dokumen dan pengaduan.", span: "lg:col-span-2" },
  { id: "p3", img: p3, title: "SIM Sekolah", category: "Systems", type: "desktop", description: "Sistem Informasi Manajemen Sekolah untuk tata kelola akademik, absensi, dan nilai secara online.", span: "lg:col-span-2" },
  { id: "p4", img: p4, title: "Marketplace UMKM", category: "E-commerce", type: "mobile", description: "Platform e-commerce lokal untuk memberdayakan UMKM dalam memasarkan produk unggulan.", span: "lg:col-span-2 lg:row-span-2" },
  { id: "p5", img: p5, title: "Manajemen Klinik", category: "Healthcare", type: "desktop", description: "Sistem rekam medis dan manajemen operasional klinik berbasis cloud yang terintegrasi.", span: "lg:col-span-2" },
  { id: "p6", img: p6, title: "Dashboard Logistik", category: "Data", type: "desktop", description: "Dashboard analitik real-time untuk pemantauan armada dan manajemen pengiriman logistik.", span: "lg:col-span-2" },
];

const PORTFOLIOS_PER_PAGE = 6;

function Portfolio() {
  const { data: landingData } = useLandingData();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const spans = [
    "lg:col-span-2 lg:row-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
    "lg:col-span-2 lg:row-span-2",
    "lg:col-span-2",
    "lg:col-span-2",
  ];

  const projectsList: PortfolioProject[] = (landingData?.portfolios && landingData.portfolios.length > 0)
    ? landingData.portfolios.map((item: any, index: number) => {
      const catLabel = item.type === "mobile" ? "Mobile" : "Desktop";
      return {
        id: item.id,
        img: item.image || p1,
        title: item.name || "Karya Portofolio",
        category: catLabel,
        type: item.type || "desktop",
        description: item.description || "Deskripsi portofolio tidak tersedia.",
        demo_url: item.demo_url,
        span: spans[index % spans.length],
      };
    })
    : defaultProjects;

  const categories = ["Semua", "Mobile", "Desktop"];

  const filteredProjects =
    activeCategory === "Semua"
      ? projectsList
      : projectsList.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase() || p.type?.toLowerCase() === activeCategory.toLowerCase()
      );

  const totalPages = Math.ceil(filteredProjects.length / PORTFOLIOS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PORTFOLIOS_PER_PAGE,
    currentPage * PORTFOLIOS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} id="portofolio" className="relative py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow="Portofolio"
            title="Karya pilihan kami."
            desc="Karya pilihan kami dalam mengembangkan produk digital terbaik untuk mitra dan klien."
          />
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2"
        >
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => handleCategoryChange(c)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer ${activeCategory === c
                ? "gradient-accent text-accent-foreground shadow-soft scale-105 text-white"
                : "border border-primary/15 bg-white/70 text-primary/70 hover:text-secondary hover:bg-white"
                }`}
            >
              {c}
            </button>
          ))}
        </motion.div>

        {/* Grid List */}
        <div className="-mx-4 mt-12 overflow-hidden sm:mx-0 sm:overflow-visible">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-4 sm:mx-0 sm:grid sm:auto-rows-[240px] sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-2 sm:scroll-pl-0 lg:grid-cols-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {paginatedProjects.map((p, i) => (
              <motion.article
                key={`${p.id}-${i}`}
                layout
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelectedProject(p)}
                className={`group relative aspect-[4/5] w-[85%] shrink-0 snap-start overflow-hidden rounded-[28px] border border-white/60 bg-primary shadow-glass sm:aspect-auto sm:w-auto sm:shrink cursor-pointer transition-all duration-300 hover:shadow-2xl ${p.span}`}
              >
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-95" />
                <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-primary-foreground">
                  <div>
                    <span className="inline-block rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl text-white group-hover:text-cyan-300 transition-colors">
                      {p.title}
                    </h3>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full glass-dark text-white transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-[#004AAD] group-hover:scale-110">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <SectionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Portfolio Detail Dialog / Modal */}
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="w-[92vw] sm:w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-0 border border-gray-100 shadow-2xl">
            {selectedProject && (
              <div className="flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header Image */}
                <div className="relative h-44 sm:h-72 w-full overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={selectedProject.img}
                    alt={selectedProject.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-full bg-[#004AAD] text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2">
                        {selectedProject.category}
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                        {selectedProject.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD]">
                      Deskripsi Portofolio
                    </h4>
                    <div
                      className="mt-3 text-gray-700 text-base leading-relaxed space-y-3 prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                    />
                  </div>

                  {/* Action CTA */}
                  <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Tertarik membangun aplikasi atau sistem serupa?</p>
                      <p className="text-sm font-bold text-gray-900">Konsultasikan kebutuhan teknologi Anda dengan tim Asta.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedProject.demo_url && (
                        <Button
                          asChild
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-semibold shadow-md transition-all"
                        >
                          <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer">
                            Live Demo <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        asChild
                        onClick={() => setSelectedProject(null)}
                        className="rounded-full bg-[#004AAD] text-white hover:bg-blue-800 px-6 py-3 font-semibold shadow-md"
                      >
                        <a href="#kontak">
                          Hubungi Tim Kami <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Discover (dynamic from Filament API)
 * ──────────────────────────────────────────────────────────────── */

const DISCOVERS_PER_PAGE = 3;

function DiscoverSection({ discoversList = defaultDiscovers }: { discoversList?: DiscoverData[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDiscover, setSelectedDiscover] = useState<DiscoverData | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const totalPages = Math.ceil(discoversList.length / DISCOVERS_PER_PAGE) || 1;
  const paginatedDiscovers = discoversList.slice(
    (currentPage - 1) * DISCOVERS_PER_PAGE,
    currentPage * DISCOVERS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <section ref={sectionRef} id="discover" className="relative overflow-hidden bg-[#eef7fa] py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00a3be]/40 bg-white/90 px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#0093ab] shadow-sm uppercase">
            <span className="h-2 w-2 rounded-full bg-[#00a3be]" />
            DISCOVER ASTA
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold leading-[1.15] sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            Temukan solusi teknologi tepat untuk pertumbuhan Anda.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed">
            Dapatkan berbagai penawaran layanan unggulan, konsultasi gratis, dan paket solusi digital dari Asta Digital Agency.
          </p>
        </motion.div>

        {/* Discover Cards with Left and Right Chevron Navigation */}
        <div className="relative mt-12 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            aria-label="Previous Page"
            className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#00a3be] transition-all hover:bg-white/80 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-9 w-9 stroke-[2.5]" />
          </button>

          {/* Cards Grid */}
          <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDiscovers.map((item, index) => {
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedDiscover(item)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                >
                  <div>
                    {/* Top Image */}
                    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-gray-100 relative">
                      <img
                        src={item.image || p1}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.is_pinned && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#004AAD] shadow-sm">
                          <Pin className="h-3 w-3 fill-[#004AAD]" aria-hidden="true" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Metadata Row: Category + Date */}
                    <div className="flex items-center justify-between gap-2 text-[11px] mb-2 px-0.5">
                      <span className="font-bold text-gray-700 uppercase tracking-wider">
                        {item.category || item.year || (index === 0 ? "TECHNOLOGY INSIGHT" : index === 1 ? "DIGITAL TRANSFORMATION" : "IT SOLUTION")}
                      </span>
                      <span className="font-medium text-gray-400">
                        {item.date || "19 Agustus 2026 • 5 min read"}
                      </span>
                    </div>

                    {/* Title */}
                    {item.show_name !== 0 && (
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug line-clamp-2 mt-1 group-hover:text-[#00a3be] transition-colors">
                        {item.name}
                      </h3>
                    )}

                    {/* Description */}
                    {item.short_description && (
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 font-normal">
                        {item.short_description}
                      </p>
                    )}
                  </div>

                  {/* Read More Button */}
                  <div className="mt-5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDiscover(item);
                      }}
                      className="w-full rounded-xl gradient-accent hover:bg-gradient-accent text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 transition-all shadow-sm cursor-pointer"
                    >
                      Baca Selengkapnya
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
            className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#00a3be] transition-all hover:bg-white/80 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-9 w-9 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="flex sm:hidden items-center justify-center gap-6 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center justify-center h-10 w-10 rounded-full text-[#00a3be] bg-white shadow-sm border border-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>
          <span className="text-xs font-semibold text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center h-10 w-10 rounded-full text-[#00a3be] bg-white shadow-sm border border-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {totalPages > 1 && (
          <SectionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Discover Event Detail Dialog Modal */}
        <Dialog open={!!selectedDiscover} onOpenChange={(open) => !open && setSelectedDiscover(null)}>
          <DialogContent showClose={false} className="w-[92vw] sm:w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
            {selectedDiscover && (
              <div className="flex max-h-[85vh] flex-col overflow-hidden sm:max-h-[90vh]">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {/* Header Image or Ocean Banner */}
                  <DialogHeader className="relative h-48 sm:h-72 w-full shrink-0 overflow-hidden bg-gray-900 p-0 text-left">
                    {selectedDiscover.image ? (
                      <img
                        src={selectedDiscover.image}
                        alt={selectedDiscover.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] via-[#052848] to-[#02182d] p-8 flex flex-col justify-end">
                        {selectedDiscover.logo && (
                          <img src={selectedDiscover.logo} alt={selectedDiscover.name} className="w-16 h-16 object-contain mb-4" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        {selectedDiscover.year && (
                          <span className="inline-block rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-sm">
                            {selectedDiscover.year}
                          </span>
                        )}
                        <DialogTitle className="font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
                          {selectedDiscover.name}
                        </DialogTitle>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Content Body */}
                  <div className="space-y-5 px-6 py-7 sm:space-y-6 sm:px-10 sm:py-9">
                    {selectedDiscover.short_description && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD] mb-2">
                          Informasi & Deskripsi Lengkap
                        </h4>
                        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                          {selectedDiscover.short_description}
                        </p>
                      </div>
                    )}

                    {/* Bullet List of DiscoverLists */}
                    {selectedDiscover.DiscoverLists && selectedDiscover.DiscoverLists.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#004AAD] mb-3">
                          Cakupan Fitur & Solusi Utama
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {selectedDiscover.DiscoverLists.map((list) => (
                            <li key={list.id} className="flex items-start gap-2.5 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/60 text-xs sm:text-sm font-medium text-gray-800">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#004AAD] mt-0.5" />
                              <span className="whitespace-pre-line">{list.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-6 sm:px-10 sm:py-7">
                  <div className="flex w-full flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Tertarik dengan {selectedDiscover.name}?</p>
                      <p className="text-sm font-bold text-gray-900">Konsultasikan kebutuhan teknologi Anda secara gratis.</p>
                    </div>
                    <Button
                      asChild
                      onClick={() => setSelectedDiscover(null)}
                      className="rounded-full bg-[#004AAD] px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-800"
                    >
                      <a href="#kontak">
                        Konsultasi Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Why Us + Stats
 * ──────────────────────────────────────────────────────────────── */

const advantages = [
  { icon: Users, title: "Tim Berpengalaman", text: "Engineer & desainer dengan pengalaman enterprise mendalam." },
  { icon: Shield, title: "Keamanan Utama", text: "Praktik siap audit dan sistem terenkripsi secara default." },
  { icon: Layers, title: "Modern & Responsif", text: "UI bersih, aksesibel, dan mobile-first." },
  { icon: Headphones, title: "Dukungan Pasca-Rilis", text: "Perawatan dan perbaikan berkelanjutan setelah go-live." },
];

function WhyUs() {
  return (
    <section id="keunggulan" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-60" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow="Mengapa Memilih Kami"
            title="Kualitas, kepedulian, dan konsistensi — skala enterprise."
          />
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
          {advantages.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex items-start gap-5 overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
              <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-accent text-accent-foreground shadow-soft">
                <a.icon className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-primary">{a.title}</h3>
                  {/* <span className="text-sm font-bold text-secondary">{a.pct}%</span> */}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
                {/* <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
                  <motion.div
                    initial={{ width: 0 }}
                    // whileInView={{ width: `${a.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: i * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full gradient-accent"
                  />
                </div> */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const bigStats = [
  { value: 20, suffix: "+", label: "Proyek diselesaikan", icon: Rocket },
  { value: 8, suffix: "+", label: "Klien puas", icon: Users },
  { value: 4, suffix: "+", label: "Tahun pengalaman", icon: Award },
  { value: 98, suffix: "%", label: "Kepuasan klien", icon: Sparkles },
];

function Stats() {
  return (
    <section className="relative -mt-6 pb-6 sm:pb-6">
      <WaveDivider from="var(--surface)" to="var(--background)" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {bigStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-[22px] border border-white/60 bg-white/80 p-4 shadow-glass backdrop-blur-md sm:aspect-auto sm:rounded-[26px] sm:p-6"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/25 blur-2xl" />
              <s.icon className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
              <div>
                <div className="font-display text-3xl font-bold leading-none text-primary sm:mt-3 sm:text-4xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Process
 * ──────────────────────────────────────────────────────────────── */

const steps = [
  { n: "01", title: "Penemuan", text: "Memahami tujuan, pengguna, dan ruang lingkup proyek.", icon: Search },
  { n: "02", title: "Strategi", text: "Arsitektur, timeline, dan perencanaan biaya.", icon: Lightbulb },
  { n: "03", title: "Desain", text: "Alur UX, sistem desain, dan visual premium.", icon: Palette },
  { n: "04", title: "Pengembangan", text: "Pengembangan iteratif dengan tinjauan mingguan.", icon: Code2 },
  { n: "05", title: "Peluncuran", text: "Deployment terkelola dan enablement tim.", icon: Rocket },
  { n: "06", title: "Dukungan", text: "Perawatan berkelanjutan dan evolusi jangka panjang.", icon: Headphones },
];

function Process() {
  return (
    <section id="proses" className="relative py-6 sm:py-6 lg:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow="Proses Kami"
            title="Perjalanan transparan — dari brief hingga peluncuran."
            desc="Enam tahap yang terkoordinasi dengan baik untuk menjaga proyek Anda tepat waktu, sesuai scope, dan on brand."
          />
        </motion.div>

        <div className="relative mt-16">
          {/* Desktop: 6-column grid */}
          <ol className="hidden lg:grid lg:grid-cols-6 lg:gap-5">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col items-center text-center"
              >
                {/* node */}
                <div className="relative z-10 flex h-[104px] w-[104px] items-center justify-center rounded-full border-4 border-white shadow-glass transition-transform duration-500 group-hover:-translate-y-1 gradient-ocean">
                  <s.icon className="relative h-10 w-10 text-black drop-shadow-md" strokeWidth={2.2} />
                  <span className="absolute -inset-2 rounded-full border border-accent/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[10px] font-bold text-primary shadow-sm">
                    {s.n}
                  </span>
                </div>

                <div className="mt-6 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-5 shadow-glass/60 backdrop-blur-md transition-all duration-500 group-hover:border-accent/50 group-hover:bg-white/90">
                  <h3 className="font-display text-base font-bold text-primary">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* Mobile / tablet: horizontal snap scroller */}
          <div className="lg:hidden -mx-4 overflow-hidden sm:-mx-6">
            <div className="overflow-x-auto pb-4 scroll-pl-4 sm:scroll-pl-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ol className="flex snap-x snap-mandatory gap-4 px-4 sm:px-6">
                {steps.map((s, i) => (
                  <motion.li
                    key={s.n}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-[240px] shrink-0 snap-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-glass gradient-ocean">
                        <s.icon className="relative h-7 w-7 text-black drop-shadow" strokeWidth={2.2} />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[9px] font-bold text-primary shadow-sm">
                          {s.n}
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-glass backdrop-blur-md">
                      <h3 className="font-display text-base font-bold text-primary">{s.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Testimonials carousel
 * ──────────────────────────────────────────────────────────────── */

const defaultTestimonials: TestimonialItem[] = [
  {
    id: 1,
    name: "Surya Aditama",
    role: "Head of IT",
    org: "Dinas Kominfo",
    quote:
      "Asta Digital membangun portal yang memenuhi standar pemerintah kami yang ketat dan tetap menjadi kesenangan nyata digunakan oleh staf kami — hari demi hari.",
    tag: "Pemerintah",
    rating: 5,
  },
  {
    id: 2,
    name: "Ratih Pratiwi",
    role: "Direktur",
    org: "PT Mitra Andalan",
    quote:
      "Komunikasi yang jelas dan eksekusi premium. Sistem internal kami jauh lebih efisien, dapat diaudit, dan tim kami benar-benar menikmati penggunaannya sekarang.",
    tag: "Enterprise",
    rating: 5,
  },
  {
    id: 3,
    name: "Hendra Wijaya",
    role: "Kepala Sekolah",
    org: "SMA Negeri 1",
    quote:
      "SIM Sekolah ini secara fundamental mengubah cara guru, orang tua, dan administrasi berkolaborasi. Produk berkelas enterprise yang dibangun dengan empati nyata.",
    tag: "Edukasi",
    rating: 5,
  },
];

const testimonialGradients = [
  "from-[oklch(0.45_0.18_230)] to-[oklch(0.35_0.16_250)]",
  "from-[oklch(0.48_0.2_195)] to-[oklch(0.38_0.18_215)]",
  "from-[oklch(0.42_0.17_260)] to-[oklch(0.32_0.15_280)]",
];

function getInitials(name: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function TestimonialAvatar({ avatar, name, colorClass }: { avatar?: string; name: string; colorClass: string }) {
  const [imgError, setImgError] = useState(false);

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-[52px] w-[52px] shrink-0 rounded-2xl object-cover shadow-soft border border-white/40"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${colorClass} text-base font-bold text-white shadow-soft`}
      style={{ width: 52, height: 52 }}
    >
      {getInitials(name)}
    </div>
  );
}

function Testimonials() {
  const { data: landingData } = useLandingData();
  const testimonials = (landingData?.testimonials && landingData.testimonials.length > 0)
    ? landingData.testimonials
    : defaultTestimonials;

  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = testimonials.length;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (len === 0) return;
    timerRef.current = setInterval(() => setIdx((v) => (v + 1) % len), 6000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [len]);

  const goTo = (i: number) => { if (len === 0) return; setIdx((i + len) % len); resetTimer(); };
  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setDragging(true);
    dragStartX.current = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  };
  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    const endX = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = dragStartX.current - endX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
  };
  return (
    <section id="testimoni" className="relative overflow-hidden bg-surface py-6 sm:py-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-ocean opacity-60" />
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow="Testimoni"
            title="Suara dari para klien kami."
          />
        </motion.div>

        {/* 3-D card stack */}
        <div
          className="relative mt-14 flex justify-center"
          style={{ height: 480, perspective: "1400px" }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => { if (dragging) { setDragging(false); } }}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {/* ── Ghost/shadow cards (decorative depth foreshadow) ── */}
          {[
            { scale: 0.76, y: 82, x: 48, rotateZ: 9, opacity: 0.38, bg: "bg-white/80" },
            { scale: 0.69, y: 108, x: 62, rotateZ: 12, opacity: 0.26, bg: "bg-white/60" },
            { scale: 0.62, y: 132, x: 74, rotateZ: 15, opacity: 0.17, bg: "bg-white/45" },
            { scale: 0.55, y: 154, x: 84, rotateZ: 18, opacity: 0.11, bg: "bg-white/30" },
            { scale: 0.48, y: 174, x: 93, rotateZ: 21, opacity: 0.07, bg: "bg-white/20" },
          ].map((g, gi) => (
            <div
              key={`ghost-${gi}`}
              className={`pointer-events-none absolute w-full max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl rounded-[32px] border border-white/40 ${g.bg} shadow-soft`}
              style={{
                height: 380,
                transformOrigin: "top center",
                transform: `translateY(${g.y}px) translateX(${g.x}px) rotateZ(${g.rotateZ}deg) scale(${g.scale})`,
                opacity: g.opacity,
                zIndex: 4 - gi,
              }}
            />
          ))}

          {/* ── Real testimonial cards ── */}
          {testimonials.map((t, i) => {
            const offset = (i - idx + len) % len;
            const isActive = offset === 0;
            const isSecond = offset === 1;
            const isThird = offset === 2;
            const visible = isActive || isSecond || isThird;
            const cardColor = testimonialGradients[i % testimonialGradients.length];
            const starCount = t.rating ?? 5;

            return (
              <motion.figure
                key={t.id || t.name}
                animate={{
                  scale: isActive ? 1 : isSecond ? 0.91 : 0.83,
                  y: isActive ? 0 : isSecond ? 28 : 52,
                  x: isActive ? 0 : isSecond ? 18 : 34,
                  rotateZ: isActive ? 0 : isSecond ? 3 : 6,
                  opacity: isActive ? 1 : isSecond ? 0.82 : visible ? 0.52 : 0,
                  zIndex: isActive ? 30 : isSecond ? 20 : 10,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                style={{ transformOrigin: "top center", pointerEvents: isActive ? "auto" : "none" }}
                className="absolute w-full max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl cursor-grab select-none overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-glass backdrop-blur-md active:cursor-grabbing"
              >
                {/* Gradient top banner */}
                <div className={`relative bg-gradient-to-br ${cardColor} px-8 pt-8 pb-10`}>
                  {t.tag && (
                    <span className="inline-block rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                      {t.tag}
                    </span>
                  )}
                  <div className="mt-4 flex gap-1">
                    {[...Array(starCount)].map((_, si) => (
                      <svg key={si} viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-300 drop-shadow">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <svg viewBox="0 0 40 32" className="absolute right-8 top-6 h-16 w-16 text-white/10" fill="currentColor">
                    <path d="M0 32V19.2C0 8.533 6.4 2.133 19.2 0l2.4 4.267C15.467 5.6 12 8.533 12 13.333V16h8V32H0zm20 0V19.2C20 8.533 26.4 2.133 39.2 0l2.4 4.267C35.467 5.6 32 8.533 32 13.333V16h8V32H20z" />
                  </svg>
                </div>

                {/* Card body */}
                <div className="px-8 pb-8 pt-6">
                  <blockquote className="font-display text-[1.05rem] font-semibold leading-relaxed text-primary sm:text-lg">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    <TestimonialAvatar avatar={t.avatar} name={t.name} colorClass={cardColor} />
                    <div>
                      <div className="font-display text-base font-bold text-primary">{t.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {t.role && <span>{t.role}</span>}
                        {t.role && t.org && <span> · </span>}
                        {t.org && <span className="font-semibold text-secondary">{t.org}</span>}
                      </div>
                    </div>
                  </figcaption>
                </div>
              </motion.figure>
            );
          })}
        </div>

        {/* Controls row */}
        <div className=" flex items-center justify-center gap-4">
          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Testimoni sebelumnya"
            className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-white/70 text-primary/60 shadow-soft backdrop-blur transition-all hover:border-accent/40 hover:text-secondary hover:shadow-glass"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${idx === i ? "w-8 gradient-accent" : "w-2 bg-primary/25"
                  }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Testimoni selanjutnya"
            className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-white/70 text-primary/60 shadow-soft backdrop-blur transition-all hover:border-accent/40 hover:text-secondary hover:shadow-glass"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Swipe hint — mobile only */}
        <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 sm:hidden">
          geser untuk menjelajahi
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  CTA
 * ──────────────────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="relative py-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[36px] gradient-hero p-10 shadow-glass sm:p-16"
        >
          {/* floating shapes */}
          <div className="pointer-events-none absolute -left-16 top-6 h-56 w-56 rounded-[45%_55%_50%_50%] bg-accent/25 blur-2xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[oklch(0.55_0.14_235/0.35)] blur-3xl" />
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-10 top-10 hidden h-16 w-16 rounded-2xl glass-dark md:block"
          />
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 left-16 hidden h-10 w-10 rounded-full glass-dark md:block"
          />

          {/* subtle waves */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-white/10"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 C240,20 480,110 720,70 C960,30 1200,90 1440,60 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>

          <div className="relative mx-auto max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl text-center text-primary-foreground">
            <Eyebrow>
              <div className="text-white">
                Siap memulai proyek Anda berikutnya?
              </div>
            </Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold leading-[1.05] sm:text-5xl">
              Mari kita wujudkan sesuatu yang{" "}
              <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
                luar biasa
              </span>{" "}
              bersama.
            </h2>
            <p className="mx-auto mt-5 max-w-xl 2xl:max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              Konsultasi gratis 30 menit bersama tim senior kami — tanpa syarat apapun.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-6 text-primary shadow-glass hover:bg-white/90"
              >
                <a href="#kontak">
                  Pesan Konsultasi <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/30 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <a href="#portofolio">Jelajahi Karya</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Contact
 * ──────────────────────────────────────────────────────────────── */

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await axios.post("/api/contact", {
        name: formData.get("name"),
        organization: formData.get("org"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
      });

      form.reset();
      toast.success("Pesan terkirim. Tim kami akan segera menghubungi Anda.");
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : "Pesan gagal dikirim. Silakan coba lagi.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section id="kontak" className="relative py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[36px] border border-white/60 bg-white/80 shadow-glass backdrop-blur-md"
        >
          <div className="grid lg:grid-cols-12">
            <div className="relative overflow-hidden gradient-hero p-10 text-primary-foreground lg:col-span-5 lg:p-12">
              <div className="pointer-events-none absolute inset-0 opacity-30 gradient-mesh" />
              <div className="relative">
                <Eyebrow>
                  <div className="text-white">
                    Kontak
                  </div>
                </Eyebrow>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
                  Mulailah babak digital Anda berikutnya.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
                  Ceritakan proyek Anda — kami akan merespons dalam satu hari kerja dengan proposal yang jelas dan langkah selanjutnya.
                </p>
                <ul className="mt-10 space-y-5">
                  <li className="flex items-start gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl glass-dark">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">Email</div>
                      <div className="text-sm font-semibold">astadigitech@gmail.com</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl glass-dark">
                      <PhoneCall className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">
                        WhatsApp
                      </div>
                      <div className="text-sm font-semibold">+62 815 7822 3564</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl glass-dark">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">Alamat</div>
                      <div className="text-sm font-semibold">
                        Jl. Imogiri Timur, kec. Pleret, kab. Bantul, D.I Yogyakarta
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-10 lg:col-span-7 lg:p-12">
              <h3 className="font-display text-2xl font-bold text-primary">Mulai percakapan</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Bagikan beberapa detail dan kami akan segera menghubungi Anda.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama lengkap</Label>
                  <Input id="name" name="name" required placeholder="Nama Anda" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org">Organisasi</Label>
                  <Input id="org" name="org" placeholder="Perusahaan / institusi" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="anda@domain.com"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" name="phone" placeholder="08xx" className="rounded-xl" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">Deskripsi proyek</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Ceritakan tentang proyek Anda..."
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="mt-8 h-12 w-full rounded-full gradient-accent text-accent-foreground shadow-glass sm:w-auto sm:px-8"
              >
                {submitting ? (
                  "Mengirim..."
                ) : (
                  <div className="flex items-center justify-center gap-1 text-white">
                    Kirim Pesan <MessageSquare className="ml-1.5 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Footer
 * ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* wave top */}
      <svg
        className="absolute inset-x-0 top-0 h-16 w-full -translate-y-px text-primary"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C240,110 480,0 720,50 C960,110 1200,20 1440,60 L1440,0 L0,0 Z"
          fill="var(--background)"
        />
        <path
          d="M0,80 C240,20 480,110 720,60 C960,10 1200,80 1440,50 L1440,0 L0,0 Z"
          fill="var(--surface)"
          opacity="0.35"
        />
      </svg>

      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] xl:max-w-[1536px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] px-4 pt-20 pb-10 sm:px-6 sm:pt-24 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5"> 
                <img src={logo} alt="Asta Digital Agency" className="mb -4 h-auto w-[135px] p-1" />
              {/* <div className="font-display text-lg font-bold text-white">ASTA Digital Agency</div> */}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Kami percaya bahwa teknologi bukan sekadar alat, tapi jembatan menuju pertumbuhan bisnis yang berkelanjutan.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/astadigitalagency/"
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/20 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:astadigitech@gmail.com"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/20 hover:scale-110"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/asta-digital-agency-b9441637a/"
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:bg-white/20 hover:scale-110"
                aria-label="WhatsApp"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Alamat Kantor
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/80">
                Jl. Imogiri Timur, Gng. Tobanan V, dsn. Jati Rt 008, Wonokromo, kec. Pleret, kab. Bantul, D.I Yogyakarta
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Solusi IT
              </div>
              <ul className="mt-4 space-y-2 text-xs text-white/80">
                <li>Konsultan IT</li>
                <li>Layanan IT</li>
                <li>Web Apps Development</li>
                <li>Mobile Apps Development</li>
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Hubungi & Jam Kerja
              </div>
              <ul className="mt-4 space-y-2 text-xs text-white/80">
                <li><strong className="text-white">Email:</strong> astadigitech@gmail.com</li>
                <li><strong className="text-white">Telp/WA:</strong> +62 815 7822 3564</li>
                <li className="pt-2"><strong className="text-white">Senin-Jumat:</strong> 08:00 - 17:00</li>
                <li><strong className="text-white">Sabtu & Minggu:</strong> On Call</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row">
          <div>© Hak Cipta 2025 PT Asta Digital Agency. Semua hak dilindungi.</div>
          <div className="flex items-center gap-5">
            <a href="/" className="hover:text-accent">Beranda</a>
            <a href="/#kontak" className="hover:text-accent">Hubungi Kami</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Page composition
 * ──────────────────────────────────────────────────────────────── */

export function LandingPage() {
  const { data: landingData } = useLandingData();
  const discoversList = (landingData?.discovers && landingData.discovers.length > 0) ? landingData.discovers : defaultDiscovers;

  return (
    <div className="relative overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <About discoversList={discoversList} />
        <Services />
        <Portfolio />
        <DiscoverSection discoversList={discoversList} />
        <WhyUs />
        <Stats />
        <Process />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default LandingPage;