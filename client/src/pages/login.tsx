import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AudioLoadingSpinner } from "@/components/AudioSkeletons";
import { Mail, Lock, ArrowLeft, User, Volume2, Headphones, Speaker } from "lucide-react";

import calLogo from "@assets/cal-white-logo.png";
import calLogoDark from "@assets/Caraudiolimburg-logo_1757008375383.png";

const loginSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 karakters bevatten"),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().min(2, "Voornaam moet minimaal 2 karakters bevatten"),
  lastName: z.string().min(2, "Achternaam moet minimaal 2 karakters bevatten"),
  confirmPassword: z.string().min(6, "Bevestig uw wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welkom terug!",
        description: "Je bent succesvol ingelogd.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Inloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Account aangemaakt!",
        description: "Welkom bij Car Audio Limburg.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registratie mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const currentForm = isRegistering ? registerForm : loginForm;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="h-screen h-[100svh] overflow-hidden flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col overflow-y-auto lg:overflow-hidden">
        {/* Back Button */}
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-none"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-0">
          <div className="w-full max-w-md">
            {/* Logo - visible on mobile only */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/">
                <img 
                  src={calLogoDark} 
                  alt="Car Audio Limburg" 
                  loading="lazy"
                  decoding="async"
                  className="h-10 mx-auto cursor-pointer"
                  data-testid="img-logo-mobile"
                />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2">
                {isRegistering ? "Account Aanmaken" : "Inloggen"}
              </h1>
              <p className="text-zinc-500 text-sm">
                {isRegistering 
                  ? "Maak een account aan om te beginnen met winkelen" 
                  : "Welkom terug! Log in om door te gaan"
                }
              </p>
            </div>

            {/* Form */}
            <form 
              onSubmit={isRegistering 
                ? registerForm.handleSubmit(onRegisterSubmit)
                : loginForm.handleSubmit(onLoginSubmit)
              }
              className="space-y-4"
            >
              {isRegistering && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-zinc-700 text-sm font-medium">Voornaam</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="firstName"
                        {...registerForm.register("firstName")}
                        disabled={isLoading}
                        className="pl-10 py-5 bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 focus:bg-white transition-all duration-300"
                        placeholder="Voornaam"
                        data-testid="input-firstName"
                      />
                    </div>
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {registerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-zinc-700 text-sm font-medium">Achternaam</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="lastName"
                        {...registerForm.register("lastName")}
                        disabled={isLoading}
                        className="pl-10 py-5 bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 focus:bg-white transition-all duration-300"
                        placeholder="Achternaam"
                        data-testid="input-lastName"
                      />
                    </div>
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {registerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-zinc-700 text-sm font-medium">E-mailadres</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    {...(isRegistering ? registerForm.register("email") : loginForm.register("email"))}
                    disabled={isLoading}
                    className="pl-10 py-5 bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 focus:bg-white transition-all duration-300"
                    placeholder="uw@email.nl"
                    data-testid="input-email"
                  />
                </div>
                {currentForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {currentForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-zinc-700 text-sm font-medium">Wachtwoord</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="password"
                    type="password"
                    {...(isRegistering ? registerForm.register("password") : loginForm.register("password"))}
                    disabled={isLoading}
                    className="pl-10 py-5 bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 focus:bg-white transition-all duration-300"
                    placeholder="••••••••"
                    data-testid="input-password"
                  />
                </div>
                {currentForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {currentForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {isRegistering && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-zinc-700 text-sm font-medium">Bevestig Wachtwoord</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerForm.register("confirmPassword")}
                      disabled={isLoading}
                      className="pl-10 py-5 bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1 focus:bg-white transition-all duration-300"
                      placeholder="••••••••"
                      data-testid="input-confirmPassword"
                    />
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              {!isRegistering && (
                <div className="flex justify-end">
                  <Link href="/forgot-password">
                    <Button
                      type="button"
                      variant="link"
                      className="text-[#d0a760] hover:text-[#b8954e] p-0 h-auto text-sm font-medium"
                      data-testid="link-forgot-password"
                    >
                      Wachtwoord vergeten?
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 text-base bg-[#d0a760] text-black hover:bg-[#b8954e] font-semibold rounded-none mt-2 transition-all duration-300"
                disabled={isLoading}
                data-testid={`button-${isRegistering ? 'register' : 'login'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <AudioLoadingSpinner size="sm" className="mr-3" />
                    {isRegistering ? "Account aanmaken..." : "Inloggen..."}
                  </div>
                ) : (
                  isRegistering ? "Account Aanmaken" : "Inloggen"
                )}
              </Button>
            </form>

            {/* Toggle Form */}
            <div className="mt-6 text-center">
              <p className="text-zinc-500 text-sm">
                {isRegistering ? "Heeft u al een account?" : "Nog geen account?"}
                <Button
                  variant="link"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    loginForm.reset();
                    registerForm.reset();
                  }}
                  className="text-[#d0a760] hover:text-[#b8954e] p-0 h-auto ml-1 font-semibold"
                  data-testid="button-toggle-form"
                >
                  {isRegistering ? "Inloggen" : "Account aanmaken"}
                </Button>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-xs">
                Door in te loggen gaat u akkoord met onze{" "}
                <Link href="/algemene-voorwaarden" className="text-[#d0a760] hover:underline">
                  Algemene Voorwaarden
                </Link>{" "}
                en{" "}
                <Link href="/privacy-policy" className="text-[#d0a760] hover:underline">
                  Privacybeleid
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-3/5 bg-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #d0a760 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Animated gradient orb */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#d0a760]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#d0a760]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          {/* Logo */}
          <Link href="/">
            <img 
              src={calLogo} 
              alt="Car Audio Limburg" 
              loading="lazy"
              decoding="async"
              className="h-14 mb-12 cursor-pointer"
              data-testid="img-logo"
            />
          </Link>

          {/* Icon Display */}
          <div className="relative mb-12">
            <div className="w-32 h-32 border-2 border-[#d0a760]/30 flex items-center justify-center">
              <div className="w-24 h-24 border border-[#d0a760]/50 flex items-center justify-center">
                <Volume2 className="w-12 h-12 text-[#d0a760]" />
              </div>
            </div>
            {/* Floating icons */}
            <div className="absolute -top-4 -right-4 p-3 bg-[#d0a760] text-black">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-4 -left-4 p-3 bg-zinc-800 text-[#d0a760]">
              <Speaker className="w-5 h-5" />
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl font-light text-white text-center mb-4">
            Premium Car Audio
          </h2>
          <p className="text-white/50 text-center max-w-sm mb-8">
            Met passie voor auto's en muziek. Ontdek de beste audio-upgrades voor jouw voertuig.
          </p>

          {/* Features */}
          <div className="flex gap-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#d0a760]" />
              <span>Gratis Advies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#d0a760]" />
              <span>Vakkundige Montage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#d0a760]" />
              <span>Premium Merken</span>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d0a760] to-transparent" />
      </div>
    </div>
  );
}
