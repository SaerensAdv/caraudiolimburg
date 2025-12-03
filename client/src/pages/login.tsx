import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AudioLoadingSpinner } from "@/components/AudioSkeletons";
import { Mail, Lock, ArrowLeft, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import calLogo from "@assets/cal-white-logo.png";

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

  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const currentForm = isRegistering ? registerForm : loginForm;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen min-h-[100svh] bg-black flex flex-col">
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="text-white/60 hover:text-white hover:bg-white/5 rounded-none"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/">
              <img 
                src={calLogo} 
                alt="Car Audio Limburg" 
                className="h-12 md:h-14 mx-auto mb-6 cursor-pointer"
                data-testid="img-logo"
              />
            </Link>
            <h1 className="text-2xl md:text-3xl font-light text-white mb-2">
              {isRegistering ? "Account Aanmaken" : "Inloggen"}
            </h1>
            <p className="text-white/50 text-sm">
              {isRegistering 
                ? "Maak een account aan om te beginnen" 
                : "Welkom terug bij Car Audio Limburg"
              }
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full py-6 text-base bg-transparent border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 rounded-none"
              disabled={isLoading}
              data-testid="button-google-auth"
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              {isRegistering ? "Registreren" : "Inloggen"} met Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-3 text-zinc-500">Of</span>
              </div>
            </div>

            <form 
              onSubmit={isRegistering 
                ? registerForm.handleSubmit(onRegisterSubmit)
                : loginForm.handleSubmit(onLoginSubmit)
              }
              className="space-y-5"
            >
              {isRegistering && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white/70 text-sm">Voornaam</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        id="firstName"
                        {...registerForm.register("firstName")}
                        disabled={isLoading}
                        className="pl-10 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1"
                        placeholder="Voornaam"
                        data-testid="input-firstName"
                      />
                    </div>
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-red-400 mt-1">
                        {registerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white/70 text-sm">Achternaam</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        id="lastName"
                        {...registerForm.register("lastName")}
                        disabled={isLoading}
                        className="pl-10 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1"
                        placeholder="Achternaam"
                        data-testid="input-lastName"
                      />
                    </div>
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-red-400 mt-1">
                        {registerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-white/70 text-sm">E-mailadres</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    {...(isRegistering ? registerForm.register("email") : loginForm.register("email"))}
                    disabled={isLoading}
                    className="pl-10 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1"
                    placeholder="uw@email.nl"
                    data-testid="input-email"
                  />
                </div>
                {currentForm.formState.errors.email && (
                  <p className="text-sm text-red-400 mt-1">
                    {currentForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-white/70 text-sm">Wachtwoord</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="password"
                    type="password"
                    {...(isRegistering ? registerForm.register("password") : loginForm.register("password"))}
                    disabled={isLoading}
                    className="pl-10 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1"
                    placeholder="••••••••"
                    data-testid="input-password"
                  />
                </div>
                {currentForm.formState.errors.password && (
                  <p className="text-sm text-red-400 mt-1">
                    {currentForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {isRegistering && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-white/70 text-sm">Bevestig Wachtwoord</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerForm.register("confirmPassword")}
                      disabled={isLoading}
                      className="pl-10 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-none focus:border-[#d0a760] focus:ring-[#d0a760] focus:ring-1"
                      placeholder="••••••••"
                      data-testid="input-confirmPassword"
                    />
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-400 mt-1">
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
                      className="text-[#d0a760] hover:text-[#d0a760]/80 p-0 h-auto text-sm"
                      data-testid="link-forgot-password"
                    >
                      Wachtwoord vergeten?
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 text-base bg-[#d0a760] text-black hover:bg-[#d0a760]/90 font-medium rounded-none mt-2"
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

            <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
              <p className="text-zinc-500 text-sm">
                {isRegistering ? "Heeft u al een account?" : "Nog geen account?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  loginForm.reset();
                  registerForm.reset();
                }}
                className="text-[#d0a760] hover:text-[#d0a760]/80 p-0 h-auto mt-1 font-medium"
                data-testid="button-toggle-form"
              >
                {isRegistering ? "Inloggen" : "Account aanmaken"}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-zinc-600 text-xs">
              Door in te loggen gaat u akkoord met onze{" "}
              <Link href="/terms" className="text-[#d0a760] hover:underline">
                Algemene Voorwaarden
              </Link>{" "}
              en{" "}
              <Link href="/privacy" className="text-[#d0a760] hover:underline">
                Privacybeleid
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-6 text-xs text-zinc-600">
        <p>&copy; 2024 Car Audio Limburg. Premium car audio solutions.</p>
      </div>
    </div>
  );
}
