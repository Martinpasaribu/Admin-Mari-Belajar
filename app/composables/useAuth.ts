export const useAuth = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const token = useCookie('auth_token'); // Token disimpan di cookie

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const data: any = await $fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        body: credentials,
      });

      // Simpan token ke cookie
      token.value = data.access_token;
      
      // Redirect ke dashboard
      return navigateTo('/questions');
    } catch (error) {
      throw new Error('Email atau password salah');
    }
  };

  const logout = () => {
    token.value = null;
    return navigateTo('/login');
  };

  return { login, logout, isLoggedIn: !!token.value };
};