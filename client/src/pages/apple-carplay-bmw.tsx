import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Smartphone, 
  Wifi, 
  Zap,
  Star,
  ChevronDown,
  Play,
  Phone,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";
import bmwCarPlay1 from "@assets/bmw-carplay-1.jpg";
import bmwCarPlay2 from "@assets/bmw-carplay-2.jpg";
import bmwCarPlay3 from "@assets/bmw-carplay-3.jpg";
import bmwCarPlay4 from "@assets/bmw-carplay-4.jpg";
import bmwCarPlayVideo from "@assets/bmw-carplay-video.jpg";
import calWhiteLogo from "@assets/cal-white-logo.png";

export default function AppleCarPlayBMW() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    model: "",
    year: "",
    license: "",
    vin: ""
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const galleryImages = [
    { src: bmwCarPlay1, alt: "BMW CarPlay Installatie 1" },
    { src: bmwCarPlay2, alt: "BMW CarPlay Installatie 2" },
    { src: bmwCarPlay3, alt: "BMW CarPlay Installatie 3" },
    { src: bmwCarPlay4, alt: "BMW CarPlay Installatie 4" },
    { src: bmwCarPlayVideo, alt: "BMW CarPlay Video Still" }
  ];

  const benefits = [
    {
      icon: <CheckCircle className="w-6 h-6 text-[#d0a760]" />,
      title: "OEM-software, geen hardware nodig",
      description: "Gebruik van originele BMW/MINI software"
    },
    {
      icon: <Clock className="w-6 h-6 text-[#d0a760]" />,
      title: "Klaar binnen 30–60 minuten",
      description: "Snelle activatie zonder hardware aanpassingen"
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#d0a760]" />,
      title: "Activatie op locatie mogelijk",
      description: "In onze werkplaats of bij u thuis/kantoor"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/bmw-carplay-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show confirmation message
        alert(`✅ ${data.message}`);
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          message: "",
          model: "",
          year: "",
          license: "",
          vin: ""
        });
      } else {
        // Error - show error message
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("❌ Er is een netwerkfout opgetreden. Controleer je internetverbinding en probeer het opnieuw.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Header onCartOpen={() => setIsCartOpen(true)} logoSrc={calWhiteLogo} />
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={bmwCarPlay1} 
            alt="BMW CarPlay Dashboard"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="relative z-20 container mx-auto px-4 py-16 md:py-20 lg:py-32 flex items-center min-h-screen">
          <div className="max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 md:mb-6 bg-[#d0a760] text-black font-semibold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
                ✨ PREMIUM BMW & MINI SERVICE
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Apple CarPlay voor jouw{" "}
                <span className="text-[#d0a760]">BMW</span> of{" "}
                <span className="text-[#d0a760]">MINI</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-3 md:mb-4">
                (2015 – heden)
              </p>
              
              <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 max-w-2xl leading-relaxed">
                Snel, voordelig en zonder hardware – check direct of jouw auto geschikt is via chassisnummer.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                <Button 
                  size="lg" 
                  className="bg-[#d0a760] hover:bg-[#b8954d] text-black font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                  onClick={() => document.getElementById('offerte')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-request-quote"
                >
                  Vraag nu jouw offerte aan
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                  data-testid="button-call-now"
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  085 - 27 33 625
                </Button>
              </div>

              {/* Benefits Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card className="bg-gray-900/80 border-gray-800 hover:border-[#d0a760] transition-all duration-300">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start space-x-3 md:space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {benefit.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">
                              {benefit.title}
                            </h3>
                            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-[#d0a760]" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760]">
              💡 Wist je dat...
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Al meer dan <span className="text-[#d0a760]">500 auto's</span> via onze software CarPlay actief gebruiken?
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Geactiveerde voertuigen" },
              { number: "30-60", label: "Minuten installatietijd" },
              { number: "2015+", label: "BMW & MINI modellen" },
              { number: "100%", label: "OEM software" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-[#d0a760] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Bekijk onze <span className="text-[#d0a760]">installaties</span>
            </h2>
            <p className="text-xl text-gray-400">
              Professioneel geactiveerd in BMW en MINI voertuigen
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-800">
                <img
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {selectedImage === 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-[#d0a760] rounded-full p-4 hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black" fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedImage === index 
                        ? 'ring-2 ring-[#d0a760] scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-5 h-5 text-[#d0a760] fill-current" />
                  <Star className="w-5 h-5 text-[#d0a760] fill-current" />
                  <Star className="w-5 h-5 text-[#d0a760] fill-current" />
                  <Star className="w-5 h-5 text-[#d0a760] fill-current" />
                  <Star className="w-5 h-5 text-[#d0a760] fill-current" />
                </div>
                <p className="text-white font-semibold mb-2">Perfecte integratie</p>
                <p className="text-gray-400 text-sm">
                  "Werkt vlekkeloos in mijn BMW 3-serie. Lijkt alsof het er altijd heeft gezeten!"
                </p>
                <p className="text-[#d0a760] text-sm mt-2">- Mark, BMW 3-serie eigenaar</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="offerte" className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Komt jouw auto in <span className="text-[#d0a760]">aanmerking</span>?
              </h2>
              <p className="text-xl text-gray-400">
                Vul onderstaand formulier in en wij laten je weten of jouw BMW of MINI geschikt is.
              </p>
            </div>

            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">
                  Vraag jouw gratis offerte aan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2 font-medium">Voornaam *</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        required
                        data-testid="input-firstname"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">Achternaam *</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        required
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2 font-medium">Telefoonnummer *</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        required
                        data-testid="input-phone"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">E-mail *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-white mb-2 font-medium">Model *</label>
                      <Input
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="bijv. BMW 3-serie, MINI Cooper"
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        required
                        data-testid="input-model"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">Bouwjaar *</label>
                      <Input
                        type="number"
                        min="2015"
                        max="2025"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        required
                        data-testid="input-year"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">Kenteken</label>
                      <Input
                        value={formData.license}
                        onChange={(e) => handleInputChange('license', e.target.value)}
                        placeholder="XX-XXX-XX"
                        className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                        data-testid="input-license"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">VIN-nummer (chassisnummer) *</label>
                    <Input
                      value={formData.vin}
                      onChange={(e) => handleInputChange('vin', e.target.value)}
                      placeholder="17 karakters, bijv. WBAVA31050FY12345"
                      className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760]"
                      maxLength={17}
                      required
                      data-testid="input-vin"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Het VIN-nummer is nodig om exact te bepalen welke software jouw auto heeft
                    </p>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">Aanvullende informatie</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Eventuele extra informatie of vragen..."
                      className="bg-gray-800 border-gray-700 text-white focus:border-[#d0a760] min-h-[100px]"
                      data-testid="input-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#d0a760] hover:bg-[#b8954d] text-black font-semibold text-lg py-4"
                    data-testid="button-submit-quote"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Verstuur offerteverzoek
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Veelgestelde <span className="text-[#d0a760]">vragen</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  id: "geschikt",
                  question: "Hoe weet ik of mijn auto geschikt is?",
                  answer: "Je auto is geschikt als het originele multimediasysteem compatibel is met Apple CarPlay of Android Auto. Controleer dit eenvoudig in de handleiding van je auto, op de website van de fabrikant of door je systeem aan te zetten en te kijken of CarPlay/Android Auto als optie beschikbaar is. Twijfel je? Stuur ons het merk, model en bouwjaar van je auto, dan zoeken wij het voor je uit."
                },
                {
                  id: "wifi",
                  question: "Wat als mijn auto geen Wi-Fi heeft?",
                  answer: "Geen probleem! Wi-Fi is niet vereist om gebruik te maken van CarPlay of Android Auto. Onze systemen werken ook zonder ingebouwde Wi-Fi en gebruiken de verbinding van je smartphone om de functies mogelijk te maken."
                },
                {
                  id: "draadloos",
                  question: "Kan het draadloos of met kabel?",
                  answer: "Ja, beide opties zijn mogelijk. Je kunt kiezen voor een draadloze verbinding via Bluetooth/Wi-Fi of een bekabelde verbinding via USB, afhankelijk van wat jouw auto ondersteunt en waar je voorkeur ligt. We adviseren een bekabelde verbinding voor de meest stabiele prestaties."
                },
                {
                  id: "updates",
                  question: "Blijft CarPlay actief na updates?",
                  answer: "Ja, CarPlay blijft actief na software-updates van je iPhone of Android-apparaat. Ook updates aan het multimediasysteem zelf hebben normaal gezien geen invloed op de werking. Mocht er toch een probleem optreden na een update, helpen we je graag verder met een oplossing."
                }
              ].map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="bg-gray-800 border-gray-700 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-white hover:text-[#d0a760] text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Kom langs op afspraak, of bezoek onze <span className="text-[#d0a760]">showroom</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="bg-gray-900 border-gray-800 hover:border-[#d0a760] transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">Bezoek onze showroom</h3>
                  <p className="text-gray-400 mb-4">
                    Dr. Nolenslaan 157c<br />
                    6136 GM Sittard
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black"
                    data-testid="button-visit-showroom"
                  >
                    Route plannen
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:border-[#d0a760] transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Phone className="w-12 h-12 text-[#d0a760] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">Direct contact</h3>
                  <p className="text-gray-400 mb-2">
                    <a href="tel:+31852733625" className="hover:text-[#d0a760] transition-colors">
                      +31 (0)85 - 27 33 625
                    </a>
                  </p>
                  <p className="text-gray-400 mb-4">
                    <a href="mailto:info@caraudiolimburg.nl" className="hover:text-[#d0a760] transition-colors">
                      info@caraudiolimburg.nl
                    </a>
                  </p>
                  <Button 
                    className="bg-[#d0a760] hover:bg-[#b8954d] text-black"
                    data-testid="button-call-direct"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Nu bellen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}