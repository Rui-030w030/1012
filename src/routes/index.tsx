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
    { href: "#contact", num: "04", label: "CONTACT" },
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

      {/* IMMERSIVE BANNER with Photo 02 and Parallax */}
      <section className="relative w-full h-[70vh] sm:h-[80vh] bg-ink-deep text-white overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          <div className="banner-parallax-img absolute inset-0 w-full h-[125%] -top-[12%] flex items-center justify-center" data-speed="-0.15">
            <img
              src={PHOTO_2}
              alt="人物雙手展開黑色半透明薄紗外層，展現襯衫排扣與下擺流蘇綁帶細節"
              className="w-full h-full object-cover max-w-4xl opacity-40 grayscale contrast-125 select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-transparent to-ink-deep opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-ink-deep via-transparent to-ink-deep opacity-80"></div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-20">
          <svg className="w-full h-full max-w-4xl" viewBox="0 0 1000 400" fill="none" stroke="white" strokeWidth="0.75" strokeDasharray="8 12">
            <path d="M-100 200 C300 100, 700 300, 1100 180" />
            <path d="M-50 250 C350 180, 650 220, 1050 210" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="reveal-item font-mono text-[10px] sm:text-xs uppercase tracking-ultra text-neutral-400 mb-4">CONVERSATION OF DUALITY</div>

          <h2 className="reveal-item text-3xl sm:text-5xl lg:text-7xl font-display uppercase tracking-widest leading-tight text-white">
            BETWEEN LIGHT
            <br />
            <span className="font-editorial italic font-light tracking-wide text-neutral-300">and shadow</span>
          </h2>

          <p className="reveal-item mt-6 text-xs sm:text-sm text-neutral-400 max-w-md mx-auto font-light tracking-wider leading-relaxed">
            微透網紗於光線折射中演繹深淺墨韻。外層展開如羽翼飄動，內在襯衫持守嚴謹輪廓。
          </p>

          <div className="reveal-item mt-8 flex justify-center items-center gap-6 text-[11px] font-mono text-neutral-500">
            <span>01 // DUAL MESH</span>
            <span>•</span>
            <span>02 // SIDE TIES</span>
            <span>•</span>
            <span>03 // INK PATTERN</span>
          </div>
        </div>
      </section>

      {/* PRODUCT INTRODUCTION */}
      <section id="product" className="py-24 sm:py-36 bg-white relative overflow-hidden">
        <svg className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-96 opacity-5 pointer-events-none" viewBox="0 0 200 400" fill="currentColor">
          <path d="M10,20 Q120,180 30,380" stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" />
          <circle cx="80" cy="90" r="12" />
          <circle cx="120" cy="220" r="6" />
        </svg>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-8 mb-16 sm:mb-24">
            <div className="reveal-item">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-2">02 / STATEMENT</span>
              <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-widest text-black">THE PRODUCT</h2>
              <p className="text-sm font-editorial italic text-neutral-600 tracking-wider mt-1 text-xl sm:text-2xl">A layer of shadow</p>
            </div>
            <div className="mt-4 md:mt-0 reveal-item text-right font-mono text-xs text-neutral-400">EDITORIAL CAPSULE / AW26</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Photo 01 crop */}
            <div className="lg:col-span-6 relative">
              <div className="relative overflow-hidden bg-neutral-100 shadow-xl reveal-scale">
                <img
                  src={PHOTO_1}
                  alt="黑色半透明材質近景細節，展示墨水暈染層次與鈕扣"
                  className="w-full h-[520px] sm:h-[620px] object-cover object-[50%_18%] grayscale contrast-110 hover:scale-105 transition-transform duration-700 ease-out"
                />

                <div className="absolute bottom-6 left-6 sheer-backdrop px-4 py-3 border border-black/10 max-w-xs">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">COMPOSITION NOTE</span>
                  <p className="text-xs text-black font-light mt-1">外層半透明輕薄網紗覆蓋，光影穿透時展現若隱若現的暈染肌理。</p>
                </div>
              </div>
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-full h-full border border-black/15 pointer-events-none -z-10"></div>
            </div>

            {/* Right Column: Narrative */}
            <div className="lg:col-span-6 space-y-8 lg:pl-6">
              <div className="reveal-item">
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-ultra block mb-3">DESIGN PHILOSOPHY</span>
                <h3 className="text-2xl sm:text-3xl font-display font-normal uppercase tracking-wider text-black leading-snug">
                  TRANSLUCENT VEIL &amp;
                  <br />
                  <span className="font-editorial italic font-normal text-3xl sm:text-4xl text-neutral-800">Sculptural Fluidity</span>
                </h3>
              </div>

              <div className="reveal-item space-y-6 text-neutral-700 text-sm sm:text-base font-light leading-relaxed">
                <p className="border-l-2 border-black pl-5 text-black font-normal text-base sm:text-lg">
                  「黑色半透明材質在光線下形成若隱若現的層次，寬鬆輪廓搭配襯衫式結構，使服裝在靜態與動態之間產生不同的視覺變化。」
                </p>
                <p>摒棄傳統厚重黑階的壓迫感，此款短袖襯衫選用輕質網紗質料。如同墨滴落入清水之中緩緩化開，布面上的墨染色調與內襯素黑相映成趣。</p>
                <p>俐落的襯衫翻領（Shirt Collar）與同色系門襟按扣相輔相成，保留紳士正裝的工藝底蘊，同時以垂墜飄逸的兩側抽繩解構嚴肅邊界。</p>
              </div>

              <div className="reveal-item pt-6 border-t border-neutral-200 grid grid-cols-2 gap-y-4 gap-x-8 font-mono text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">CATEGORY</span>
                  <span className="text-black font-medium tracking-wide">DOUBLE LAYER SHIRT</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">SLEEVE CUT</span>
                  <span className="text-black font-medium tracking-wide">SHORT / RELAXED DROPPED</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">CLOSURE</span>
                  <span className="text-black font-medium tracking-wide">STUD BUTTONS / FRONT PLACKET</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">HEM FINISH</span>
                  <span className="text-black font-medium tracking-wide">DRAWCORD / STRAP ADJUSTMENT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 sm:py-36 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="absolute -top-32 right-0 w-[500px] h-[500px] text-neutral-700" viewBox="0 0 200 200" fill="currentColor">
            <path d="M40,-60C50,-50,60,-40,65,-25C70,-10,70,10,65,25C60,40,50,50,38,60C25,70,10,75,-5,78C-20,80,-40,75,-55,65C-70,55,-80,35,-82,15C-85,-5,-80,-25,-70,-40C-60,-55,-45,-65,-30,-70C-15,-75,0,-75,15,-70Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute -bottom-20 left-10 w-[400px] h-[400px] text-neutral-800" viewBox="0 0 200 200" fill="currentColor">
            <path d="M30,-45C42,-38,55,-30,62,-18C70,-5,72,12,65,25C58,40,42,50,28,58C12,65,-3,70,-20,68C-38,65,-55,55,-65,40C-75,25,-78,5,-72,-12C-68,-30,-55,-45,-40,-52C-25,-60,-10,-60,5,-58Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
          <div className="border-b border-neutral-800 pb-8 mb-16 flex flex-col md:flex-row md:items-end justify-between">
            <div className="reveal-item">
              <span className="font-mono text-xs uppercase tracking-ultra text-neutral-500 block mb-2">03 / ARCHITECTURE</span>
              <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-widest text-white">KEY FEATURES</h2>
              <p className="font-editorial italic text-neutral-400 text-xl sm:text-2xl mt-1">Lightweight materiality and modular forms</p>
            </div>
            <div className="mt-4 md:mt-0 reveal-item font-mono text-xs text-neutral-500">THREE CORE ATTRIBUTES</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FEATURE 01: Sheer Texture */}
            <article className="reveal-item flex flex-col justify-between bg-black/40 border border-neutral-800 p-8 sm:p-10 relative group hover:border-neutral-600 transition-colors duration-500">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-neutral-500 mb-6">
                  <span>01 / 03</span>
                  <span className="text-white text-[10px] uppercase border border-neutral-700 px-2 py-0.5">MATERIAL</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-white">SHEER TEXTURE</h3>
                <p className="font-editorial italic text-neutral-400 text-lg mb-6">半透明材質</p>

                <p className="text-sm text-neutral-400 leading-relaxed font-light mb-8">
                  輕薄透明的黑色網紗材質，在不同光線下呈現深淺漸層墨色變化。布面細膩微透，光線穿透時與內搭素黑衣身疊加出富有張力的立體層次。
                </p>
              </div>

              <div className="relative overflow-hidden w-full h-56 bg-neutral-900 border border-neutral-800">
                <img
                  src={PHOTO_2}
                  alt="透膚網紗展開時的半透明墨染層次"
                  className="w-full h-full object-cover object-[50%_35%] grayscale contrast-125 brightness-90 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 font-mono text-[9px] text-neutral-400 tracking-wider">CROP // MESH TRANSPARENCY</div>
              </div>
            </article>

            {/* FEATURE 02: Relaxed Silhouette */}
            <article className="reveal-item flex flex-col justify-between bg-black/40 border border-neutral-800 p-8 sm:p-10 relative group hover:border-neutral-600 transition-colors duration-500" style={{ transitionDelay: "150ms" }}>
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-neutral-500 mb-6">
                  <span>02 / 03</span>
                  <span className="text-white text-[10px] uppercase border border-neutral-700 px-2 py-0.5">TAILORING</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-white">RELAXED SILHOUETTE</h3>
                <p className="font-editorial italic text-neutral-400 text-lg mb-6">寬鬆輪廓</p>

                <p className="text-sm text-neutral-400 leading-relaxed font-light mb-8">
                  寬鬆落肩剪裁保留自然垂墜感，短袖設計展現自在隨興。走動時微風穿過雙層外掛面料，使衣身呈現輕盈且具雕塑感的流動輪廓。
                </p>
              </div>

              <div className="relative overflow-hidden w-full h-56 bg-neutral-900 border border-neutral-800">
                <img
                  src={PHOTO_1}
                  alt="寬鬆落肩輪廓與垂墜感"
                  className="w-full h-full object-cover object-[50%_30%] grayscale contrast-125 brightness-90 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 font-mono text-[9px] text-neutral-400 tracking-wider">CROP // OVERSIZED DRAPE</div>
              </div>
            </article>

            {/* FEATURE 03: Drawstring Detail */}
            <article className="reveal-item flex flex-col justify-between bg-black/40 border border-neutral-800 p-8 sm:p-10 relative group hover:border-neutral-600 transition-colors duration-500" style={{ transitionDelay: "300ms" }}>
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-neutral-500 mb-6">
                  <span>03 / 03</span>
                  <span className="text-white text-[10px] uppercase border border-neutral-700 px-2 py-0.5">DETAIL</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-white">DRAWSTRING DETAIL</h3>
                <p className="font-editorial italic text-neutral-400 text-lg mb-6">抽繩細節</p>

                <p className="text-sm text-neutral-400 leading-relaxed font-light mb-8">
                  衣身下擺與側邊設有流動感長版綁帶與抽繩結構。自然垂放時增添隨性格調，拉緊時可自由調整下擺寬度與雙層落差，創造多樣造型維度。
                </p>
              </div>

              <div className="relative overflow-hidden w-full h-56 bg-neutral-900 border border-neutral-800">
                <img
                  src={PHOTO_2}
                  alt="下擺流蘇綁帶與抽繩細節"
                  className="w-full h-full object-cover object-[50%_85%] grayscale contrast-125 brightness-90 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 font-mono text-[9px] text-neutral-400 tracking-wider">CROP // STRAP &amp; CORD</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-36 bg-ink-pure text-white relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <svg className="w-[800px] h-[800px]" viewBox="0 0 400 400" fill="currentColor">
            <path d="M200,40 C280,40 360,100 360,200 C360,300 280,360 200,360 C100,360 40,280 40,200 C40,110 120,40 200,40 Z" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-ultra text-neutral-400 block mb-4 reveal-item">
            INK / FORM — THE CAPSULE ARCHIVE
          </span>

          <h2 className="text-3xl sm:text-6xl lg:text-7xl font-display uppercase tracking-widest text-white reveal-item">
            DEFINE YOUR
            <br />
            <span className="font-editorial italic font-light text-neutral-300">shadow</span>
          </h2>

          <p className="mt-6 text-sm sm:text-base text-neutral-300 font-light max-w-lg mx-auto tracking-wide reveal-item">
            探索黑色層次的另一種表達。
            <br />
            男雙層透膚網紗暈染圖樣襯衫，現已登錄品牌形象特輯。
          </p>

          <div className="mt-10 reveal-item">
            <button
              type="button"
              onClick={openCheckout}
              className="group relative inline-flex items-center justify-center px-10 py-4 bg-white text-black font-display text-xs uppercase tracking-widest2 overflow-hidden transition-all duration-300 hover:bg-neutral-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
            >
              <span className="relative z-10 font-bold tracking-widest2">PURCHASE ARCHIVE</span>
              <div className="absolute inset-0 bg-neutral-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </div>

          <div className="mt-12 flex justify-center items-center gap-8 font-mono text-[10px] text-neutral-500 uppercase tracking-widest reveal-item">
            <span>AUTHENTIC SPECIFICATION</span>
            <span>•</span>
            <span>JAPANESE CONTEMPORARY EDITORIAL</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-black text-white pt-20 pb-12 border-t border-neutral-900">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-neutral-900">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-display text-xl font-bold tracking-ultra text-white">INK</span>
                <span className="text-xs text-neutral-600">/</span>
                <span className="font-display text-xl font-light tracking-widest text-neutral-400">FORM</span>
              </div>
              <p className="text-xs text-neutral-400 font-light max-w-sm leading-relaxed">
                以黑白潑墨與抽象時裝輪廓為基調的高端服飾展示空間。探究透膚材質、光影折射與現代剪裁的共鳴。
              </p>
              <div className="pt-2 font-mono text-[11px] text-neutral-500">LOCATED IN TOKYO &amp; TAIPEI</div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">NAVIGATION</div>
              <ul className="space-y-2 text-xs font-light text-neutral-300">
                <li><a href="#hero" className="hover:text-white transition-colors">HOME</a></li>
                <li><a href="#product" className="hover:text-white transition-colors">PRODUCT INTRO</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">FEATURES</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">CONTACT &amp; SOCIAL</div>
              <div className="space-y-2 text-xs font-light text-neutral-300">
                <p>INSTAGRAM: <a href="#contact" className="hover:text-white underline underline-offset-4">@inkform_archive</a></p>
                <p>EDITORIAL INQUIRY: <span className="font-mono text-neutral-400">editorial@inkform-fashion.com</span></p>
                <p>PRESS OFFICE: <span className="font-mono text-neutral-400">+886 (02) 8700 0000</span></p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-neutral-600">
            <div>&copy; 2026 INK / FORM. ALL RIGHTS RESERVED.</div>
            <div className="mt-4 sm:mt-0 flex gap-6 text-[11px]">
              <span className="hover:text-neutral-400 cursor-pointer">PRIVACY</span>
              <span className="hover:text-neutral-400 cursor-pointer">TERMS OF USE</span>
              <span className="hover:text-neutral-400 cursor-pointer">ACCESSIBILITY</span>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT INSPECTION MODAL */}
      <div
        id="productModal"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 p-4 sm:p-8 ${
          productModal ? "flex opacity-100" : "hidden opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setProductModal(null);
        }}
      >
        <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 text-white p-6 sm:p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row gap-8">
          <button
            type="button"
            onClick={() => setProductModal(null)}
            className="absolute top-4 right-4 z-30 text-neutral-300 hover:text-white px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono tracking-widest focus:outline-none cursor-pointer transition-all active:scale-95"
            aria-label="Close Modal"
          >
            ✕ [CLOSE]
          </button>

          <div className="w-full md:w-1/2 aspect-[3/4] bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center relative">
            <img src={PHOTO_1} alt="商品檢視" className="w-full h-full object-cover object-top" />
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
            <div>
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">PRODUCT ARCHIVE</span>
              <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-white mt-1">
                {productModal ? productModal.title : "HARE 男雙層透膚網紗暈染圖樣襯衫"}
              </h3>
              <p className="font-editorial italic text-neutral-400 text-lg mt-0.5">SHADOW VEIL SHORT-SLEEVE SHIRT</p>

              <div className="mt-6 space-y-3 text-xs text-neutral-300 font-light leading-relaxed">
                <p>
                  {productModal
                    ? productModal.desc
                    : "本件作品由雙層結構構成，外層為黑色半透明輕薄網紗，印有不規則墨水暈染紋樣；內搭黑色純色上衣，營造深邃層次感。"}
                </p>
                <div className="border-t border-neutral-800 pt-3 space-y-2 font-mono text-[11px] text-neutral-400">
                  <div className="flex justify-between"><span>COLORWAY</span><span className="text-white">BLACK WASH / 墨黑</span></div>
                  <div className="flex justify-between"><span>COLLAR</span><span className="text-white">SHIRT COLLAR 尖領</span></div>
                  <div className="flex justify-between"><span>CLOSURE</span><span className="text-white">FRONT SNAP BUTTONS 排扣</span></div>
                  <div className="flex justify-between"><span>HEM ACCENT</span><span className="text-white">SIDE STRAPS / DRAWSTRING 抽繩</span></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-900 flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-500">HARE EXCLUSIVE</span>
              <button
                type="button"
                onClick={() => setProductModal(null)}
                className="px-6 py-2.5 bg-white text-black text-xs font-mono uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer active:scale-95"
              >
                CLOSE INSPECTION
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT / ORDER MODAL */}
      <div
        id="checkoutModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkoutTitle"
        className={`fixed inset-0 z-50 items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 p-4 sm:p-6 overflow-y-auto ${
          checkoutOpen ? "flex opacity-100" : "hidden opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setCheckoutOpen(false);
            setOrderSuccess(false);
          }
        }}
      >
        <div
          className={`relative w-full max-w-2xl bg-white border border-black/20 text-black p-6 sm:p-10 shadow-2xl my-auto transition-transform duration-300 transform ${
            checkoutOpen ? "scale-100" : "scale-95"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setCheckoutOpen(false);
              setOrderSuccess(false);
            }}
            className="absolute top-4 right-4 z-30 text-neutral-400 hover:text-black px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-mono tracking-widest focus:outline-none cursor-pointer transition-all active:scale-95"
            aria-label="Close Checkout Modal"
          >
            ✕ [CLOSE]
          </button>

          {!orderSuccess ? (
            <div>
              <div className="border-b border-black/10 pb-5 mb-6">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-ultra text-neutral-400">
                  <span>ORDER REQUEST</span>
                  <span>•</span>
                  <span>EDITION 2026</span>
                </div>
                <h3 id="checkoutTitle" className="text-xl sm:text-2xl font-display uppercase tracking-widest text-black mt-1">
                  SHADOW VEIL SHIRT
                </h3>
                <p className="text-xs text-neutral-600 font-editorial italic tracking-wide mt-0.5">HARE 男雙層透膚網紗暈染圖樣襯衫上衣</p>

                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 p-3 bg-neutral-50 border border-neutral-200">
                  <div>
                    <span className="font-mono text-[10px] text-neutral-500 uppercase block">PRICE / 建議售價</span>
                    <span className="font-mono text-lg font-bold tracking-tight text-black">NT$ 4,280</span>
                    <span className="text-xs text-neutral-500 font-mono ml-1.5">(¥18,700 JPY / TAX INCL.)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase tracking-wider">LIMITED STOCK</span>
                    <span className="block font-mono text-[10px] text-neutral-400 mt-1">COMPLIMENTARY SHIPPING</span>
                  </div>
                </div>
              </div>

              <form ref={formRef} onSubmit={handleOrderSubmit} className="space-y-5">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-neutral-700 mb-2">01 // SELECT SIZE / 尺寸規格</label>
                  <div className="grid grid-cols-2 gap-3">
                    {sizeOptions.map((size, i) => (
                      <label
                        key={size.value}
                        className={`relative flex items-center justify-between p-3 cursor-pointer border transition-colors ${
                          selectedSize === i
                            ? "border-black bg-black text-white"
                            : "border-neutral-300 bg-white text-black hover:border-black"
                        }`}
                      >
                        <input
                          type="radio"
                          name="orderSize"
                          value={size.value}
                          className="sr-only"
                          checked={selectedSize === i}
                          onChange={() => setSelectedSize(i)}
                        />
                        <span className="text-xs font-mono font-medium tracking-wider">{size.label}</span>
                        <span className={`text-[10px] font-mono ${selectedSize === i ? "text-neutral-300" : "text-neutral-500"}`}>{size.sub}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block font-mono text-xs uppercase tracking-widest text-neutral-700 mb-3">02 // CUSTOMER INFORMATION / 訂購者資料</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">FULL NAME / 姓名 *</span>
                      <input type="text" required placeholder="例：林墨白" className="w-full text-xs font-sans p-3 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">PHONE NUMBER / 聯絡電話 *</span>
                      <input type="tel" required placeholder="0912-345-678" className="w-full text-xs font-mono p-3 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">EMAIL ADDRESS / 電子郵件 *</span>
                    <input type="email" required placeholder="client@inkform.com" className="w-full text-xs font-mono p-3 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-colors" />
                  </div>

                  <div className="mt-3">
                    <span className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">SHIPPING ADDRESS / 配送地址 *</span>
                    <input type="text" required placeholder="縣市、行政區、街道門牌號碼及樓層" className="w-full text-xs font-sans p-3 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-colors" />
                  </div>

                  <div className="mt-3">
                    <span className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">SPECIAL NOTES / 訂單備註 (選填)</span>
                    <textarea rows={2} placeholder="特殊包裝需求、偏好配送時段等" className="w-full text-xs font-sans p-3 bg-neutral-50 border border-neutral-200 focus:border-black focus:bg-white focus:outline-none transition-colors resize-none"></textarea>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-auto text-left">
                    <span className="block font-mono text-[10px] text-neutral-400 uppercase">PAYMENT DUE</span>
                    <span className="font-mono text-base font-bold text-black">NT$ 4,280</span>
                    <span className="text-[11px] text-neutral-500 ml-1">貨到付款 / 線上刷卡審核</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-all duration-300 cursor-pointer active:scale-95 shadow-md"
                  >
                    CONFIRM &amp; ORDER / 確認訂購
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 mx-auto bg-black text-white flex items-center justify-center font-mono text-xl">✓</div>
              <h4 className="text-xl sm:text-2xl font-display uppercase tracking-widest text-black">RESERVATION CONFIRMED</h4>
              <p className="text-xs sm:text-sm font-light text-neutral-600 max-w-md mx-auto leading-relaxed">
                感謝您的訂購。我們已收到您的「SHADOW VEIL 男雙層透膚網紗暈染圖樣襯衫」預約訂單。訂單詳情與出貨編號將即刻寄送至您的電子郵件信箱。
              </p>
              <div className="p-3 bg-neutral-50 border border-neutral-200 max-w-sm mx-auto font-mono text-xs text-neutral-600">
                ORDER NO: <span className="font-bold text-black">#INK-2026-9042</span>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutOpen(false);
                    setOrderSuccess(false);
                  }}
                  className="px-8 py-3 bg-black text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  RETURN TO SHOWCASE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
