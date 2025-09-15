import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,   // 5 minutes
    networkMode: "always",
  });

  // Don't show loading forever - if there's an error, consider auth check complete
  const effectiveLoading = isLoading && !error;

  return {
    user,
    isLoading: effectiveLoading,
    isAuthenticated: !!user,
  };
}
