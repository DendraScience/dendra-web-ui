<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <member-select v-model="value" :disabled="selectDisabled" :org="org" />
      </v-col>
    </v-row>

    <v-row v-if="value.personId">
      <v-col>
        <v-card outlined>
          <v-container fluid>
            <v-row dense>
              <v-col>
                <v-checkbox
                  v-for="role in value.roles"
                  :key="role.text"
                  v-model="role.value"
                  :label="role.text"
                  class="my-1"
                  dense
                  hide-details
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
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
