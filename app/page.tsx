import { Footer } from "@/components/public/footer";
import { Hero } from "@/components/public/hero";
import { Navbar } from "@/components/public/navbar";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="pb-28 pt-6">
        <Hero />
      </div>
      <Footer />
    </main>
  );
}
