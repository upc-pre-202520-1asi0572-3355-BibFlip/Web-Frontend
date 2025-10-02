import {useAuthenticationStore} from "./authentication.store.js";

/**
 * Guard to check if user has required roles to access a route
 * @param to The route the user is navigating to
 * @param from The route the user is navigating from
 * @param next The guard function to navigate to the next route
 */
export const authorizationGuard = (to, from, next) => {
    const authenticationStore = useAuthenticationStore();
    const requiredRoles = to.meta.requiredRoles;
    
    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
        return next();
    }
    
    // Verificar si el usuario está autenticado
    if (!authenticationStore.isSignedIn) {
        return next({ name: 'sign-in' });
    }
    
    // Verificar si el usuario tiene al menos uno de los roles requeridos
    if (authenticationStore.hasAnyRole(requiredRoles)) {
        return next();
    }
    
    // Sin roles adecuados, redirigir a acceso denegado
    return next({ name: 'access-denied' });
};