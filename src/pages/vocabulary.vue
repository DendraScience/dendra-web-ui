<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light mb-2">Vocabulary</h2>
      </v-col>
    </v-row>

    <feathers-vuex-find
      v-slot="{ isFindPending: loading, items: schemes }"
      :query="{
        is_enabled: true,
        $sort: { name: 1 }
      }"
      service="schemes"
    >
      <v-row>
        <v-col cols="12" md="8">
          <v-select
            v-model="selectedSchemeId"
            :items="schemes"
            :loading="loading"
            :item-text="scheme => `${scheme.name} (${scheme._id})`"
            hide-details
            item-value="_id"
            label="Scheme"
            outlined
          >
          </v-select>
        </v-col>
      </v-row>
    </feathers-vuex-find>

    <feathers-vuex-find
      v-slot="{ items: vocabularies }"
      :query="{
        is_enabled: true,
        is_hidden: false,
        scheme_id: selectedSchemeId,
        $sort: { label: 1 }
      }"
      service="vocabularies"
      watch="query"
    >
      <v-row no-gutters>
        <v-col>
          <v-row v-for="vocabulary in vocabularies" :key="vocabulary._id">
            <v-col>
              <v-card>
                <v-card-title class="headline">
                  {{ vocabulary.label }}
                </v-card-title>

                <v-container fluid pt-0>
                  <v-row dense>
                    <v-col>
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
                    </v-col>
                  </v-row>

                  <standard-audit :value="vocabulary" />
                  <standard-identifier :value="vocabulary" />
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </feathers-vuex-find>
  </v-container>
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
