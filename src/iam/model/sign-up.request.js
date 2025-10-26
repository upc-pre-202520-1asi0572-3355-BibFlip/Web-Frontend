/**
 * Sign up request model.
 * @summary
 * This model is used to create a new user.
 */
export class SignUpRequest {
    /**
     * Constructor.
     * @param username The username.
     * @param password The password.
     * @param email The email.
     */
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
}