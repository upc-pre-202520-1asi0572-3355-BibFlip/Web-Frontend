import { createRouter, createWebHistory } from "vue-router";
import SignInComponent from "../iam/pages/sign-in.component.vue";
import SignUpComponent from "../iam/pages/sign-up.component.vue";
import { authenticationGuard } from "../iam/services/authentication.guard.js";
import { authorizationGuard } from "../iam/services/authentication.authorization.js";
import { RoleEnum } from "../iam/model/role.enum";

export function createAppRouter() {
    const router = createRouter({
        history: createWebHistory(),
        routes: [
            {   
                path: '/home', 
                name: 'home', 
                component: () => import('../home/pages/home.component.vue'), 
                meta: { 
                    title: 'Home',
                    requiresAuth: true
                }
            },
            // Rutas de gestión de menús
            {
                // ...
            },
            {
                path: '/headquarters',
                name: 'reservation',
                component: () => import('@/booking/pages/headquarter-principal.vue'),
                meta: {
                    title: 'Reservas',
                    requiresAuth: true,
                }
            },
            {
                path: '/headquarters/:id/map',
                name: 'headquarter-map',
                component: () => import('@/booking/pages/headquarter-map.vue'),
                meta: {
                    title: 'Mapa de la Sede',
                    requiresAuth: true,
                }
            },
            {
                path: '/headquarters/:id/cubicles',
                name: 'headquarter-cubicles',
                component: () => import('@/booking/pages/headquarter-cubicles.vue'),
                meta: {
                    title: 'Cubiculos de la Sede',
                    requiresAuth: true,
                }
            },
            { 
                path: '/sign-in', 
                name: 'sign-in', 
                component: SignInComponent, 
                meta: { title: 'Sign In' }
            },
            { 
                path: '/sign-up', 
                name: 'sign-up', 
                component: SignUpComponent, 
                meta: { title: 'Sign Up' }
            },
            { 
                path: '/access-denied', 
                name: 'access-denied',
                component: () => import('../public/pages/access-denied.component.vue'),
                meta: { title: 'Acceso Denegado'}
            },
            { 
                path: '/cubicles',
                name: 'cubicle-management',
                component: () => import('@/cubicles/pages/CubiclesManagement.vue'),
                meta: { 
                    title: 'Gestión de Cubiculos',
                    requiresAuth: true,
                    roles: [RoleEnum.ADMIN, RoleEnum.SUPERVISOR]
                }
            },
            { 
                path: '/', 
                redirect: '/sign-in' 
            },
            {
                path: '/supervisor-booking',
                name: 'supervisor-booking',
                component: () => import('../booking/pages/supervisor-booking.vue'),
                meta: {
                    title: 'Gestión de Reservas',
                    requiresAuth: true,
                    roles: ['SUPERVISOR']
                }
            },
            {
                path: '/dashboard-admin',
                name: 'dashboard-admin',
                component: () => import ('../branching/pages/headquarter-management.vue'),
                meta: {
                    title: 'Dashboard de Administración',
                    requiresAuth: true,
                    roles: [RoleEnum.ADMIN]

                }
            },
            {
                path: '/create-headquarter',
                name: 'CreateHeadquarter',
                component: ()=> import ('../branching/components/headquarter-form.vue'),
            },
        ]
    });

    // Configurar los guards de forma sincrónica
    router.beforeEach((to, from, next) => {
        // Actualizar el título
        let baseTitle = 'Bibflip';
        document.title = `${baseTitle} | ${to.meta.title || 'App'}`;
        
        // Primero verificar autenticación
        authenticationGuard(to, from, (guardNext) => {
            if (guardNext && typeof guardNext === 'object') {
                // Si el guard de autenticación redirige, respetarlo
                return next(guardNext);
            }
            
            // Después verificar autorización (roles)
            authorizationGuard(to, from, next);
        });
    });

    return router;
}