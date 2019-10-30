<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <member-select v-model="value" :disabled="selectDisabled" :org="org" />
      </v-flex>

      <v-flex v-if="value.personId" mx-2>
        <v-checkbox
          v-for="role in value.roles"
          :key="role.text"
          v-model="role.value"
          :label="role.text"
          class="my-0"
        ></v-checkbox>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MemberSelect from '@/components/MemberSelect'

export default {
  components: {
    MemberSelect
  },

  props: {
    org: { default: null, type: Object },
    selectDisabled: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>
