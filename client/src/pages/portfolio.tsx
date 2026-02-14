import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Car, Wrench, Phone, CaretLeft, CaretRight, X, SquaresFour, SpeakerHigh, Play, Monitor, Gear } from "@phosphor-icons/react";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: string | null;
  category: string | null;
  images: string[];
  featuredImage: string | null;
  components: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
}

const CATEGORIES = [
  { id: "all", label: "Alle", icon: SquaresFour },
  { id: "soundupgrade", label: "Soundupgrade", icon: SpeakerHigh },
  { id: "carplay", label: "CarPlay", icon: Play },
  { id: "entertainment", label: "Entertainment", icon: Monitor },
  { id: "custom", label: "Custom", icon: Gear },
];

function PortfolioOverview() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const apiUrl = selectedCategory === "all" 
    ? "/api/portfolio" 
    : `/api/portfolio?category=${selectedCategory}`;

  const { data: projects, isLoading } = useQuery<PortfolioProject[]>({
    queryKey: ["/api/portfolio", selectedCategory],
    queryFn: async () => {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  const filteredProjects = projects || [];

  return (
    <div className="min-h-screen bg-black" id="main-content">
      <SEO
        title="Onze Projecten | Car Audio Limburg"
        description="Bekijk onze professionele car audio installaties. Van soundupgrades tot CarPlay retrofits - ontdek wat wij kunnen betekenen voor jouw auto."
        canonical="/portfolio"
      />
      
      <Header onCartOpen={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <nav className="bg-black pt-20 pb-4" aria-label="Breadcrumb">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="hover:text-[#d0a760] transition-colors">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Portfolio</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </nav>

      <section className="relative bg-black pt-8 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#d0a760]/5 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#d0a760]/3 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-4xl mx-auto mb-12">
              <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 px-4 py-1.5 mb-6 rounded-none">
                <Car className="w-3 h-3 mr-2" />
                Vakmanschap in beeld
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Onze <span className="text-[#d0a760]">Projecten</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
                Ontdek onze professionele car audio installaties. Van subtiele soundupgrades 
                tot complete custom builds — elk project wordt met passie en precisie uitgevoerd.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 border transition-all duration-300 ${
                      selectedCategory === cat.id
                        ? "bg-[#d0a760] border-[#d0a760] text-black"
                        : "bg-transparent border-white/20 text-white/70 hover:border-[#d0a760] hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10">
                  <Skeleton className="aspect-[4/3] w-full bg-white/10" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <Skeleton className="h-16 w-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/5 border border-white/10 flex items-center justify-center">
                <Car className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Geen projecten gevonden</h3>
              <p className="text-white/50">
                {selectedCategory !== "all"
                  ? "Er zijn nog geen projecten in deze categorie."
                  : "Er zijn nog geen projecten beschikbaar."}
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <StaggerItem key={project.id}>
                  <Link href={`/portfolio/${project.slug}`}>
                    <article className="group bg-white/[0.02] border border-white/10 hover:border-[#d0a760]/50 transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900">
                        {project.featuredImage ? (
                          <img
                            src={project.featuredImage}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <Car className="w-16 h-16 text-white/20" />
                          </div>
                        )}
                        {project.isFeatured && (
                          <Badge className="absolute top-3 left-3 bg-[#d0a760] text-black rounded-none">
                            Uitgelicht
                          </Badge>
                        )}
                        {project.category && (
                          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0 rounded-none capitalize">
                            {project.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#d0a760] transition-colors">
                          {project.title}
                        </h3>
                        
                        {(project.vehicleMake || project.vehicleModel) && (
                          <div className="flex items-center gap-2 text-sm text-[#d0a760] mb-3">
                            <Car className="w-4 h-4" />
                            <span>
                              {[project.vehicleMake, project.vehicleModel, project.vehicleYear]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        )}
                        
                        {project.shortDescription && (
                          <p className="text-white/50 text-sm line-clamp-2">
                            {project.shortDescription}
                          </p>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <span className="text-[#d0a760] text-sm font-medium group-hover:underline">
                            Bekijk project →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-b from-black to-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Zin in een eigen <span className="text-[#d0a760]">upgrade?</span>
              </h2>
              <p className="text-white/60 mb-8">
                Neem contact met ons op voor een vrijblijvend adviesgesprek. 
                Wij helpen je graag de perfecte oplossing te vinden voor jouw auto.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-[#d0a760] hover:bg-[#b8934d] text-black rounded-none h-12 px-8">
                  <Link href="/contact">
                    <Phone className="w-4 h-4 mr-2" />
                    Neem Contact Op
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none h-12 px-8">
                  <Link href="/montage">
                    Bekijk Onze Diensten
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PortfolioDetail({ slug }: { slug: string }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: project, isLoading, error } = useQuery<PortfolioProject>({
    queryKey: ["/api/portfolio", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Skeleton className="h-8 w-48 mb-8 bg-white/10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] w-full bg-white/10" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 bg-white/10" />
              <Skeleton className="h-6 w-1/2 bg-white/10" />
              <Skeleton className="h-32 w-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/5 border border-white/10 flex items-center justify-center">
              <X className="w-10 h-10 text-white/30" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Project niet gevonden</h1>
            <p className="text-white/50 mb-8">
              Het project dat je zoekt bestaat niet of is niet meer beschikbaar.
            </p>
            <Button asChild className="bg-[#d0a760] hover:bg-[#b8934d] text-black rounded-none">
              <Link href="/portfolio">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Portfolio
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = project.featuredImage
    ? [project.featuredImage, ...project.images.filter(img => img !== project.featuredImage)]
    : project.images;

  const currentImage = allImages[selectedImageIndex] || project.featuredImage;

  return (
    <div className="min-h-screen bg-black" id="main-content">
      <SEO
        title={`${project.title} | Portfolio | Car Audio Limburg`}
        description={project.shortDescription || `Bekijk dit ${project.category || 'car audio'} project voor ${project.vehicleMake || 'een'} ${project.vehicleModel || 'voertuig'}.`}
        canonical={`/portfolio/${project.slug}`}
      />
      
      <Header onCartOpen={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <nav className="bg-black pt-20 pb-4" aria-label="Breadcrumb">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="hover:text-[#d0a760] transition-colors">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/portfolio" className="hover:text-[#d0a760] transition-colors">
                    Portfolio
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{project.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </nav>

      <section className="container mx-auto px-4 pt-4 pb-16">
        <Button
          asChild
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10 mb-6 -ml-4 rounded-none"
        >
          <Link href="/portfolio">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar overzicht
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div
              className="aspect-[4/3] relative overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <Car className="w-20 h-20 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                  Klik om te vergroten
                </span>
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-[#d0a760]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${project.title} afbeelding ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {project.category && (
                <Badge className="bg-[#d0a760]/10 text-[#d0a760] border-[#d0a760]/20 mb-4 rounded-none capitalize">
                  {project.category}
                </Badge>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {project.title}
              </h1>

              {(project.vehicleMake || project.vehicleModel) && (
                <div className="flex items-center gap-2 text-lg text-[#d0a760]">
                  <Car className="w-5 h-5" />
                  <span>
                    {[project.vehicleMake, project.vehicleModel, project.vehicleYear]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
              )}
            </div>

            {project.fullDescription && (
              <div className="prose prose-invert max-w-none">
                <p className="text-white/70 leading-relaxed whitespace-pre-line">
                  {project.fullDescription}
                </p>
              </div>
            )}

            {project.components && project.components.length > 0 && (
              <div className="bg-white/[0.02] border border-white/10 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                  <Wrench className="w-5 h-5 text-[#d0a760]" />
                  Geïnstalleerde Componenten
                </h3>
                <ul className="space-y-2">
                  {project.components.map((component, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/70">
                      <span className="w-1.5 h-1.5 bg-[#d0a760] mt-2 flex-shrink-0" />
                      {component}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-r from-[#d0a760]/10 to-transparent border border-[#d0a760]/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Geïnteresseerd in een vergelijkbare installatie?
              </h3>
              <p className="text-white/60 mb-4">
                Neem contact met ons op voor een vrijblijvend adviesgesprek.
              </p>
              <Button asChild className="bg-[#d0a760] hover:bg-[#b8934d] text-black rounded-none">
                <Link href="/contact">
                  <Phone className="w-4 h-4 mr-2" />
                  Neem Contact Op
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                }}
              >
                <CaretLeft className="w-10 h-10" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                }}
              >
                <CaretRight className="w-10 h-10" />
              </button>
            </>
          )}

          <img
            src={allImages[selectedImageIndex]}
            alt={project.title}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(idx);
                  }}
                  className={`w-2 h-2 transition-all ${
                    selectedImageIndex === idx ? "bg-[#d0a760]" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Portfolio() {
  const [matchOverview] = useRoute("/portfolio");
  const [matchDetail, params] = useRoute("/portfolio/:slug");

  if (matchDetail && params?.slug) {
    return <PortfolioDetail slug={params.slug} />;
  }

  return <PortfolioOverview />;
}
