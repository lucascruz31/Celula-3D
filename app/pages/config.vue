<template>
    <div>
        <v-container class="page-wrapper mt-4" fluid>
            <h1 class="text-h4 font-weight-bold text-center mb-8"> CONFIGURACIÓN DE USUARIOS </h1>

            <!-- Tarjeta superior: Agregar Usuario -->
            <v-card class="transparent-card mx-auto mb-8" max-width="800">
                <v-card-title class="text-h5 font-weight-bold" style="color: #00e5ff">
                    Agregar Usuario
                </v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="handleAddUser" ref="formRef">
                        <v-row>
                            <!-- Username -->
                            <v-col cols="12" md="4">
                                <v-text-field v-model="newUser.username" label="Usuario (Username)"
                                    placeholder="Ingrese nombre de usuario" variant="outlined" required
                                    base-color="white" color="#00e5ff" bg-color="rgba(255, 255, 255, 0.05)"
                                    class="custom-input mb-2"></v-text-field>
                            </v-col>
                            <!-- Nombre -->
                            <v-col cols="12" md="4">
                                <v-text-field v-model="newUser.name" label="Nombre" placeholder="Ingrese nombre" required
                                    variant="outlined" base-color="white" color="#00e5ff" bg-color="rgba(255, 255, 255, 0.05)"
                                    class="custom-input mb-2"></v-text-field>
                            </v-col>
                            <!-- Apellido -->
                            <v-col cols="12" md="4">
                                <v-text-field v-model="newUser.lastname" label="Apellido" placeholder="Ingrese apellido"
                                    required variant="outlined" base-color="white" color="#00e5ff"
                                    bg-color="rgba(255, 255, 255, 0.05)" class="custom-input mb-2"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <!-- Contraseña -->
                            <v-col cols="12" md="4">
                                <v-text-field v-model="newUser.password" label="Contraseña" type="text"
                                    placeholder="Ingrese contraseña" required variant="outlined" base-color="white"
                                    color="#00e5ff" bg-color="rgba(255, 255, 255, 0.05)" class="custom-input mb-2"></v-text-field>
                            </v-col>
                            <!-- Rol -->
                            <v-col cols="12" md="4">
                                <v-select v-model="newUser.rol" :items="['Admin', 'Docente', 'Estudiante']"
                                    label="Rol" placeholder="Seleccione un rol" required variant="outlined"
                                    base-color="white" color="#00e5ff" bg-color="rgba(255, 255, 255, 0.05)"
                                    class="custom-input mb-2"></v-select>
                            </v-col>
                            <!-- Botón de envío -->
                            <v-col cols="12" md="4" class="d-flex align-end">
                                <v-btn type="submit" block class="action-btn" size="large" :loading="store.isLoading"
                                    elevation="0">
                                    Registrar Usuario
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>

            <!-- Tabla de usuarios registrados -->
            <v-card class="transparent-card mx-auto" max-width="800">
                <v-card-title class="text-h5 font-weight-bold" style="color: #00e5ff">
                    Usuarios Registrados ({{ store.totalPerfiles }})
                </v-card-title>
                <v-card-text>
                    <v-table theme="dark" class="transparent-table">
                        <thead>
                            <tr>
                                <th class="text-left text-cyan">Usuario</th>
                                <th class="text-left text-cyan">Nombre</th>
                                <th class="text-left text-cyan">Apellido</th>
                                <th class="text-left text-cyan">Contraseña</th>
                                <th class="text-left text-cyan">Rol</th>
                                <th class="text-center text-cyan">Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in store.perfiles" :key="user.id">
                                <td>{{ user.username }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.lastname }}</td>
                                <td>{{ user.password }}</td>
                                <td>{{ user.rol }}</td>
                                <td class="text-center">
                                    <v-btn icon="mdi-delete" color="error" variant="text" size="small"
                                        @click="handleDeleteUser(user.id)" :disabled="user.id === store.currentPerfil?.id || store.isLoading"
                                        title="Eliminar usuario"></v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePerfilesStore } from '~/store/perfiles';

const store = usePerfilesStore();
const formRef = ref(null);

definePageMeta({
    middleware: [
        function (to, from) {
            const perfilStore = usePerfilesStore();
            if (perfilStore.currentPerfil?.rol !== 'Admin') {
                return navigateTo('/');
            }
        }
    ]
});

// Estado inicial del formulario para agregar usuario
const newUser = ref({
    username: '',
    name: '',
    lastname: '',
    password: '',
    rol: 'Estudiante'
});

// Cargar los usuarios cuando se monta la página
onMounted(() => {
    store.fetchPerfiles();
});

// Manejar el envío del formulario
const handleAddUser = async () => {
    // Validación básica de campos
    if (
        !newUser.value.username ||
        !newUser.value.name ||
        !newUser.value.lastname ||
        !newUser.value.password ||
        !newUser.value.rol
    ) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Agregamos el perfil enviando una copia del objeto
    const success = await store.addPerfil({ ...newUser.value });

    if (success) {
        alert('Usuario agregado correctamente.');
        // Limpiamos el formulario
        newUser.value = {
            username: '',
            name: '',
            lastname: '',
            password: '',
            rol: 'Estudiante'
        };
    } else {
        alert('Error al intentar agregar el usuario.');
    }
};

// Manejar la eliminación de un usuario
const handleDeleteUser = async (id) => {
    // Verificamos por seguridad que el usuario no se elimine a sí mismo
    if (id === store.currentPerfil?.id) {
        alert('No puedes eliminar tu propia cuenta.');
        return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
        const success = await store.deletePerfil(id);
        if (success) {
            alert('Usuario eliminado correctamente.');
        } else {
            alert('Error al intentar eliminar el usuario.');
        }
    }
};
</script>

<style scoped>
.page-wrapper {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background-color: #0a0a0a;
    color: white;
    padding: 20px;
    font-family: 'Roboto', sans-serif;
}

.transparent-card {
    background: rgba(0, 0, 0, 0.6) !important;
    border-left: 3px solid #00e5ff;
}

.transparent-table {
    background: transparent !important;
}

.text-cyan {
    color: #00e5ff !important;
    font-weight: bold;
}

.action-btn {
    background-color: #00e5ff !important;
    color: #0a0a0a !important;
    font-weight: bold;
    letter-spacing: 1px;
}

/* Forzar color blanco en inputs Vuetify */
:deep(.v-field__input), :deep(.v-select__selection-text) {
    color: white !important;
}

:deep(.v-label) {
    color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-table) {
    color: white !important;
}

:deep(th) {
    border-bottom: 1px solid rgba(0, 229, 255, 0.3) !important;
}

:deep(td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>