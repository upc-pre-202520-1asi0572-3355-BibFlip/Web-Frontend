import { useAuthenticationStore } from "../services/authentication.store.js";
import { RoleEnum, hasAnyRole } from "../model/role.enum.js";

export const vRbac = {
  mounted(el, binding) {
    const authenticationStore = useAuthenticationStore();
    const { value } = binding;
    
    // Si no se proporciona valor o no es un array, no hacer nada
    if (!value || !Array.isArray(value)) {
      return;
    }
    
    // Convertir los valores al formato correcto usando RoleEnum
    const requiredRoles = value.map(role => 
      typeof role === 'string' && RoleEnum[role] ? RoleEnum[role] : role
    );
    
    // Ocultar elemento si el usuario no tiene ninguno de los roles requeridos
    if (!authenticationStore.hasAnyRole(requiredRoles)) {
      el.style.display = 'none';
    }
  },
  
  updated(el, binding) {
    const authenticationStore = useAuthenticationStore();
    const { value } = binding;
    
    if (!value || !Array.isArray(value)) {
      return;
    }
    
    const requiredRoles = value.map(role => 
      typeof role === 'string' && RoleEnum[role] ? RoleEnum[role] : role
    );
    
    el.style.display = authenticationStore.hasAnyRole(requiredRoles) ? '' : 'none';
  }
};

export default {
  install(app) {
    app.directive('rbac', vRbac);
  }
};