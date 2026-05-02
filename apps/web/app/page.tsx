import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero column: vertical borders via container. Footer sits below with full-bleed top rule (matches header border). */}
      <div className="container flex min-h-0 flex-1 flex-col">
        <div className="border-border flex flex-1 flex-col justify-center border-b">
          <Hero />
        </div>
      </div>
      <Footer />
    </main>
  );
}
