import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { VerticalScrollProgress } from "@/components/ScrollProgress";
import { PageLoader } from "@/components/PageTransition";
import { ChatBot } from "@/components/ChatBot";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Studio from "@/pages/studio";
import Admin from "@/pages/admin";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import CustomerPortal from "@/pages/customer-portal";
import Login from "@/pages/login";
import AppleCarPlayBMW from "@/pages/apple-carplay-bmw";
import OrderConfirmation from "@/pages/order-confirmation";
import Privacy from "@/pages/privacy";
import Voorwaarden from "@/pages/voorwaarden";
import Blog from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import { useState, useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          {/* Audio wave loader */}
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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Shop} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:slug" component={Product} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/studio" component={Studio} />
      <Route path="/booking" component={Studio} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      <Route path="/apple-carplay-bmw" component={AppleCarPlayBMW} />
      <Route path="/login" component={Login} />
      <Route path="/my-account" component={CustomerPortal} />
      <Route path="/admin" component={Admin} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/voorwaarden" component={Voorwaarden} />
      <Route path="/blog" component={Blog} />
      <Route path="/kenniscentrum" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    // Show initial branded loader on first page load
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
          <Toaster />
          <VerticalScrollProgress />
          <Router />
          <ChatBot />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
