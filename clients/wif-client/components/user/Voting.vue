<template>
    <h4 class="mt-3"> Abstimmung </h4>
    <div v-if="isAllowedToVote" class="form-check" v-for="(option, index) in existingOptions" :key="index">
        <input class="form-check-input" type="radio" name="flexRadioDefault" :id=option.key :value=option.key
            v-model="votedOption">
        <label class="form-check-label" :for=option.key>
            {{ option.name }}
        </label>
    </div>
    <div v-if="!doOptionsExist" class="d-flex alert alert-warning col-7" role="alert">
        {{ "Keine Wahloptionen angelegt" }}
    </div>

    <div class="d-flex mt-3">
        <button v-if="doOptionsExist" @click="castVote" type="button" class="btn btn-primary me-3" :disabled="!isAllowedToVote">
            <i class="bi bi-envelope-paper me-2"></i> Abstimmen
        </button>
        <div v-if="isVoteLoading" class="spinner-border text-primary" role="status">
        </div>
    </div>
    <div v-if="isVoteCast" class="d-flex alert alert-success col-7 mt-3" role="alert">
        {{ "Stimme wurde erfolgreich abgegeben" }} <br/>
        {{ "Ihre Transaktions-ID: " }} <br/>
        {{ transactionId }}
    </div>
    <div v-if="isVoteNotCast" class="d-flex alert alert-danger col-7 mt-3" role="alert">
        {{ "Stimme konnte nicht abgegeben werden" }}
    </div>
    <div v-if="!isAllowedToVote" class="d-flex alert alert-warning col-7 mt-3">
        {{ `Vielen Dank, ${userName}, Sie haben bereits abgestimmt` }}
    </div>
    <br/>

    <div v-if="!isAllowedToVote">
        <h4>Ergebnis</h4>
        <div class="col-7">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Stimmen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(option, index) in existingOptions" :key="index">
                        <td scope="row"> {{ option.name }} </td>
                        <td scope="row"> {{ option.votes }} </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <br/>
    </div>
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
const isVoteLoading = ref<boolean>(false);
const isVoteCast = ref<boolean>(false);
const isVoteNotCast = ref<boolean>(false);
const transactionId = ref<string|null>();
const existingOptions = ref<Option[]>([]);
const alreadyVoted = ref<string[]>([]);
const votedOption = ref<string>();

const isAllowedToVote = computed(() => {
    if (alreadyVoted.value.includes(userName.value)) {
        return false
    // Admins should not be allowed to vote in the first place    
    } else if (userName.value === "Admin") {
        return false
    } else {
        return true
    }
});
const doOptionsExist = computed(() => {
  return (existingOptions.value?.length !== 0)
});

const castVote = async () => {
    isVoteLoading.value = true;
    const { data, status } = await useFetch('/api/cast-vote', {
        method: 'post',
        body: {
            user: userName.value,
            key: votedOption.value,
        }
    });

    if (status.value === "success") {
        await addVoter();
        isVoteCast.value = true;
        transactionId.value = data.value;
        await getAllOptions();
    } else {
        isVoteNotCast.value = true;
        setTimeout(() => {
            isVoteNotCast.value = false;
        }, 2500);
    }
    isVoteLoading.value = false;
}

const getAllOptions = async () => {
    const { data } = await useFetch('/api/get-all-options', {
        method: 'post',
        body: {
            user: userName.value
        }
    });
   existingOptions.value = data.value;
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

const addVoter = async () => {
    const { status } = await useFetch('/api/add-voter', {
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