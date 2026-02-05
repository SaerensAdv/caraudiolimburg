import { Link } from "wouter";
import whiteLogoUrl from "@assets/CAL white_1758369495328.png";
import saerensLogoUrl from "@assets/Saerens_Advertising_1764900190628.png";
import iconLogoUrl from "@assets/CAR_1765257768308.png";
import { 
  Phone,
  Envelope,
  MapPin,
  Clock,
  InstagramLogo,
  FacebookLogo,
  YoutubeLogo
} from "@phosphor-icons/react";
import { TrustedShopsBadgeLink } from "@/components/TrustedShops";

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
                width={150}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Premium car audio systemen met professionele installatie. 
              Van OEM-upgrades tot complete audio ervaringen.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#d0a760] hover:border-[#d0a760] hover:bg-[#d0a760]/10 transition-all duration-300 hover:scale-110 hover:-translate-y-1" 
                data-testid="social-facebook"
                aria-label="Volg ons op Facebook"
              >
                <FacebookLogo weight="duotone" className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#d0a760] hover:border-[#d0a760] hover:bg-[#d0a760]/10 transition-all duration-300 hover:scale-110 hover:-translate-y-1" 
                data-testid="social-instagram"
                aria-label="Volg ons op Instagram"
              >
                <InstagramLogo weight="duotone" className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#d0a760] hover:border-[#d0a760] hover:bg-[#d0a760]/10 transition-all duration-300 hover:scale-110 hover:-translate-y-1" 
                data-testid="social-youtube"
                aria-label="Volg ons op YouTube"
              >
                <YoutubeLogo weight="duotone" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-products">
            <h4 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-6">Producten</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/webshop?category=multimedia-navigatie" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-multimedia"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Multimedia & Navigatie</span></Link></li>
              <li><Link href="/webshop?category=speakers-subwoofers" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-speakers"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Speakers & Subwoofers</span></Link></li>
              <li><Link href="/webshop?category=versterkers-dsp" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-amplifiers"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Versterkers & DSP</span></Link></li>
              <li><Link href="/webshop?category=cameras-veiligheid" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-cameras"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Cameras & Veiligheid</span></Link></li>
              <li><Link href="/webshop?brand=audison" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-audison"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Audison</span></Link></li>
              <li><Link href="/webshop?brand=alpine" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-alpine"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Alpine</span></Link></li>
            </ul>
          </div>

          {/* Services */}
          <div data-testid="footer-services">
            <h4 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/montage" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-studio"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Inbouwstudio</span></Link></li>
              <li><Link href="/apple-carplay-voor-uw-bmw" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-carplay"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">BMW/MINI CarPlay</span></Link></li>
              <li><Link href="/blog" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-blog"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Kenniscentrum</span></Link></li>
              <li><Link href="/veelgestelde-vragen" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-faq"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Veelgestelde Vragen</span></Link></li>
              <li><Link href="/over-ons" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-about"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Over Ons</span></Link></li>
              <li><Link href="/contact" className="group text-white/60 hover:text-[#d0a760] transition-all duration-300 inline-flex items-center gap-2" data-testid="footer-link-quote"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Offerte Aanvragen</span></Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div data-testid="footer-contact">
            <h4 className="text-[#d0a760] text-sm font-medium tracking-wider uppercase mb-6">Contact</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin weight="duotone" className="w-4 h-4 text-[#d0a760] mt-0.5 flex-shrink-0" />
                <div className="text-white/60">
                  <span>Dr. Nolenslaan 157c</span><br />
                  <span>6136 GM Sittard</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone weight="duotone" className="w-4 h-4 text-[#d0a760] flex-shrink-0" />
                <a href="tel:0852733625" className="text-white/60 hover:text-white transition-colors">085-27 33 625</a>
              </div>
              <div className="flex items-center space-x-3">
                <Envelope weight="duotone" className="w-4 h-4 text-[#d0a760] flex-shrink-0" />
                <a href="mailto:info@caraudiolimburg.nl" className="text-white/60 hover:text-white transition-colors">info@caraudiolimburg.nl</a>
              </div>
              <div className="flex items-start space-x-3">
                <Clock weight="duotone" className="w-4 h-4 text-[#d0a760] mt-0.5 flex-shrink-0" />
                <div className="text-white/60">
                  <p>Ma-Vr: 08:30-17:30</p>
                  <p className="text-white/40 text-xs">Op afspraak</p>
                </div>
              </div>
              
              <div className="mt-6">
                <TrustedShopsBadgeLink className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={iconLogoUrl} alt="" className="w-4 h-4" />
              <p className="text-sm text-white/40">2025 Car Audio Limburg. Alle rechten voorbehouden.</p>
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="group text-sm text-white/40 hover:text-[#d0a760] transition-all duration-300" data-testid="footer-link-privacy"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Privacy</span></Link>
              <Link href="/algemene-voorwaarden" className="group text-sm text-white/40 hover:text-[#d0a760] transition-all duration-300" data-testid="footer-link-terms"><span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-[#d0a760] after:transition-all after:duration-300 group-hover:after:w-full">Voorwaarden</span></Link>
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
          <div className="text-center mt-4 pt-4 border-t border-zinc-800/50">
            <p className="text-xs text-white/40">
              Online geschillenbeslechting:{" "}
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#d0a760] hover:underline"
                data-testid="footer-link-odr"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
