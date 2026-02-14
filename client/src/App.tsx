import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { VerticalScrollProgress } from "@/components/ScrollProgress";
import { PageLoader } from "@/components/PageTransition";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { lazy, Suspense, useState, useEffect } from "react";

const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const Shop = lazy(() => import("@/pages/shop"));
const Product = lazy(() => import("@/pages/product"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Studio = lazy(() => import("@/pages/studio"));
const Admin = lazy(() => import("@/pages/admin"));
const About = lazy(() => import("@/pages/about"));
const FAQ = lazy(() => import("@/pages/faq"));
const Contact = lazy(() => import("@/pages/contact"));
const CustomerPortal = lazy(() => import("@/pages/customer-portal"));
const Login = lazy(() => import("@/pages/login"));
const AppleCarPlayBMW = lazy(() => import("@/pages/apple-carplay-bmw"));
const OrderConfirmation = lazy(() => import("@/pages/order-confirmation"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Voorwaarden = lazy(() => import("@/pages/voorwaarden"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));
const DemoTools = lazy(() => import("@/pages/demo-tools"));
const MigrationOptions = lazy(() => import("@/pages/migration-options"));

const Portfolio = lazy(() => import("@/pages/portfolio"));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="flex items-end justify-center gap-1 h-8 mb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-[#d0a760]/50 to-[#d0a760] rounded-full animate-audio-loader"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: '100%',
              }}
            />
          ))}
        </div>
        <p className="text-white/40 text-xs tracking-widest uppercase">Laden...</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="flex items-end justify-center gap-1 h-12 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-[#d0a760]/50 to-[#d0a760] rounded-full animate-audio-loader"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: '100%',
                }}
              />
            ))}
          </div>
          <p className="text-white/40 text-sm tracking-widest uppercase">Car Audio Limburg</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/webshop" component={Shop} />
        <Route path="/webshop/:slug" component={Product} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order-confirmation" component={OrderConfirmation} />
        <Route path="/montage" component={Studio} />
        <Route path="/over-ons" component={About} />
        <Route path="/veelgestelde-vragen" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/apple-carplay-voor-uw-bmw" component={AppleCarPlayBMW} />
        <Route path="/login" component={Login} />
        <Route path="/my-account" component={CustomerPortal} />
        <Route path="/admin" component={Admin} />
        <Route path="/privacy-policy" component={Privacy} />
        <Route path="/algemene-voorwaarden" component={Voorwaarden} />
        <Route path="/blog" component={Blog} />
        <Route path="/kenniscentrum" component={Blog} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/demo-tools" component={DemoTools} />
        <Route path="/integraties" component={DemoTools} />
        <Route path="/migration-options" component={MigrationOptions} />

        <Route path="/portfolio" component={Portfolio} />
        <Route path="/portfolio/:slug" component={Portfolio} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showInitialLoader && <PageLoader />}
        <div className="min-h-screen bg-background text-foreground">
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-3 focus:bg-[#d0a760] focus:text-black focus:font-medium focus:outline-none focus:ring-2 focus:ring-white"
          >
            Ga naar hoofdinhoud
          </a>
          <ScrollToTop />
          <Toaster />
          <VerticalScrollProgress />
          <Router />
          <Suspense fallback={null}><ChatBot /></Suspense>
          <a
            href="https://wa.me/31852733625"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-[8.5rem] md:bottom-[4.5rem] right-4 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            aria-label="Chat via WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <MobileBottomNav />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
