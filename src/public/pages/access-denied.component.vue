<script>
export default {
  name: "access-denied"
}
</script>

<template>
  <div class="w-full">
    <h1>Acceso Denegado</h1>
    <p>No tienes los permisos necesarios para acceder a esta sección.</p>
    <div class="mt-3">
      <router-link to="/home">
        <pv-button label="Volver al inicio" class="p-button-primary" />
      </router-link>
    </div>
  </div>
</template>