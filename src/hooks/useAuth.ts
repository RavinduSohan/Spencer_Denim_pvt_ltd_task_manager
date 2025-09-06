import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session;
  const user = session?.user;

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager');
  const isUser = () => hasRole('user');

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isUser,
  };
}
