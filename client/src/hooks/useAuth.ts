import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0, // Always refetch to check auth status
    gcTime: 0,    // Don't cache auth data
    networkMode: "always",
  });

  // Don't show loading forever - if there's an error, consider auth check complete
  const effectiveLoading = isLoading && !error;

  // If there's an error (like 401), user is not authenticated
  const isAuthenticated = !!user && !error;

  return {
    user: error ? undefined : user,
    isLoading: effectiveLoading,
    isAuthenticated,
  };
}
