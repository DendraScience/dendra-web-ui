<template>
  <v-container fluid grid-list-xs pt-0>
    <feathers-vuex-find
      v-slot="{ items: vocabularies }"
      :query="{
        is_enabled: true,
        is_hidden: false,
        scheme_id: value.key,
        $sort: { label: 1 }
      }"
      :watch="'query'"
      service="vocabularies"
    >
      <v-layout column>
        <v-flex v-for="vocabulary in vocabularies" :key="vocabulary._id">
          <v-autocomplete
            v-if="vocabulary.terms.length"
            v-model="value.pairs[vocabulary.label]"
            :items="vocabulary.terms"
            :item-text="term => term.name || term.label"
            item-value="label"
            clearable
            :label="vocabulary.label"
          ></v-autocomplete>
        </v-flex>
      </v-layout>
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
