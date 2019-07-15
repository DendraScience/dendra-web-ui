<template>
  <form @submit.prevent="submit">
    <v-container fluid pa-0>
      <v-layout column>
        <v-flex>
          <v-card>
            <v-container fluid pt-0 px-3>
              <v-layout column>
                <v-flex>
                  <v-text-field
                    v-model.trim="value.title"
                    v-validate="'required|min:5|max:100'"
                    :error-messages="errors.collect('title')"
                    :readonly="!editing"
                    data-vv-name="title"
                    label="Title"
                    required
                  ></v-text-field>

                  <v-select
                    v-model="value.state"
                    :items="stateItems"
                    :readonly="!editing"
                    label="State"
                  ></v-select>

                  <v-textarea
                    v-model.trim="value.description"
                    v-validate="'required|min:5|max:5000'"
                    :error-messages="errors.collect('description')"
                    :readonly="!editing"
                    auto-grow
                    data-vv-name="description"
                    label="Description"
                  ></v-textarea>
                </v-flex>
              </v-layout>
            </v-container>

            <audit-text v-if="!editing" v-model="value" />

            <v-card-actions>
              <v-chip v-if="value._id" label>id: {{ value._id }}</v-chip>
              <v-chip v-if="value.version_id" class="ml-2" label
                >version: {{ value.version_id }}</v-chip
              >
            </v-card-actions>
          </v-card>
        </v-flex>

        <v-flex>
          <annotation-detail-applies
            :editing="editing"
            :value="value"
            @add="appliesAdd"
            @remove="appliesRemove"
          />
        </v-flex>

        <v-flex>
          <annotation-detail-intervals :editing="editing" :value="value" />
        </v-flex>

        <v-flex>
          <annotation-detail-actions :editing="editing" :value="value" />
        </v-flex>

        <v-flex>
          <detail-external-refs :editing="editing" :value="value" />
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog
      v-model="datastreamDialog"
      fullscreen
      hide-overlay
      lazy
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary" fixed prominent>
          <v-btn icon dark @click="datastreamDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Select datastreams</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark flat @click="appliesAddDatastream">OK</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <datastream-search :org="org" style="margin-top: 64px;">
          <template v-slot:select="{ item }">
            <v-icon
              color="primary"
              @click="
                incrementQuantity({
                  id: item._id,
                  max: 1
                })
              "
              >{{
                item.quantitySelected ? 'check_box' : 'check_box_outline_blank'
              }}</v-icon
            >
          </template>
        </datastream-search>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="stationDialog"
      fullscreen
      hide-overlay
      lazy
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary" fixed prominent>
          <v-btn icon dark @click="stationDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Select stations</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark flat @click="appliesAddStation">OK</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <station-search :org="org" style="margin-top: 64px;">
          <template v-slot:select="{ item }">
            <v-icon
              color="primary"
              @click="
                incrementQuantity({
                  id: item._id,
                  max: 1
                })
              "
              >{{
                item.quantitySelected ? 'check_box' : 'check_box_outline_blank'
              }}</v-icon
            >
          </template>
        </station-search>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import AnnotationDetailActions from '@/components/AnnotationDetailActions'
import AnnotationDetailApplies from '@/components/AnnotationDetailApplies'
import AnnotationDetailIntervals from '@/components/AnnotationDetailIntervals'
import AuditText from '@/components/AuditText'
import DatastreamSearch from '@/components/DatastreamSearch'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import StationSearch from '@/components/StationSearch'

import _union from 'lodash/union'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AnnotationDetailActions,
    AnnotationDetailApplies,
    AnnotationDetailIntervals,
    AuditText,
    DatastreamSearch,
    DetailExternalRefs,
    StationSearch
  },

  inject: ['$validator'],

  props: {
    editing: { default: false, type: Boolean },
    org: { default: null, type: Object },
    value: { type: Object, required: true }
  },

  data: () => ({
    datastreamDialog: false,
    stationDialog: false,
    stateItems: ['pending', 'approved', 'rejected']
  }),

  computed: {
    ...mapGetters({
      cartCount: 'cart/count',
      cartIds: 'cart/ids'
    })
  },

  methods: {
    ...mapMutations({
      incrementQuantity: 'cart/incrementQuantity',
      resetCart: 'cart/reset'
    }),

    appliesAdd(item) {
      this.resetCart()

      this[`${item.target}Dialog`] = true
    },

    appliesAddDatastream() {
      this.$set(
        this.value,
        'datastream_ids',
        _union(this.value.datastream_ids, this.cartIds)
      )
      this.datastreamDialog = false
    },

    appliesAddStation() {
      this.$set(
        this.value,
        'station_ids',
        _union(this.value.station_ids, this.cartIds)
      )
      this.stationDialog = false
    },

    appliesRemove(item) {
      const key = `${item.target}_ids`
      const ids = this.value[key] || []

      this.$set(this.value, key, ids.filter(id => id !== item.id))
    }
  }
}
</script>
