// src/services/authentication.store.js

import { defineStore } from 'pinia';
import { AuthenticationService } from './authentication.service.js';
import { SignInResponse } from '../model/sign-in.response.js';
import { SignUpResponse } from '../model/sign-up.response.js';
import { RoleEnum, hasAnyRole as checkAnyRole } from "../model/role.enum.js";

const authenticationService = new AuthenticationService();

export const useAuthenticationStore = defineStore(
    'authentication',
    {
        state: () => ({
            signedIn: false,
            userId: 0,
            username: '',
            email: '',
            roles: []
        }),
        getters: {
            isSignedIn: (state) => state.signedIn,
            currentUserId: (state) => state.userId,
            currentUsername: (state) => state.username,
            currentEmail: (state) => state.email,
            currentToken: () => localStorage.getItem('token'),

            // Getters para roles
            currentRoles: (state) => state['roles'],
            hasRole: (state) => (role) => {
                const roleValue = RoleEnum[role] || role;
                return state.roles.includes(roleValue);
            },
            hasAnyRole: (state) => (roles) => {
                return checkAnyRole(state.roles, roles);
            }
        },
        actions: {

            async signIn(signInRequest, router) {
                authenticationService.signIn(signInRequest)
                    .then(response => {
                        let signInResponse = new SignInResponse(
                            response.data.id,
                            response.data.username,
                            response.data.token,
                            response.data.roles || [],
                            response.data.email || ''
                        );
                        this.signedIn = true;
                        this.userId = signInResponse.id;
                        this.username = signInResponse.username;
                        this.email = signInResponse.email;
                        this.roles = signInResponse.roles;

                        // Store token
                        localStorage.setItem('token', signInResponse.token);

                        // Store complete user object with roles and email
                        localStorage.setItem('user', JSON.stringify({
                            id: signInResponse.id,
                            username: signInResponse.username,
                            email: signInResponse.email,
                            roles: signInResponse.roles
                        }));

                        router.push({ name: 'home' });
                    })
                    .catch(error => {
                        console.error('Error en signIn:', error);
                        throw error;
                    });
            },

            async signUp(signUpRequest, router) {
                try {
                    const response = await authenticationService.signUp(signUpRequest);
                    const message = response.data.message;
                    const signUpResponse = new SignUpResponse(message);

                    console.log('SignUp:', signUpResponse);
                    router.push({ name: 'sign-in' });
                } catch (error) {
                    console.error('Error en signUp:', error);
                    throw error;
                }
            },

            async signOut(router) {
                this.signedIn = false;
                this.userId = 0;
                this.username = '';
                this.email = '';
                this.roles = [];
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push({ name: 'sign-in' });
            }
        }
    }
);