import { Link } from "wouter";
import whiteLogoUrl from "@assets/CAL white_1758369495328.png";
import saerensLogoUrl from "@assets/Saerens_Advertising_1764900190628.png";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";
import { EqualizerBars } from "@/components/EqualizerBars";

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 pt-20 pb-10">
      <div className="container px-8 md:px-16 lg:px-24 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div data-testid="footer-company-info">
            <div className="mb-6">
              <img 
                src={whiteLogoUrl} 
                alt="Car Audio Limburg" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Premium car audio systemen met professionele installatie. 
              Van OEM-upgrades tot complete audio ervaringen.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#d0a760] transition-all duration-300 hover:scale-110" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#d0a760] transition-all duration-300 hover:scale-110" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#d0a760] transition-all duration-300 hover:scale-110" data-testid="social-youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-products">
            <h4 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-6">Producten</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products?category=multimedia-navigatie" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-multimedia">Multimedia & Navigatie</Link></li>
              <li><Link href="/products?category=speakers-subwoofers" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-speakers">Speakers & Subwoofers</Link></li>
              <li><Link href="/products?category=versterkers-dsp" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-amplifiers">Versterkers & DSP</Link></li>
              <li><Link href="/products?category=cameras-veiligheid" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-cameras">Cameras & Veiligheid</Link></li>
              <li><Link href="/products?brand=audison" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-audison">Audison</Link></li>
              <li><Link href="/products?brand=alpine" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-alpine">Alpine</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div data-testid="footer-services">
            <h4 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/studio" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-studio">Inbouwstudio</Link></li>
              <li><Link href="/apple-carplay-bmw" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-carplay">BMW/MINI CarPlay</Link></li>
              <li><Link href="/blog" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-blog">Kenniscentrum</Link></li>
              <li><Link href="/faq" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-faq">Veelgestelde Vragen</Link></li>
              <li><Link href="/about" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-about">Over Ons</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-block hover:translate-x-1" data-testid="footer-link-quote">Offerte Aanvragen</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div data-testid="footer-contact">
            <h4 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-6">Contact</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#d0a760] mt-0.5 flex-shrink-0" />
                <div className="text-white/60">
                  <span>Dr. Nolenslaan 157c</span><br />
                  <span>6136 GM Sittard</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#d0a760] flex-shrink-0" />
                <a href="tel:0852733625" className="text-white/60 hover:text-white transition-colors">085-27 33 625</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#d0a760] flex-shrink-0" />
                <a href="mailto:info@caraudiolimburg.nl" className="text-white/60 hover:text-white transition-colors">info@caraudiolimburg.nl</a>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-[#d0a760] mt-0.5 flex-shrink-0" />
                <div className="text-white/60">
                  <p>Ma-Vr: 08:30-17:30</p>
                  <p className="text-white/40 text-xs">Op afspraak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <EqualizerBars size="xs" animated={false} />
              <p className="text-sm text-white/40">© 2025 Car Audio Limburg. Alle rechten voorbehouden.</p>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-white/40 hover:text-[#d0a760] transition-all duration-300" data-testid="footer-link-privacy">Privacy</Link>
              <Link href="/voorwaarden" className="text-sm text-white/40 hover:text-[#d0a760] transition-all duration-300" data-testid="footer-link-terms">Voorwaarden</Link>
              <span className="text-white/20">|</span>
              <a 
                href="https://saerens.agency" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-all duration-300 group"
                data-testid="footer-link-saerens"
              >
                <span>Website by</span>
                <img 
                  src={saerensLogoUrl} 
                  alt="Saerens Agency" 
                  className="h-4 w-auto opacity-50 group-hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
