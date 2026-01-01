import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/StructuredData";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { Calendar, ArrowRight, BookOpen, ChevronRight, Star } from "lucide-react";
import type { BlogPost, BlogCategory } from "@shared/schema";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface BlogPostWithCategory extends BlogPost {
  category?: BlogCategory | null;
}

export default function Blog() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visiblePosts, setVisiblePosts] = useState(9);
  const searchString = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(searchString || '');
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchString]);


  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPostWithCategory[]>({
    queryKey: ["/api/blog/posts", { categoryId: selectedCategory !== "all" ? selectedCategory : undefined }],
  });

  const featuredPosts = useMemo(() => {
    return posts.filter(post => post.isFeatured);
  }, [posts]);

  const regularPosts = useMemo(() => {
    return posts.filter(post => !post.isFeatured);
  }, [posts]);

  const displayPosts = regularPosts.slice(0, visiblePosts);
  const hasMorePosts = regularPosts.length > visiblePosts;

  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 6);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "d MMMM yyyy", { locale: nl });
  };

  const getCategoryById = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-black">
      <SEO 
        title="Blog & Kenniscentrum | Car Audio Tips & Nieuws"
        description="Ontdek alles over car audio in ons kenniscentrum. Tips, handleidingen en expertise over speakers, versterkers, installatie en meer."
        canonical="/blog"
        keywords="car audio blog, car audio tips, speakers, versterkers, installatie handleiding"
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" }
      ]} />
      
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] w-full overflow-hidden bg-gradient-to-b from-zinc-900 to-black pt-32 pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d0a760]/10 via-transparent to-transparent" />
          
          <div className="relative z-10 container px-6 md:px-12 mx-auto">
            <ScrollReveal direction="up" delay={200}>
              <Breadcrumb className="mb-8" data-testid="breadcrumb-blog">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="text-white/60 hover:text-[#d0a760]">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/40" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[#d0a760]">Kenniscentrum</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-[#d0a760]" />
                <span className="text-[#d0a760] text-sm font-medium tracking-wider uppercase">Car Audio Kennis</span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6" data-testid="heading-blog-title">
                Kenniscentrum
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={500}>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed" data-testid="text-blog-subtitle">
                Ontdek alles over car audio: van installatietips tot productgidsen. 
                Deel in onze expertise en haal het maximale uit jouw auto audio systeem.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Category Filter Pills */}
        <section className="bg-black border-b border-zinc-800 sticky top-16 z-30">
          <div className="container px-6 md:px-12 mx-auto py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide" data-testid="category-filters">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-none border ${
                  selectedCategory === "all"
                    ? "bg-[#d0a760] text-black border-[#d0a760]"
                    : "bg-transparent text-white/70 border-zinc-700 hover:border-[#d0a760] hover:text-white"
                }`}
                data-testid="filter-all"
              >
                Alle Artikelen
              </button>
              {categoriesLoading ? (
                <>
                  <Skeleton className="h-10 w-24 bg-zinc-800" />
                  <Skeleton className="h-10 w-28 bg-zinc-800" />
                  <Skeleton className="h-10 w-20 bg-zinc-800" />
                </>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-none border ${
                      selectedCategory === category.id
                        ? "bg-[#d0a760] text-black border-[#d0a760]"
                        : "bg-transparent text-white/70 border-zinc-700 hover:border-[#d0a760] hover:text-white"
                    }`}
                    data-testid={`filter-category-${category.slug}`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <section className="bg-zinc-900 py-16">
            <div className="container px-6 md:px-12 mx-auto">
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-8">
                  <Star className="w-5 h-5 text-[#d0a760]" />
                  <h2 className="text-2xl font-light text-white">Uitgelichte Artikelen</h2>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-6" data-testid="featured-posts">
                {featuredPosts.slice(0, 2).map((post, index) => {
                  const category = getCategoryById(post.categoryId);
                  return (
                    <ScrollReveal key={post.id} direction="up" delay={index * 100}>
                      <Link href={`/blog/${post.slug}`}>
                        <article 
                          className="group relative h-[400px] overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-[#d0a760] transition-all duration-300"
                          data-testid={`featured-post-${post.slug}`}
                        >
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              {category && (
                                <Badge className="bg-[#d0a760] text-black rounded-none text-xs" data-testid={`badge-category-${category.slug}`}>
                                  {category.name}
                                </Badge>
                              )}
                              <span className="text-white/60 text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.publishedAt)}
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-medium text-white mb-2 group-hover:text-[#d0a760] transition-colors">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-white/70 text-sm line-clamp-2 mb-4">
                                {post.excerpt}
                              </p>
                            )}
                            <span className="text-[#d0a760] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Lees meer <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </article>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="bg-black py-16 md:py-24">
          <div className="container px-6 md:px-12 mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl font-light text-white mb-8">
                {selectedCategory === "all" ? "Alle Artikelen" : "Artikelen"}
              </h2>
            </ScrollReveal>

            {postsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="posts-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800">
                    <Skeleton className="h-48 w-full bg-zinc-800" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-20 bg-zinc-800" />
                      <Skeleton className="h-6 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                      <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayPosts.length === 0 ? (
              <div className="text-center py-16" data-testid="no-posts">
                <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-white/60 text-lg">Nog geen artikelen beschikbaar in deze categorie.</p>
              </div>
            ) : (
              <>
                <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={100} data-testid="posts-grid">
                  {displayPosts.map((post) => {
                    const category = getCategoryById(post.categoryId);
                    return (
                      <StaggerItem key={post.id}>
                        <Link href={`/blog/${post.slug}`}>
                          <article 
                            className="group bg-zinc-900 border border-zinc-800 hover:border-[#d0a760] transition-all duration-300 h-full flex flex-col"
                            data-testid={`post-card-${post.slug}`}
                          >
                            <div className="aspect-video overflow-hidden">
                              {post.featuredImage ? (
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-zinc-700" />
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                              <div className="flex items-center gap-3 mb-3">
                                {category && (
                                  <Badge className="bg-zinc-800 text-[#d0a760] border border-[#d0a760]/30 rounded-none text-xs">
                                    {category.name}
                                  </Badge>
                                )}
                                <span className="text-white/50 text-xs flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(post.publishedAt)}
                                </span>
                              </div>
                              <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#d0a760] transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              {post.excerpt && (
                                <p className="text-white/60 text-sm line-clamp-3 mb-4 flex-grow">
                                  {post.excerpt}
                                </p>
                              )}
                              <span className="text-[#d0a760] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                                Lees meer <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </article>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>

                {hasMorePosts && (
                  <ScrollReveal delay={300}>
                    <div className="text-center mt-12">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        className="border-[#d0a760] text-[#d0a760] hover:bg-[#d0a760] hover:text-black rounded-none px-8"
                        data-testid="button-load-more"
                      >
                        Meer artikelen laden
                      </Button>
                    </div>
                  </ScrollReveal>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-zinc-900 border-t border-zinc-800 py-16">
          <div className="container px-6 md:px-12 mx-auto text-center">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
                Vragen over car audio?
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
                Ons team staat klaar om al je vragen te beantwoorden en je te helpen met het perfecte audio systeem.
              </p>
              <Link href="/contact">
                <Button 
                  className="bg-[#d0a760] text-black hover:bg-[#d0a760]/90 rounded-none px-8"
                  data-testid="button-contact-cta"
                >
                  Neem contact op
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
