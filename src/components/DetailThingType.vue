<template>
  <v-card>
    <v-container fluid>
      <v-row dense>
        <v-col class="headline">
          <slot>Equipment</slot>
          <v-subheader v-if="thingType"
            >{{ thingType | thingTypeName }} {{ thingType.model }}</v-subheader
          ><v-subheader v-else>No equipment defined</v-subheader>
        </v-col>
      </v-row>

      <v-row v-if="thingType && externalImages.length">
        <v-col
          v-for="(item, index) in externalImages"
          :key="index"
          cols="12"
          sm="6"
          md="3"
        >
          <v-img :src="item.url" contain max-height="320" />
        </v-col>
      </v-row>
    </v-container>

    <v-card-actions>
      <v-btn v-if="editing && thingTypeId" color="primary" @click="remove">
        <v-icon>{{ mdiMinus }}</v-icon>
      </v-btn>

      <v-btn v-if="editing && !thingTypeId" color="primary" @click="add">
        <v-icon>{{ mdiPlus }}</v-icon>
      </v-btn>

      <v-btn
        v-if="!editing && thingTypeId"
        :to="{
          name: 'equipments-thingTypeId',
          params: {
            thingTypeId
          }
        }"
        color="orange"
        dark
        nuxt
        ><v-icon left>{{ mdiHexagonSlice6 }}</v-icon
        >Equipment Details</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import itemEditing from '@/mixins/item-editing'

export default {
  mixins: [itemEditing],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  async fetch() {
    const { thingTypeId } = this

    // Fetch referenced thing type
    if (thingTypeId) {
      await this.fetchThingTypes({
        query: {
          _id: thingTypeId,
          $select: [
            '_id',
            'external_links',
            'name',
            'model',
            'oem_company_id',
            'oem_company_lookup',
            'reseller_company_id',
            'reseller_company_lookup'
          ]
        }
      })
    }
  },

  computed: {
    ...mapGetters({
      getThingType: 'thing-types/get'
    }),

    externalLinks() {
      return this.thingType.external_links || []
    },

    externalImages() {
      return this.externalLinks.filter(item => item.title === 'Image')
    },

    thingType() {
      return this.getThingType(this.thingTypeId)
    },

    thingTypeId() {
      return this.value.thing_type_id
    }
  },

  methods: {
    ...mapActions({
      fetchThingTypes: 'thing-types/find'
    })
  }
}
</script>
