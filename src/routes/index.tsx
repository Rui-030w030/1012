import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";

import photoAsset1 from "@/assets/shadow-veil-01.jpg.asset.json";
import photoAsset2 from "@/assets/shadow-veil-02.jpg.asset.json";

const PHOTO_1 = photoAsset1.url;
const PHOTO_2 = photoAsset2.url;

const detailContentMap: Record<string, { title: string; desc: string }> = {
  "detail-collar": {
    title: "SHIRT COLLAR / 襯衫式尖領",
    desc: "硬挺精緻的翻領剪裁，為寬鬆輕透的衣身提供結構骨幹。領緣線條銳利，開釦著用時自然呈現雅緻的V型鎖骨線條。",
  },
  "detail-fabric": {
    title: "SHEER MESH / 透膚網紗布料",
    desc: "黑色輕質高透光網紗，結合淡灰色水墨抽象暈染印花。光線射入時產生微妙的反光與陰影深淺變化，極具暗黑先鋒美學。",
  },
  "detail-button": {
    title: "SNAP BUTTONS / 霧黑前開襟排扣",
    desc: "門襟中央排列細緻的黑色同色系按扣，可全扣展現內斂端莊，亦可解開扣件讓兩片透光薄紗隨著步伐飄拂。",
  },
  "detail-drawstring": {
    title: "DRAWSTRING DETAIL / 側擺垂墜抽繩",
    desc: "衣身側擺配置活動式調整抽繩與飄帶，穿著者可依造型需求拉緊收摺或自由垂掛，體現日系現代時裝的結構多面性。",
  },
};

