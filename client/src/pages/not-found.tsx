import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollAnimations";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header onCartOpen={() => {}} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold text-[#d0a760] mb-4" data-testid="text-404">
                404
              </h1>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d0a760] to-transparent mx-auto" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Pagina niet gevonden
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              De pagina die je zoekt bestaat niet of is verplaatst. 
              Ga terug naar de homepage om verder te winkelen.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button 
                  className="bg-[#d0a760] text-black hover:bg-[#b8954e] rounded-none px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                  data-testid="button-go-home"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Naar homepage
                </Button>
              </Link>
              <Button 
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white rounded-none px-8 py-6 text-lg w-full sm:w-auto"
                onClick={() => window.history.back()}
                data-testid="button-go-back"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ga terug
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-white/40 text-sm">
                Hulp nodig? Neem contact met ons op via{" "}
                <Link href="/contact">
                  <span className="text-[#d0a760] hover:underline cursor-pointer">contact</span>
                </Link>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <Footer />
    </div>
  );
}
