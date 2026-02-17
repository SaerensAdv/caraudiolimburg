import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbSchema } from "@/components/StructuredData";
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
  DeviceMobile, 
  WifiHigh, 
  Lightning,
  Star,
  CaretDown,
  Play,
  Phone,
  Envelope,
  Shield,
  Trophy
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, CountUp } from "@/components/ScrollAnimations";
import { KentekenLookup } from "@/components/KentekenLookup";
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
      title: "Originele BMW/MINI kwaliteit",
      description: "Wij gebruiken uitsluitend OEM-software - jouw auto blijft 100% origineel"
    },
    {
      icon: <Clock className="w-6 h-6 text-[#d0a760]" />,
      title: "Snel klaar, maximaal genieten",
      description: "Binnen 30-60 minuten rij je weg met een volledig werkend systeem"
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#d0a760]" />,
      title: "Flexibele service op maat",
      description: "Wij komen naar jou toe, of ontvangen je graag in onze studio"
    }
  ];

  const features = [
    {
      icon: <DeviceMobile className="w-6 h-6" />,
      title: "Jouw iPhone, naadloos verbonden",
      description: "Geniet van navigatie, muziek en berichten via het vertrouwde iDrive scherm"
    },
    {
      icon: <WifiHigh className="w-6 h-6" />,
      title: "Draadloos gemak",
      description: "Stap in en je iPhone verbindt automatisch - geen gedoe met kabels"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Vakmanschap met garantie",
      description: "Als specialist in BMW/MINI garanderen wij perfecte OEM-kwaliteit"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Fabrieksgarantie blijft behouden",
      description: "Rijd zorgeloos verder - je garantie blijft volledig intact"
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
        alert(`✅ ${data.message}`);
        
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
    <div className="min-h-screen bg-black">
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Apple CarPlay BMW", url: "/apple-carplay-voor-uw-bmw" }
      ]} />
      <Header onCartOpen={() => setIsCartOpen(true)} logoSrc={calWhiteLogo} />
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        
        <div className="absolute inset-0">
          <img 
            src={bmwCarPlay1} 
            alt="BMW CarPlay Dashboard"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="relative z-20 container mx-auto px-4 md:px-8 lg:px-16 py-16 md:py-20 lg:py-32 flex items-center min-h-screen">
          <div className="max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 md:mb-6 bg-[#d0a760] text-black font-semibold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-none">SPECIALIST IN BMW & MINI CARPLAY</Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Apple CarPlay voor jouw{" "}
                <span className="text-[#d0a760]">BMW</span> of{" "}
                <span className="text-[#d0a760]">MINI</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-3 md:mb-4">
                Modellen vanaf 2015 – wij kennen ze allemaal
              </p>
              
              <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 max-w-2xl leading-relaxed">
                Met onze jarenlange ervaring en passie voor BMW en MINI activeren wij CarPlay vakkundig via originele software. Ontdek of jouw auto geschikt is en ervaar het gemak van naadloze smartphone integratie.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-12">
                <Button 
                  size="lg" 
                  className="bg-[#d0a760] hover:bg-[#b8954d] text-black font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-none"
                  onClick={() => document.getElementById('offerte')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-request-quote"
                >
                  Vraag nu jouw offerte aan
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-none"
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
                    <Card className="bg-zinc-900/80 border-zinc-800 hover:border-[#d0a760] transition-all duration-300 rounded-none">
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

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <CaretDown className="w-8 h-8 text-[#d0a760]" />
        </motion.div>
      </section>
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Waarom kiezen voor <span className="text-[#d0a760]">Car Audio Limburg</span>?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Als specialist in BMW en MINI weten wij precies hoe we jouw rijervaring kunnen verbeteren - met passie en vakmanschap
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={100}>
            {features.map((feature, index) => (
              <Card key={index} className="bg-zinc-900 border-zinc-800 hover:border-[#d0a760] transition-all duration-300 rounded-none">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#d0a760]/20 flex items-center justify-center mx-auto mb-4 text-[#d0a760]">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </StaggerContainer>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <ScrollReveal>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-[#d0a760]/20 text-[#d0a760] border-[#d0a760] rounded-none">
                💡 Bewezen expertise
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Al meer dan <span className="text-[#d0a760]">500 tevreden klanten</span> genieten van CarPlay
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={100}>
            {[
              { end: 500, suffix: "+", label: "Tevreden klanten" },
              { end: 60, prefix: "30-", label: "Minuten activatietijd" },
              { end: 2015, suffix: "+", label: "Ondersteunde modellen" },
              { end: 100, suffix: "%", label: "Originele software" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[#d0a760] mb-2">
                  {stat.prefix}<CountUp end={stat.end} duration={2000} />{stat.suffix}
                </div>
                <div className="text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>
      {/* Gallery Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Bekijk ons <span className="text-[#d0a760]">vakmanschap</span>
              </h2>
              <p className="text-xl text-gray-400">
                Elke activatie voeren wij uit met dezelfde toewijding - bekijk het resultaat
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <ScrollReveal direction="left">
              <div className="relative aspect-video overflow-hidden bg-zinc-800">
                <img
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {selectedImage === 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-[#d0a760] p-4 hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black" weight="fill" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-video overflow-hidden cursor-pointer transition-all duration-300 ${
                        selectedImage === index 
                          ? 'ring-2 ring-[#d0a760] scale-105' 
                          : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="bg-zinc-900 p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#d0a760]" weight="fill" />
                    ))}
                  </div>
                  <p className="text-white font-semibold mb-2">Precies zoals verwacht</p>
                  <p className="text-gray-400 text-sm">
                    "Geweldige service van Car Audio Limburg! De activatie verliep perfect en het voelt alsof CarPlay altijd in mijn auto heeft gezeten."
                  </p>
                  <p className="text-[#d0a760] text-sm mt-2">- Mark, BMW 3-serie eigenaar</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      {/* Quote Form Section */}
      <section id="offerte" className="py-16 md:py-24 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ontdek of jouw auto <span className="text-[#d0a760]">geschikt</span> is
                </h2>
                <p className="text-xl text-gray-400 mb-4">
                  Vul onderstaand formulier in en wij checken vrijblijvend of jouw BMW of MINI in aanmerking komt voor CarPlay activatie.
                </p>
                <p className="text-base text-gray-500">
                  Op deze pagina vind je ook onze CarPlay-gerelateerde producten die je direct in onze webshop kunt bestellen. Voor professionele installatie kun je terecht bij{" "}
                  <a href="https://caraudiolimburg.studio" target="_blank" rel="noopener noreferrer" className="text-[#d0a760] hover:underline">
                    caraudiolimburg.studio
                  </a>
                </p>
              </div>

              <Card className="bg-zinc-900 border-zinc-800 rounded-none">
                <CardHeader className="border-b border-zinc-800">
                  <CardTitle className="text-2xl text-white text-center">
                    Vraag vrijblijvend een offerte aan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white mb-2 font-medium">Voornaam *</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] rounded-none"
                          required
                          data-testid="input-firstname"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-medium">Achternaam *</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] rounded-none"
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
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] rounded-none"
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
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] rounded-none"
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <KentekenLookup
                      onResult={(data) => {
                        handleInputChange('model', `${data.merk} ${data.model}`);
                        handleInputChange('year', String(data.bouwjaar));
                        handleInputChange('license', data.kenteken);
                      }}
                    />

                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-zinc-700" />
                      <span className="text-zinc-500 text-xs">of vul handmatig in</span>
                      <div className="flex-1 h-px bg-zinc-700" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-white mb-2 font-medium">Model *</label>
                        <Input
                          value={formData.model}
                          onChange={(e) => handleInputChange('model', e.target.value)}
                          placeholder="bijv. BMW 3-serie, MINI Cooper"
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] placeholder:text-zinc-500 rounded-none"
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
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] rounded-none"
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
                          className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] placeholder:text-zinc-500 rounded-none"
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
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] placeholder:text-zinc-500 rounded-none"
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
                        className="bg-zinc-800 border-zinc-700 text-white focus:border-[#d0a760] min-h-[100px] placeholder:text-zinc-500 rounded-none"
                        data-testid="input-message"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#d0a760] hover:bg-[#b8954d] text-black font-semibold text-lg py-6 rounded-none"
                      data-testid="button-submit-quote"
                    >
                      <Envelope className="w-5 h-5 mr-2" />
                      Verstuur offerteverzoek
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-zinc-900">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Veelgestelde <span className="text-[#d0a760]">vragen</span>
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    id: "geschikt",
                    question: "Hoe weet ik of mijn auto geschikt is?",
                    answer: "Dat zoeken wij graag voor je uit! Stuur ons je chassisnummer (VIN) en wij controleren direct of jouw BMW of MINI geschikt is voor CarPlay activatie. Binnen korte tijd ontvang je van ons een eerlijk en vrijblijvend advies."
                  },
                  {
                    id: "wifi",
                    question: "Wat als mijn auto geen Wi-Fi heeft?",
                    answer: "Geen zorgen! Wi-Fi is geen vereiste voor CarPlay. Wij kunnen ook bekabelde CarPlay activeren, waarbij je je iPhone simpelweg via USB aansluit. Beide opties werken uitstekend - wij adviseren je graag welke het beste bij jouw situatie past."
                  },
                  {
                    id: "draadloos",
                    question: "Kan het draadloos of met kabel?",
                    answer: "Beide opties zijn mogelijk en werken perfect. Draadloze CarPlay biedt maximaal gemak - je iPhone verbindt automatisch zodra je instapt. Bekabelde CarPlay via USB is de meest stabiele optie en laadt tegelijk je telefoon op. Wij bespreken graag wat het beste werkt voor jouw auto."
                  },
                  {
                    id: "updates",
                    question: "Blijft CarPlay actief na updates?",
                    answer: "Absoluut! De activatie blijft behouden na software-updates van zowel je iPhone als het BMW/MINI systeem. Mocht je ooit toch een vraag hebben na een update, dan staan wij altijd voor je klaar met persoonlijke ondersteuning."
                  }
                ].map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-zinc-800 border-zinc-700 px-6"
                  >
                    <AccordionTrigger className="text-white hover:text-[#d0a760] text-left py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Wij staan voor je <span className="text-[#d0a760]">klaar</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Voor professionele CarPlay installatie door onze specialisten bezoek je{" "}
                <a href="https://caraudiolimburg.studio" target="_blank" rel="noopener noreferrer" className="text-[#d0a760] hover:underline font-semibold">
                  caraudiolimburg.studio
                </a>
              </p>
              
              <StaggerContainer className="grid md:grid-cols-2 gap-8 mt-12" staggerDelay={150}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-[#d0a760] transition-all duration-300 rounded-none">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-[#d0a760]/20 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-6 h-6 text-[#d0a760]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Bezoek onze studio</h3>
                    <p className="text-gray-400 mb-4">
                      Dr. Nolenslaan 157c<br />
                      6136 GM Sittard
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      Ervaar onze expertise en bekijk de mogelijkheden voor jouw BMW of MINI
                    </p>
                    <a href="https://caraudiolimburg.studio/offerte-aanvragen/" target="_blank" rel="noopener noreferrer">
                      <Button 
                        variant="outline" 
                        className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black rounded-none"
                        data-testid="button-visit-showroom"
                      >
                        Offerte aanvragen bij studio
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 hover:border-[#d0a760] transition-all duration-300 rounded-none">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-[#d0a760]/20 flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6 text-[#d0a760]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Persoonlijk advies</h3>
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
                    <p className="text-gray-500 text-sm mb-4">
                      Wij helpen je graag met al je vragen over CarPlay
                    </p>
                    <Button 
                      className="bg-[#d0a760] hover:bg-[#b8954d] text-black rounded-none"
                      data-testid="button-call-direct"
                      onClick={() => window.location.href = 'tel:+31852733625'}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Bel ons direct
                    </Button>
                  </CardContent>
                </Card>
              </StaggerContainer>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
