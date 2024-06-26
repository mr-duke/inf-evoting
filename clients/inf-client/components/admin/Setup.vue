<template>
  <h4 class="mt-3"> Demo </h4>
  <div class="d-flex">
    <button @click="createDemo" type="button" class="btn btn-primary me-3 mb-3">
      <i class="bi bi-easel2 me-2"></i> Erzeuge Demo-Abstimmung
    </button>
    <div v-if="isDemoLoading" class="spinner-border text-primary" role="status">
    </div>
  </div>
  <div v-if="isDemoGenerated" class="d-flex alert alert-success col-7" role="alert">
    {{ "Demo-Abstimmung wurde erfolgreich erstellt" }}
  </div>
  <br />

  <h4> Abstimmung verwalten </h4>
  <div class="col-7">
    <input class="form-control mb-3" type="text" placeholder="Neue Wahloption eingeben" v-model="optionToAdd" />
  </div>
  <div class="d-flex mb-3">
    <button @click="createOption" type="button" class="btn btn-primary me-3" :disabled="isEmptyOptionInput">
      <i class="bi bi-plus-square me-2"></i> Wahloption hinzufügen
    </button>
    <div v-if="isOptionLoading" class="spinner-border text-primary" role="status">
    </div>
  </div>
  <div v-if="isOptionCreated" class="d-flex alert alert-success col-7" role="alert">
    {{ "Wahloption wurde erfolgreich hinzugefügt" }}
  </div>
  <div v-if="isOptionNotCreated" class="d-flex alert alert-danger col-7" role="alert">
    {{ "Wahloption konnte nicht hinzugefügt werden" }}
  </div>
  <div class="d-flex">
    <button @click="resetElection" type="button" class="btn btn-primary me-3 mb-3">
      <i class="bi bi-arrow-return-left me-2"></i> Abstimmung zurücksetzen
    </button>
    <div v-if="isResetLoading" class="spinner-border text-primary" role="status">
    </div>
  </div>
  <div v-if="isElectionResetted" class="d-flex alert alert-success col-7" role="alert">
    {{ "Abstimmung wurde erfolgreich zurückgesetzt" }}
  </div>
  <div v-if="isElectionNotResetted" class="d-flex alert alert-danger col-7" role="alert">
    {{ "Abstimmung konnte nicht zurückgesetzt werden" }}
  </div>
  <br />

  <h4> Aktuellen Stand anzeigen </h4>
  <div class="col-7">
    <table class="table table-striped" v-if="doOptionsExist">
      <thead>
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Name</th>
          <th scope="col">Stimmen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(option, index) in existingOptions" :key="index">
          <td scope="row"> {{ option.key }} </td>
          <td scope="row"> {{ option.name }} </td>
          <td scope="row"> {{ option.votes }} </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="!doOptionsExist" class="d-flex alert alert-warning col-7" role="alert">
    {{ "Keine Wahloptionen angelegt" }}
  </div>
  <br />

  <h4>Bereits abgestimmt</h4>
    <div v-if="alreadyVoted.length === 0" class="d-flex alert alert-warning col-7" role="alert">
      {{ "Noch kein Wähler hat abgestimmt" }}
    </div>
    <ul>
        <li v-for="(item, index) in alreadyVoted" :key="index">
            {{ item }}
        </li>
    </ul>
  <br />
</template>

<script setup lang="ts">

interface Option {
  name: string;
  key: string
  votes: number;
}

onMounted(async () => {
  userName.value = localStorage.getItem('userName') ?? "";
  await getAllOptions();
  await getAllVoters();
});

const userName = ref<string>("");
const existingOptions = ref<Option[]>([]);
const optionToAdd = ref<string|null>();
const isDemoLoading = ref<boolean>(false);
const isDemoGenerated = ref<boolean>(false);
const isOptionLoading = ref<boolean>(false);
const isOptionCreated = ref<boolean>(false);
const isOptionNotCreated = ref<boolean>(false);
const isResetLoading = ref<boolean>(false);
const isElectionResetted = ref<boolean>(false);
const isElectionNotResetted = ref<boolean>(false);
const alreadyVoted = ref<string[]>([]);

const isEmptyOptionInput = computed(() => {
  return !optionToAdd.value
});
const doOptionsExist = computed(() => {
  return (existingOptions.value?.length !== 0)
});

const createDemo = async () => {
  isDemoLoading.value = true;
  await useFetch('/api/init-ledger', {
    method: 'post',
    body: {
      user: userName.value
    }
  });

  await getAllOptions();

  isDemoLoading.value = false;
  isDemoGenerated.value = true
  setTimeout(() => {
    isDemoGenerated.value = false;
  }, 2000);
}

const getAllOptions = async () => {
  const { data , status } = await useFetch('/api/get-all-options', {
    method: 'post',
    body: {
      user: userName.value
    },
  });
    existingOptions.value = data.value;
}

const createOption = async () => {
  isOptionLoading.value = true;
  const { status } = await useFetch('/api/create-option', {
    method: 'post',
    body: {
      user: userName.value,
      data: optionToAdd.value,
    }
  });
  isOptionLoading.value = false;

  if (status.value === "success") {
    isOptionCreated.value = true;
    setTimeout(() => {
      isOptionCreated.value = false;
    }, 2500);
    optionToAdd.value = null
  } else {
    isOptionNotCreated.value = true;
    setTimeout(() => {
      isOptionNotCreated.value = false;
    }, 2500);
    optionToAdd.value = null
  }
  await getAllOptions();
}

const resetElection = async () => {
  isResetLoading.value = true;
  const { status } = await useFetch('/api/reset-election', {
    method: 'post',
    body: {
      user: userName.value,
    }
  });
  await resetAllVoters();

  // If status is success and list of users who already voted is empty, 
  // the election has successfully been resetted  
  if (status.value === "success" && alreadyVoted.value.length === 0) {
    isElectionResetted.value = true;
    setTimeout(() => {
      isElectionResetted.value = false;
    }, 2500);
  } else {
    isElectionNotResetted.value = true;
    setTimeout(() => {
      isElectionNotResetted.value = false;
    }, 2500);
  }
  isResetLoading.value = false;
  await getAllOptions();
}

const getAllVoters = async () => {
    const { data } = await useFetch('/api/get-all-voters', {
        method: 'post',
        body: {
            user: userName.value
        }
    });
    alreadyVoted.value = data.value;
    }

const resetAllVoters = async () => {
    const { status } = await useFetch('/api/reset-all-voters', {
        method: 'post',
        body: {
            user: userName.value
        }
    });
    if (status.value === "success") {
        await getAllVoters();
    }
}

</script>

<style scoped></style>