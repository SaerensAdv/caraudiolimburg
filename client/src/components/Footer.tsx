import { Link } from "wouter";
import logoUrl from "@assets/Caraudiolimburg-logo_1757008375383.png";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border pt-16 pb-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div data-testid="footer-company-info">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logoUrl} 
                alt="Car Audio Limburg" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Specialist in premium car audio systemen met professionele installatie. 
              Van OEM-upgrades tot complete audio ervaring.
            </p>
            <div className="flex space-x-4">
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-youtube">
                <Youtube className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-products">
            <h4 className="font-semibold text-foreground mb-4">Producten</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop?brand=alpine" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-alpine">Alpine</Link></li>
              <li><Link href="/shop?brand=audison" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-audison">Audison</Link></li>
              <li><Link href="/shop?category=oem" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-oem">OEM-Upgrades</Link></li>
              <li><Link href="/shop?category=speakers" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-speakers">Speakers</Link></li>
              <li><Link href="/shop?category=subwoofers" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-subwoofers">Subwoofers</Link></li>
              <li><Link href="/shop?category=amplifiers" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-amplifiers">Versterkers</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div data-testid="footer-services">
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-installation">Installatie Service</Link></li>
              <li><a href="#quote" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-advice">Gratis Advies</a></li>
              <li><a href="#showroom" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-showroom">Showroom Bezoek</a></li>
              <li><a href="#quote" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-quote">Offerte Aanvragen</a></li>
              <li><a href="#warranty" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-warranty">Garantie Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div data-testid="footer-contact">
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="text-muted-foreground">
                  <span>Dr. Nolenslaan 157c</span><br />
                  <span>6136 GM Sittard</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">+31(0)85 - 27 33 625</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">info@caraudiolimburg.nl</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary" />
                <div className="text-muted-foreground">
                  <p>Ma-Vr: 9:00-18:00</p>
                  <p>Za: 9:00-17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 Car Audio Limburg. Alle rechten voorbehouden.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacybeleid</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-terms">Algemene Voorwaarden</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-cookies">Cookie Beleid</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
