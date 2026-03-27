export default defineNuxtRouteMiddleware((to) => {
  // const token = useCookie('auth_token');

  // // Jika tidak ada token dan bukan di halaman login, tendang ke /login
  // if (!token.value && to.path !== '/login') {
  //   return navigateTo('/login');
  // }

  // // Jika sudah login tapi mau ke login lagi, arahkan ke dashboard
  // if (token.value && to.path === '/login') {
  //   return navigateTo('/questions');
  // }
});