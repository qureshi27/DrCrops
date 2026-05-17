import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CropsGrid } from "@/components/landing/crops-grid";
import { PakistanMapPreview } from "@/components/landing/pakistan-map";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CropsGrid />
      <PakistanMapPreview />
    </>
  );
}
