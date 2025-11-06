import { createRouter, createWebHistory } from "vue-router";
import SignInComponent from "../iam/pages/sign-in.component.vue";
import SignUpComponent from "../iam/pages/sign-up.component.vue";
import { authenticationGuard } from "../iam/services/authentication.guard.js";
import { authorizationGuard } from "../iam/services/authentication.authorization.js";
import { RoleEnum } from "../iam/model/role.enum";
import PasswordResetRequestComponent from "../iam/pages/password-reset-request.component.vue";
import PasswordResetConfirmComponent from "../iam/pages/password-reset-confirm.component.vue";

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
            // App Routes
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
            // IAM Routes
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
                path: '/',
                redirect: '/sign-in'
            },
            // Password Reset Routes
            {
                path: '/password-reset/request',
                name: 'password-reset-request',
                component: PasswordResetRequestComponent,
                meta: { title: 'Recuperar Contraseña' }
            },
            {
                path: '/password-reset/confirm',
                name: 'password-reset-confirm',
                component: PasswordResetConfirmComponent,
                meta: { title: 'Restablecer Contraseña' }
            },
            // Other Routes
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

    // Configures global navigation guards
    router.beforeEach((to, from, next) => {
        // Updates document title
        let baseTitle = 'Bibflip';
        document.title = `${baseTitle} | ${to.meta.title || 'App'}`;
        
        // Verifies authentication first
        authenticationGuard(to, from, (guardNext) => {
            if (guardNext && typeof guardNext === 'object') {
                // If authentication guard redirected, skip authorization
                return next(guardNext);
            }
            
            // Then verifies authorization
            authorizationGuard(to, from, next);
        });
    });

    return router;
}