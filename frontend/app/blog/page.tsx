"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Blog() {
  return (
    <>
      <Navbar />
      <section>
        <div className="relative mx-auto max-w-[680px] overflow-hidden rounded-3xl border border-white/6 bg-[#11131a] px-12 py-16 text-center">
          <h1 className="text-4xl font-bold">Blog</h1>
        </div>
      </section>
      <Footer />
    </>
  );
}
