// src/iam/services/password-reset.service.js
import http from "../../shared/services/http-common.js";

export class PasswordResetService {
    /**
     * Solicitar código de recuperación
     * @param {string} email - El email del usuario
     */
    requestPasswordReset(email) {
        return http.post("/password-recovery/request", { email });
    }

    /**
     * Confirmar restablecimiento de contraseña
     * @param {string} email - El email del usuario
     * @param {string} code - Código de 6 dígitos
     * @param {string} newPassword - Nueva contraseña
     */
    confirmPasswordReset(email, code, newPassword) {
        return http.post("/password-recovery/confirm", {
            email,
            code,
            newPassword
        });
    }
}