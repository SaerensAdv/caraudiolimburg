import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { BlogCTA } from "@/components/blog/BlogCTA";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { Calendar, User, ArrowRight, BookOpen, ChevronLeft, Eye } from "lucide-react";
import type { BlogPost, BlogCategory, User as UserType } from "@shared/schema";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface BlogPostWithDetails extends BlogPost {
  category?: BlogCategory | null;
  author?: Pick<UserType, 'firstName' | 'lastName' | 'profileImageUrl'> | null;
}

export default function BlogPostPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPostWithDetails>({
    queryKey: ["/api/blog/posts", slug],
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery<BlogPostWithDetails[]>({
    queryKey: ["/api/blog/posts", { categoryId: post?.categoryId, limit: 4 }],
    enabled: !!post?.categoryId,
  });

  const filteredRelatedPosts = useMemo(() => {
    return relatedPosts.filter(p => p.id !== post?.id).slice(0, 3);
  }, [relatedPosts, post?.id]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Kenniscentrum | Car Audio Limburg`;
      const description = post.metaDescription || post.excerpt || `Lees meer over ${post.title} in het Car Audio Limburg kenniscentrum.`;
      
      // Meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
      
      // Remove any existing blog-post page tags first
      document.querySelectorAll('meta[data-page="blog-post"]').forEach(tag => tag.remove());
      
      // Open Graph tags with data attribute for cleanup
      const ogTagsData = [
        { property: 'og:title', content: `${post.title} | Car Audio Limburg` },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `${window.location.origin}/blog/${post.slug}` },
        { property: 'og:image', content: post.featuredImage || `${window.location.origin}/og-image.jpg` },
        { property: 'og:site_name', content: 'Car Audio Limburg' },
        { property: 'article:published_time', content: post.publishedAt ? new Date(post.publishedAt).toISOString() : '' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${post.title} | Car Audio Limburg` },
        { name: 'twitter:description', content: description },
      ];
      
      ogTagsData.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('data-page', 'blog-post');
        if (tag.property) meta.setAttribute('property', tag.property);
        if (tag.name) meta.setAttribute('name', tag.name);
        meta.setAttribute('content', tag.content || '');
        document.head.appendChild(meta);
      });
    }
    
    return () => {
      document.title = "Car Audio Limburg";
      // Only remove tags we created
      document.querySelectorAll('meta[data-page="blog-post"]').forEach(tag => tag.remove());
    };
  }, [post]);
  
  // JSON-LD structured data
  const jsonLd = useMemo(() => {
    if (!post) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.metaDescription || post.excerpt || "",
      "image": post.featuredImage || "",
      "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : "",
      "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : "",
      "author": {
        "@type": "Organization",
        "name": "Car Audio Limburg"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Car Audio Limburg",
        "logo": {
          "@type": "ImageObject",
          "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : ""
      }
    };
  }, [post]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "d MMMM yyyy", { locale: nl });
  };

  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={index} className="text-2xl md:text-3xl font-medium text-white mt-12 mb-6">
            {paragraph.replace('# ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={index} className="text-xl md:text-2xl font-medium text-white mt-10 mb-4">
            {paragraph.replace('## ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={index} className="text-lg md:text-xl font-medium text-[#d0a760] mt-8 mb-3">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }
      if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(item => item.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside text-white/80 text-lg leading-relaxed space-y-2 mb-6 ml-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="text-white/80 text-lg leading-relaxed mb-6">
          {paragraph}
        </p>
      );
    });
  };

  const getAuthorName = (author: BlogPostWithDetails['author']) => {
    if (!author) return null;
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    if (author.firstName) return author.firstName;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <main className="pt-24 pb-16">
          <div className="container px-6 md:px-12 mx-auto max-w-4xl">
            <Skeleton className="h-6 w-64 bg-zinc-800 mb-8" />
            <Skeleton className="h-[400px] w-full bg-zinc-800 mb-8" />
            <Skeleton className="h-12 w-3/4 bg-zinc-800 mb-4" />
            <Skeleton className="h-6 w-48 bg-zinc-800 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 bg-zinc-800" />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
        <main className="pt-32 pb-16">
          <div className="container px-6 md:px-12 mx-auto text-center">
            <BookOpen className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
            <h1 className="text-3xl font-light text-white mb-4">Artikel niet gevonden</h1>
            <p className="text-white/60 mb-8">Het artikel dat je zoekt bestaat niet of is niet beschikbaar.</p>
            <Link href="/blog">
              <span className="inline-flex items-center gap-2 text-[#d0a760] hover:underline">
                <ChevronLeft className="w-4 h-4" />
                Terug naar Kenniscentrum
              </span>
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  const authorName = getAuthorName(post.author);

  return (
    <div className="min-h-screen bg-black">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header onCartOpen={() => setIsCartOpen(true)} variant="transparent" />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow">
        {/* Hero Image */}
        <section className="relative min-h-[60vh] w-full overflow-hidden">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
              data-testid="hero-image"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
          
          <div className="relative z-10 h-full min-h-[60vh] flex flex-col justify-end pb-16 pt-32">
            <div className="container px-6 md:px-12 mx-auto max-w-4xl">
              <ScrollReveal direction="up" delay={200}>
                <Breadcrumb className="mb-6" data-testid="breadcrumb-post">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/" className="text-white/60 hover:text-[#d0a760]">Home</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/40" />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/blog" className="text-white/60 hover:text-[#d0a760]">Kenniscentrum</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-white/40" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-[#d0a760] line-clamp-1">{post.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {post.category && (
                    <Badge className="bg-[#d0a760] text-black rounded-none" data-testid="badge-post-category">
                      {post.category.name}
                    </Badge>
                  )}
                  <span className="text-white/60 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.publishedAt)}
                  </span>
                  {post.viewCount !== null && post.viewCount > 0 && (
                    <span className="text-white/60 text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewCount} weergaven
                    </span>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={400}>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight" data-testid="heading-post-title">
                  {post.title}
                </h1>
              </ScrollReveal>

              {authorName && (
                <ScrollReveal direction="up" delay={500}>
                  <div className="flex items-center gap-3 mt-6" data-testid="author-info">
                    {post.author?.profileImageUrl ? (
                      <img 
                        src={post.author.profileImageUrl} 
                        alt={authorName}
                        className="w-10 h-10 rounded-none object-cover border border-[#d0a760]"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <User className="w-5 h-5 text-white/60" />
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{authorName}</p>
                      <p className="text-white/50 text-xs">Auteur</p>
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="bg-black py-12 md:py-16">
          <div className="container px-6 md:px-12 mx-auto max-w-3xl">
            <ScrollReveal>
              <article className="prose prose-invert prose-lg max-w-none" data-testid="article-content">
                {post.excerpt && (
                  <p className="text-xl text-white/90 font-light leading-relaxed mb-8 pb-8 border-b border-zinc-800">
                    {post.excerpt}
                  </p>
                )}
                
                {renderContent(post.content)}
                
                {/* CTA Section */}
                <BlogCTA variant="quote" />
              </article>
            </ScrollReveal>

            {/* Author Box */}
            {post.author && (
              <ScrollReveal delay={100}>
                <AuthorBox author={post.author} />
              </ScrollReveal>
            )}

            {/* Back to Blog Link */}
            <ScrollReveal delay={200}>
              <div className="mt-16 pt-8 border-t border-zinc-800">
                <Link href="/blog">
                  <span className="inline-flex items-center gap-2 text-[#d0a760] hover:gap-3 transition-all" data-testid="link-back-to-blog">
                    <ChevronLeft className="w-4 h-4" />
                    Terug naar Kenniscentrum
                  </span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Related Posts */}
        {filteredRelatedPosts.length > 0 && (
          <section className="bg-zinc-900 border-t border-zinc-800 py-16">
            <div className="container px-6 md:px-12 mx-auto">
              <ScrollReveal>
                <h2 className="text-2xl font-light text-white mb-8">Gerelateerde Artikelen</h2>
              </ScrollReveal>

              <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={100} data-testid="related-posts">
                {filteredRelatedPosts.map((relatedPost) => (
                  <StaggerItem key={relatedPost.id}>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <article 
                        className="group bg-zinc-800 border border-zinc-700 hover:border-[#d0a760] transition-all duration-300 h-full flex flex-col"
                        data-testid={`related-post-${relatedPost.slug}`}
                      >
                        <div className="aspect-video overflow-hidden">
                          {relatedPost.featuredImage ? (
                            <img
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                              <BookOpen className="w-10 h-10 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <span className="text-white/50 text-xs flex items-center gap-1 mb-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(relatedPost.publishedAt)}
                          </span>
                          <h3 className="text-base font-medium text-white mb-2 group-hover:text-[#d0a760] transition-colors line-clamp-2 flex-grow">
                            {relatedPost.title}
                          </h3>
                          <span className="text-[#d0a760] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-2">
                            Lees meer <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
