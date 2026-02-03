import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsStrip from "./components/StatsStrip";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import CtaFooter from "./components/CtaFooter";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <Features />
      <CtaFooter />
    </>
  );
}