const sizeOptions = [
  { value: "SIZE 01 (MEDIUM - CHEST 124CM)", label: "SIZE 01 (MEDIUM)", sub: "LOOSE FIT" },
  { value: "SIZE 02 (LARGE - CHEST 130CM)", label: "SIZE 02 (LARGE)", sub: "OVERSIZED" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INK / FORM — SHADOW VEIL 男雙層透膚網紗暈染圖樣襯衫" },
      {
        name: "description",
        content:
          "INK / FORM AW26 編輯特輯：HARE 男雙層透膚網紗暈染圖樣襯衫上衣。外層透膚薄紗疊合內搭素黑，演繹現代暗黑極簡語彙。",
      },
      { property: "og:title", content: "INK / FORM — SHADOW VEIL 男雙層透膚網紗暈染圖樣襯衫" },
      {
        property: "og:description",
        content: "半透明材質與流動剪裁，創造黑色層次之間的光影。AW26 Editorial Capsule。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productModal, setProductModal] = useState<{ title: string; desc: string } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /* Scroll progress + nav background */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      if (progressRef.current) progressRef.current.style.width = pct + "%";
      setScrolled(window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal-item, .reveal-scale");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduced) {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Hero & banner parallax */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = document.querySelectorAll<HTMLElement>(".parallax-layer[data-speed]");
    const banner = document.querySelector<HTMLElement>(".banner-parallax-img");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.pageYOffset;
        const heroH = window.innerHeight;
        if (y <= heroH * 1.3) {
          layers.forEach((layer) => {
            const speed = parseFloat(layer.getAttribute("data-speed") || "0");
            layer.style.transform = `translate3d(0, ${y * speed}px, 0)`;
          });
        }
        if (banner && banner.parentElement) {
          const rect = banner.parentElement.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const speed = parseFloat(banner.getAttribute("data-speed") || "-0.15");
            banner.style.transform = `translate3d(0, ${(rect.top - window.innerHeight / 2) * speed}px, 0)`;
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Body scroll lock + Esc to close */
  useEffect(() => {
    document.body.style.overflow = productModal || checkoutOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setProductModal(null);
        setCheckoutOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [productModal, checkoutOpen]);

  const openCheckout = () => {
    setOrderSuccess(false);
    formRef.current?.reset();
    setSelectedSize(0);
    setCheckoutOpen(true);
  };

  const handleOrderSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
  };

  const navLinks = [
    { href: "#hero", num: "01", label: "HOME" },
    { href: "#product", num: "02", label: "PRODUCT" },
    { href: "#features", num: "03", label: "FEATURES" },
    { href: "#details", num: "04", label: "DETAILS" },
    { href: "#contact", num: "05", label: "CONTACT" },
  ];

  return (
    <div className="bg-white font-sans text-ink-pure antialiased overflow-x-hidden">
      {/* Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 pointer-events-none bg-transparent">
        <div ref={progressRef} className="h-full bg-black transition-all duration-75 ease-out w-0"></div>
      </div>

      {/* Global Fixed Navigation Bar */}
      <header
        id="mainNav"
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 sheer-backdrop border-b border-black/[0.06] ${
          scrolled ? "shadow-sm bg-white/90" : "bg-white/70"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 h-20 sm:h-24 flex items-center justify-between">
          <a href="#hero" className="group flex items-center gap-3 tracking-widest2" aria-label="INK / FORM Home">
            <span className="font-display text-lg sm:text-xl font-bold tracking-ultra">INK</span>
            <span className="text-xs text-ink-muted">/</span>
            <span className="font-display text-lg sm:text-xl font-light tracking-widest text-neutral-800 group-hover:text-black transition-colors">
              FORM
            </span>
            <span className="hidden md:inline-block text-[10px] uppercase font-mono px-2 py-0.5 border border-black/20 text-neutral-600 rounded-none ml-2">
              AW26
            </span>
          </a>

          <nav className="hidden md:flex items-center space-x-12" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest text-neutral-600 hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all"
              >
                <span className="font-mono text-[10px] text-neutral-400 mr-1.5">{link.num}</span>
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none"
            aria-label="Toggle Mobile Menu"
            aria-expanded={menuOpen}
          >
            <span className={`w-6 h-[1.5px] bg-black transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
            <span className={`w-6 h-[1.5px] bg-black transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
            <span className={`w-4 ml-auto h-[1.5px] bg-black transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-2 w-6" : ""}`}></span>
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:hidden fixed inset-x-0 top-20 bg-white/95 backdrop-blur-xl border-b border-black/10 py-8 px-8 flex-col space-y-6 shadow-xl transition-all`}
        >
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`mobile-link text-sm uppercase tracking-widest text-black flex items-center justify-between pb-3 ${
                i < navLinks.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <span>{link.label}</span>
              <span className="font-mono text-xs text-neutral-400">{link.num}</span>
            </a>
          ))}
        </div>
      </header>

      {/* HERO SECTION (100vh with 3-Layer Parallax) */}
      <section id="hero" className="relative w-full min-h-screen h-screen overflow-hidden flex items-center bg-white bg-noise pt-20 sm:pt-0">
        {/* Parallax Layer 01: ink mist & watercolor wash */}
        <div className="parallax-layer absolute inset-0 pointer-events-none z-0" data-speed="0.08">
          <svg className="absolute top-[8%] right-[2%] w-[42vw] max-w-[680px] opacity-[0.06] text-black" viewBox="0 0 500 500" fill="currentColor" aria-hidden="true">
            <path d="M420,150 C480,240 430,360 340,410 C250,460 140,430 80,350 C20,270 50,150 140,90 C230,30 360,60 420,150 Z" />
          </svg>
          <svg className="absolute -bottom-10 left-[5%] w-[35vw] max-w-[500px] opacity-[0.04] text-black" viewBox="0 0 500 500" fill="currentColor" aria-hidden="true">
            <path d="M380,210 C420,290 380,390 290,440 C200,490 100,450 60,370 C20,290 60,180 150,120 C240,60 340,130 380,210 Z" />
          </svg>
          <div className="absolute top-[22%] left-[45%] w-3 h-3 rounded-full bg-black/15 blur-[0.5px]"></div>
          <div className="absolute top-[26%] left-[47%] w-1.5 h-1.5 rounded-full bg-black/20"></div>
          <div className="absolute top-[18%] left-[43%] w-2 h-2 rounded-full bg-black/10"></div>
        </div>

        {/* Parallax Layer 02: Product Photo 01 */}
        <div className="parallax-layer absolute inset-0 z-10 flex items-center justify-end pointer-events-none" data-speed="0.2">
          <div className="relative w-full lg:w-[58%] h-full flex items-end justify-center lg:justify-end px-6 lg:px-16 pb-0">
            <div className="absolute right-[5%] lg:right-[15%] bottom-[12%] w-[320px] sm:w-[480px] lg:w-[560px] h-[520px] sm:h-[680px] bg-gradient-to-t from-neutral-200/50 via-neutral-100/30 to-transparent rounded-full blur-2xl -z-10"></div>

            <div className="relative max-h-[85vh] sm:max-h-[92vh] flex items-end">
              <img
                src={PHOTO_1}
                alt="HARE 男雙層透膚網紗暈染圖樣襯衫上衣穿著展示 — 模特兒手持透膚外層展示透視感與黑色按扣細節"
                className="object-contain max-h-[80vh] sm:max-h-[90vh] w-auto drop-shadow-2xl select-none mix-blend-multiply"
              />

              <div className="hidden xl:flex absolute bottom-20 -left-12 vertical-mode items-center text-[10px] tracking-widest text-neutral-400 font-mono">
                <span className="w-1.5 h-1.5 bg-black rounded-full mb-3"></span>
                FIGURE 01 — ARCHIVE 2026 / HARE
              </div>
            </div>
          </div>
        </div>

        {/* Parallax Layer 03: Typography & CTA */}
        <div className="parallax-layer relative z-20 w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-16 pointer-events-auto" data-speed="0.35">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 max-w-xl">
              <div className="flex items-center gap-3 mb-6 reveal-item">
                <span className="w-8 h-[1px] bg-black"></span>
                <span className="font-mono text-xs uppercase tracking-widest2 text-neutral-500">MENSWEAR / CAPSULE COLLECTION</span>
              </div>

              <h1 className="reveal-item text-4xl sm:text-6xl lg:text-7xl font-display font-bold uppercase tracking-wider leading-[1.05] text-black">
                SHADOW
                <br />
                <span className="font-editorial italic font-normal tracking-wide lowercase text-neutral-800 text-5xl sm:text-7xl lg:text-8xl">veil</span>
              </h1>

              <div className="mt-4 mb-3 reveal-item" style={{ transitionDelay: "150ms" }}>
                <p className="font-mono text-xs sm:text-sm tracking-widest uppercase text-neutral-700 font-medium">SHEER / LIGHT / LAYERED</p>
                <p className="mt-2 text-sm sm:text-base font-light text-neutral-900 tracking-wide">HARE 男雙層透膚網紗暈染圖樣襯衫上衣</p>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-neutral-600 max-w-lg leading-relaxed font-light reveal-item" style={{ transitionDelay: "250ms" }}>
                以半透明材質與流動剪裁，創造黑色層次之間的光影。雙層開襟襯衫輪廓，外層透膚薄紗疊合內搭黑調，演繹現代暗黑極簡語彙。
              </p>

              <div className="mt-6 sm:mt-7 pt-4 border-t border-black/10 flex items-baseline gap-3 reveal-item" style={{ transitionDelay: "300ms" }}>
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest2 text-neutral-400">PRICE</span>
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-black">NT$ 4,280</span>
                <span className="font-mono text-xs sm:text-sm text-neutral-500 tracking-wider">/ ¥18,700 JPY</span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black/20 text-neutral-600 ml-1">TAX INCL.</span>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 reveal-item" style={{ transitionDelay: "380ms" }}>
                <button
                  type="button"
                  onClick={openCheckout}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-black text-white text-xs uppercase tracking-widest overflow-hidden transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 shadow-sm cursor-pointer"
                >
                  <span className="relative z-10 font-medium tracking-widest2">ACQUIRE</span>
                  <div className="absolute inset-0 bg-neutral-900 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                </button>

                <a
                  href="#details"
                  className="group inline-flex items-center justify-center px-7 py-3.5 border border-black/80 bg-white text-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-black hover:text-white hover:-translate-y-0.5"
                >
                  <span className="tracking-widest font-medium">VIEW DETAILS</span>
                  <svg className="ml-2 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </a>
              </div>

              <div className="mt-10 pt-6 border-t border-black/10 grid grid-cols-3 gap-6 max-w-md reveal-item" style={{ transitionDelay: "450ms" }}>
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 uppercase">COLOR</div>
                  <div className="text-xs font-medium tracking-wide mt-1">OBSIDIAN / INK</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 uppercase">MATERIAL</div>
                  <div className="text-xs font-medium tracking-wide mt-1">SHEER MESH</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 uppercase">STRUCTURE</div>
                  <div className="text-xs font-medium tracking-wide mt-1">DOUBLE LAYER</div>
                </div>
              </div>
            </div>

            {/* Center-Right: Editorial Vector Blueprint */}
            <div className="hidden xl:flex lg:col-span-5 justify-center items-center reveal-scale" style={{ transitionDelay: "300ms" }}>
              <div className="relative w-full max-w-[370px] bg-white/80 backdrop-blur-md border border-black/[0.12] p-6 shadow-xl group hover:border-black/40 transition-all duration-500">
                <div className="flex justify-between items-start border-b border-black/10 pb-3 mb-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-ultra text-neutral-400 block">GARMENT BLUEPRINT</span>
                    <span className="font-mono text-xs font-semibold tracking-wider text-black">HARE // SHADOW VEIL</span>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 bg-black text-white uppercase tracking-widest">FIG. 001</span>
                </div>

                <div className="relative w-full aspect-[4/5] flex items-center justify-center overflow-hidden bg-neutral-50/60 border border-neutral-100">
                  <svg viewBox="0 0 400 500" className="w-full h-full p-2 text-black transition-transform duration-700 ease-out group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="向量圖：HARE男雙層透膚網紗暈染圖樣襯衫結構圖">
                    <path d="M50 0 V500 M150 0 V500 M250 0 V500 M350 0 V500" stroke="#000000" strokeWidth="0.3" strokeDasharray="3 6" opacity="0.12" />
                    <path d="M0 100 H400 M0 200 H400 M0 300 H400 M0 400 H400" stroke="#000000" strokeWidth="0.3" strokeDasharray="3 6" opacity="0.12" />

                    <path d="M145 100 L120 170 L140 370 L260 370 L280 170 L255 100 Z" fill="#0a0a0a" fillOpacity="0.92" stroke="#000000" strokeWidth="1.2" />
                    <path d="M145 92 L75 145 L50 240 L115 255 L110 395 C150 402, 250 402, 290 395 L285 255 L350 240 L325 145 L255 92 Z" fill="#111111" fillOpacity="0.3" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" />
                    <ellipse cx="160" cy="220" rx="65" ry="85" fill="#000000" fillOpacity="0.25" />
                    <ellipse cx="250" cy="260" rx="55" ry="90" fill="#000000" fillOpacity="0.22" />

                    <path d="M145 92 L200 130 L255 92 L230 76 L200 84 L170 76 Z" fill="#0c0c0c" stroke="#000000" strokeWidth="1.5" />
                    <path d="M145 92 L185 140 L200 130 Z" fill="#181818" stroke="#000000" strokeWidth="1" />
                    <path d="M255 92 L215 140 L200 130 Z" fill="#181818" stroke="#000000" strokeWidth="1" />

                    <line x1="200" y1="130" x2="200" y2="395" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 3" />
                    <rect x="194" y="130" width="12" height="265" fill="#111111" fillOpacity="0.2" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="200" cy="155" r="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    <circle cx="200" cy="205" r="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    <circle cx="200" cy="255" r="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    <circle cx="200" cy="305" r="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    <circle cx="200" cy="355" r="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />

                    <path d="M120 170 Q70 290 55 350 L110 395" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.6" />
                    <path d="M280 170 Q330 290 345 350 L290 395" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.6" />
                    <line x1="100" y1="130" x2="68" y2="245" stroke="#000000" strokeWidth="1" opacity="0.5" />
                    <line x1="300" y1="130" x2="332" y2="245" stroke="#000000" strokeWidth="1" opacity="0.5" />
                    <path d="M50 240 L115 255" stroke="#000000" strokeWidth="1.8" />
                    <path d="M350 240 L285 255" stroke="#000000" strokeWidth="1.8" />

                    <path d="M110 395 C95 430, 85 455, 92 485" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M118 395 C110 425, 105 450, 112 475" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    <path d="M290 395 C305 430, 315 455, 308 485" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M282 395 C290 425, 295 450, 288 475" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                    <g opacity="0.65">
                      <circle cx="200" cy="88" r="2" fill="#000000" />
                      <path d="M200 88 L235 55 H275" stroke="#000000" strokeWidth="0.8" />
                      <text x="280" y="58" fontFamily="monospace" fontSize="8" fill="#000000" letterSpacing="1">SHIRT COLLAR</text>
                      <circle cx="95" cy="225" r="2" fill="#000000" />
                      <path d="M95 225 L60 210 H15" stroke="#000000" strokeWidth="0.8" />
                      <text x="15" y="205" fontFamily="monospace" fontSize="8" fill="#000000" letterSpacing="1">SHEER MESH</text>
                      <circle cx="92" cy="460" r="2" fill="#000000" />
                      <path d="M92 460 L60 460 H15" stroke="#000000" strokeWidth="0.8" />
                      <text x="15" y="455" fontFamily="monospace" fontSize="8" fill="#000000" letterSpacing="1">STRAP DETAIL</text>
                    </g>
                  </svg>

                  <div className="absolute bottom-2 right-2 font-mono text-[8px] text-neutral-400 tracking-wider">HARE // 2026 ARCHIVE</div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                  <span className="tracking-widest">PRODUCT VECTOR REF</span>
                  <span className="text-black font-medium">SHEER / DYED INK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Hint Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none opacity-60">
          <span className="font-mono text-[9px] uppercase tracking-widest mb-2 text-neutral-500">SCROLL</span>
          <div className="w-[1px] h-8 bg-neutral-300 relative overflow-hidden">
            <div className="w-full h-1/2 bg-black absolute top-0 animate-pulse"></div>
          </div>
        </div>
      </section>
