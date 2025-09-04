import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AudioLoadingSpinner, AudioWaveformSkeleton } from "@/components/AudioSkeletons";
import { Mail, Lock, Volume2, Car, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar home
        </Button>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat" 
             style={{
               backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
             }}>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Brand & Features */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <Volume2 className="w-12 h-12 text-primary mr-3" />
                <h1 className="text-4xl font-bold text-foreground">Car Audio Limburg</h1>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-4">
                Premium Car Audio & Professionele Installatie
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Ontdek ons uitgebreide assortiment van Alpine, Audison, Pioneer en meer. 
                Inclusief vakkundige montage in onze moderne showroom.
              </p>

              {/* Audio Waveform Animation */}
              <AudioWaveformSkeleton className="mb-6" />
              
              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center text-foreground">
                  <Car className="w-5 h-5 text-primary mr-3" />
                  <span>Voertuig-specifieke oplossingen</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Volume2 className="w-5 h-5 text-primary mr-3" />
                  <span>Premium audio merken</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Mail className="w-5 h-5 text-primary mr-3" />
                  <span>Professionele installatie service</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4 lg:hidden">
                  <Volume2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-card-foreground">
                  {isRegistering ? "Account Aanmaken" : "Inloggen"}
                </h2>
                <p className="text-muted-foreground">
                  {isRegistering 
                    ? "Maak een account aan om te beginnen" 
                    : "Welkom terug bij Car Audio Limburg"
                  }
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Google Auth Button */}
                <Button
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full py-6 text-base border-border hover:bg-accent"
                  disabled={isLoading}
                  data-testid="button-google-auth"
                >
                  <FcGoogle className="w-5 h-5 mr-3" />
                  {isRegistering ? "Registreren" : "Inloggen"} met Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Of</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form 
                  onSubmit={isRegistering 
                    ? registerForm.handleSubmit(onRegisterSubmit)
                    : loginForm.handleSubmit(onLoginSubmit)
                  }
                  className="space-y-4"
                >
                  
                  {/* First/Last Name for Registration */}
                  {isRegistering && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Voornaam</Label>
                        <Input
                          id="firstName"
                          {...registerForm.register("firstName")}
                          disabled={isLoading}
                          className="mt-1"
                          data-testid="input-firstName"
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Achternaam</Label>
                        <Input
                          id="lastName"
                          {...registerForm.register("lastName")}
                          disabled={isLoading}
                          className="mt-1"
                          data-testid="input-lastName"
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">E-mailadres</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        {...(isRegistering ? registerForm.register("email") : loginForm.register("email"))}
                        disabled={isLoading}
                        className="pl-10"
                        data-testid="input-email"
                      />
                    </div>
                    {currentForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {currentForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password">Wachtwoord</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        {...(isRegistering ? registerForm.register("password") : loginForm.register("password"))}
                        disabled={isLoading}
                        className="pl-10"
                        data-testid="input-password"
                      />
                    </div>
                    {currentForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {currentForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password for Registration */}
                  {isRegistering && (
                    <div>
                      <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...registerForm.register("confirmPassword")}
                          disabled={isLoading}
                          className="pl-10"
                          data-testid="input-confirmPassword"
                        />
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full py-6 text-base bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                    data-testid={`button-${isRegistering ? 'register' : 'login'}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <AudioLoadingSpinner size="sm" className="mr-3" />
                        {isRegistering ? "Account aanmaken..." : "Inloggen..."}
                      </div>
                    ) : (
                      isRegistering ? "Account Aanmaken" : "Inloggen"
                    )}
                  </Button>
                </form>

                {/* Toggle Form */}
                <div className="text-center pt-4">
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      loginForm.reset();
                      registerForm.reset();
                    }}
                    className="text-primary hover:text-primary/80"
                    data-testid="button-toggle-form"
                  >
                    {isRegistering 
                      ? "Heeft u al een account? Inloggen" 
                      : "Nog geen account? Registreren"
                    }
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-sm text-muted-foreground">
        <p>&copy; 2024 Car Audio Limburg. Premium car audio solutions.</p>
      </div>
    </div>
  );
}