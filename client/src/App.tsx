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
          <main id="main-content">
            <Router />
          </main>
          <Suspense fallback={null}><ChatBot /></Suspense>
          <MobileBottomNav />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
