/**
 * Sign in response model
 * @summary
 * This model is used to create a sign in response object
 */
export class SignInResponse {
    /**
     * Constructor
     * @param id The user id
     * @param username The username
     * @param token The generated token
     * @param roles The roles assigned to the user
     * @param email The user email
     */
    constructor(id, username, token, roles = [], email) {
        this.id = id;
        this.username = username;
        this.token = token;
        this.roles = roles;
        this.email = email
    }
}