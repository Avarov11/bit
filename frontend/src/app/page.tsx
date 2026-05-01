import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export default function HomePage() {
  return (
    <main>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center pt-24 md:pt-28 pb-14 px-6"
        style={{ backgroundColor: "#C896A0" }}
      >
        <h1 className="font-playfair text-[2.75rem] md:text-[4.5rem] font-bold text-[#1A0A0A] text-center leading-[1.08] mb-8">
          Biteez Gifting<br />Bakery
        </h1>

        <div className="relative w-full max-w-[300px] md:max-w-[420px] aspect-square mb-8">
          <Image
            src="https://images.unsplash.com/photo-1607920592519-bab2a80efd81?w=800&q=80"
            alt="Biteez brownie gift box"
            fill
            className="object-cover rounded-[28px] shadow-warm-xl"
            priority
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-[360px] mb-5">
          <Link
            href="/menu"
            className="bg-white rounded-2xl px-4 py-4 shadow-warm-sm hover:shadow-warm-md transition-shadow"
          >
            <p className="font-semibold text-[#1A0A0A] text-sm leading-tight">Curated Selections</p>
            <p className="text-[#9E7B7B] text-xs mt-1.5">Custom-gifting brownies</p>
          </Link>
          <Link
            href="/menu"
            className="bg-white rounded-2xl px-4 py-4 shadow-warm-sm hover:shadow-warm-md transition-shadow"
          >
            <p className="font-semibold text-[#1A0A0A] text-sm leading-tight">Biteez Classics</p>
            <p className="text-[#9E7B7B] text-xs mt-1.5">Custom-sized brownies</p>
          </Link>
        </div>

        <Link
          href="/menu"
          className="w-full max-w-[360px] bg-[#3D0A14] hover:bg-[#2D0810] text-white font-semibold text-sm text-center py-4 rounded-full transition-colors duration-200 active:scale-[0.97]"
        >
          Customise Your Treats
        </Link>
      </section>


      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[#1A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-5">
              <div className="flex items-center gap-1 mb-5">
                <span className="font-playfair text-3xl font-bold text-white">Biteez</span>
                <span className="w-2 h-2 rounded-full bg-gold mt-1.5" />
              </div>
              <p className="text-white/45 leading-relaxed text-sm max-w-xs">
                Premium handcrafted brownies made with love and the finest
                ingredients. Every bite tells a story of passion and craft.
              </p>
              <div className="flex gap-4 mt-6">
                {["Instagram", "Facebook", "TikTok"].map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-semibold tracking-widest text-white/30 uppercase hover:text-gold transition-colors cursor-pointer"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white/35 mb-5">
                Navigate
              </h4>
              <ul className="space-y-3">
                {["Home", "Menu", "About", "Contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href="/"
                      className="text-white/45 hover:text-gold transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white/35 mb-5">
                Visit Us
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-white/45 text-sm">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gold/70" />
                  123 Dessert Lane, Beirut, Lebanon
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Mail size={14} className="shrink-0 text-gold/70" />
                  hello@biteez.com
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Phone size={14} className="shrink-0 text-gold/70" />
                  +961 1 234 567
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/25 text-xs">© 2024 Biteez. All rights reserved.</p>
            <p className="text-white/25 text-xs">Crafted with love ♥</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
