/**
 * Sign in request model
 * @summary
 * This model is used to create a sign in request object
 */
export class SignInRequest {
    /**
     * Constructor
     * @param {string} email - The email
     * @param {string} password - The password
     */
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}