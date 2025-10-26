export const RoleEnum = Object.freeze({
    ADMIN: 'ROLE_ADMIN',
    SUPERVISOR: 'ROLE_SUPERVISOR',
    USER: 'ROLE_USER'
});

export const hasRole = (userRoles, requiredRole) => {
    const roleValue = RoleEnum[requiredRole] || requiredRole;
    return userRoles.includes(roleValue);
};

export const hasAnyRole = (userRoles, requiredRoles) => {
    return requiredRoles.some(role => {
        const roleValue = RoleEnum[role] || role;
        return userRoles.includes(roleValue);
    });
};