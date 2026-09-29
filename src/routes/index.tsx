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
