"use client";

// import CtaFooter from "../components/CtaFooter";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <section>
        <div className="relative mx-auto max-w-[680px] overflow-hidden rounded-3xl border border-white/6 bg-[#11131a] px-12 py-16 text-center">
          <h1 className="text-4xl font-bold">Pricing</h1>
        </div>
      </section>
      <Footer />
    </>
  );
}
