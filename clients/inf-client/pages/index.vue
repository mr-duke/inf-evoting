<template>
    <div>
        <div class="row">
            <div>
                <img src="/Logo-INF-E-Voting.png" class="rounded float-start mt-3" alt="Logo INF E-Voting">
            </div>
            <div class="col-4 form-group mt-3">
                <label for="userSelect">Wählen Sie Ihren Benutzer aus:</label>
                <select class="form-select" v-model="selectedUser" id="userSelect">
                    <option value="Admin">INF-Admin</option>
                    <option value="Inf-User1">INF-User 1</option>
                    <option value="Inf-User2">INF-User 2</option>
                    <option value="Inf-User3">INF-User 3</option>
                    <option value="Inf-User4">INF-User 4</option>
                    <option value="Inf-User5">INF-User 5</option>
                </select>
            </div>
        </div>
        <button v-if="selectedUser" @click="login" type="button" class="btn btn-primary mt-3">
            <i class="bi bi-box-arrow-in-right me-2"></i> Anmelden
        </button>
    </div>
</template>

<script setup lang="ts">
const selectedUser = ref<string>("");
const router = useRouter();

onMounted(async () => {
    localStorage.removeItem('userName');
});

const login = () => {
    localStorage.setItem('userName', selectedUser.value);
    if (selectedUser.value === "Admin") {
        router.push('/admin')
    } else {
        router.push('/user')
    }
}

</script>
  