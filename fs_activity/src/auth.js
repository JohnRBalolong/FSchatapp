export function requireAuth(to, from, next) {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
        next();
    } else {
        next({ name: 'index' });
    }
}