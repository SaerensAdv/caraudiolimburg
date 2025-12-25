import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, isFetching } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
    networkMode: "always",
  });

  const effectiveLoading = isLoading && !error;
  
  // User is authenticated only if we have actual user data (not null, not undefined)
  // The queryFn returns null on 401, so we must check for null explicitly
  const isAuthenticated = user != null && !error;

  // Debug: log state on every render
  if (typeof window !== 'undefined') {
    console.log('[useAuth] user:', user, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'isFetching:', isFetching);
  }

  return {
    user: (error || user === null) ? undefined : user,
    isLoading: effectiveLoading,
    isAuthenticated,
  };
}
