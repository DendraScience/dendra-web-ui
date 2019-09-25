<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout>
          <v-flex>
            <h3 class="display-2 font-weight-light mb-2">Vocabulary</h3>
          </v-flex>
        </v-layout>

        <feathers-vuex-find
          v-slot="{ isFindPending: loading, items: schemes }"
          :query="{
            is_enabled: true,
            $sort: { name: 1 }
          }"
          service="schemes"
        >
          <v-layout>
            <v-flex xs12 md8>
              <v-select
                v-model="selectedSchemeId"
                :items="schemes"
                :loading="loading"
                :item-text="scheme => `${scheme.name} (${scheme._id})`"
                item-value="_id"
                label="Scheme"
                outlined
              >
              </v-select>
            </v-flex>
          </v-layout>
        </feathers-vuex-find>

        <feathers-vuex-find
          v-slot="{ items: vocabularies }"
          :query="{
            is_enabled: true,
            is_hidden: false,
            scheme_id: selectedSchemeId,
            $sort: { label: 1 }
          }"
          :watch="'query'"
          service="vocabularies"
        >
          <v-layout column>
            <v-flex v-for="vocabulary in vocabularies" :key="vocabulary._id">
              <v-card>
                <v-card-title class="headline">
                  {{ vocabulary.label }}
                </v-card-title>

                <v-container fluid>
                  <v-layout column>
                    <v-flex>
                      <v-data-table
                        :headers="headers"
                        :hide-default-header="$vuetify.breakpoint.xsOnly"
                        :items="vocabulary.terms"
                        dense
                        disable-pagination
                        disable-sort
                        hide-default-footer
                        item-key="label"
                      >
                      </v-data-table>
                    </v-flex>
                  </v-layout>

                  <standard-audit :value="vocabulary" />
                  <standard-identifier :value="vocabulary" />
                </v-container>
              </v-card>
            </v-flex>
          </v-layout>
        </feathers-vuex-find>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'

export default {
  components: {
    StandardAudit,
    StandardIdentifier
  },

  middleware: ['no-org'],

  data: () => ({
    headers: [
      {
        align: 'left',
        text: 'Label',
        value: 'label',
        width: '30%'
      },
      {
        align: 'left',
        text: 'Name',
        value: 'name'
      }
    ],

    selectedSchemeId: 'ds'
  })
}
</script>
