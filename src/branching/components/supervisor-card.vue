<script>
export default {
  name: "supervisor-card",
  props: {
    supervisorData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    return {
      supervisor: props.supervisorData
    };
  }
}
</script>

<template>
  <div class="supervisor-card">
    <div class="supervisor-content">
      <div class="supervisor-details">
        <p v-if="supervisor.username" class="username">
          <strong>{{ supervisor.username }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.supervisor-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.supervisor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.supervisor-name {
  color: #392B1B;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.25rem;
  border-bottom: 2px solid #DCC8B9;
  padding-bottom: 10px;
}

.supervisor-details p {
  margin: 5px 0;
  color: #555;
}
</style>