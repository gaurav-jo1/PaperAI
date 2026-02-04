import Navbar from "./components/Navbar";
import Hero from "./components/home/Hero";
import StatsStrip from "./components/home/StatsStrip";
import HowItWorks from "./components/home/HowItWorks";
import Features from "./components/home/Features";
import Cta from "./components/home/Cta";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <Features />
      <Cta />
      <Footer />
    </>
  );
}
