<template>
  <v-container fluid>
    <feathers-vuex-find
      v-slot="{ items: vocabularies }"
      :query="{
        is_enabled: true,
        is_hidden: false,
        scheme_id: value.key,
        $sort: { label: 1 }
      }"
      service="vocabularies"
      watch="query"
    >
      <v-row dense>
        <v-col>
          <v-row v-for="vocabulary in vocabularies" :key="vocabulary._id" dense>
            <v-col v-if="vocabulary.terms.length">
              <v-autocomplete
                v-model="value.pairs[vocabulary.label]"
                :items="vocabulary.terms"
                :item-text="term => term.name || term.label"
                item-value="label"
                clearable
                dense
                :label="vocabulary.label"
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </feathers-vuex-find>
  </v-container>
</template>

<script>
export default {
  props: {
    keyDisabled: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>
