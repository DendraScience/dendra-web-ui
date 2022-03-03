<template>
  <v-row>
    <v-col>
      <v-row>
        <v-col>
          <v-card>
            <v-container fluid>
              <v-row>
                <v-col>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="name"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Name"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="model"
                    rules="required|min:1|max:100"
                  >
                    <v-text-field
                      v-model.trim="value.model"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Model"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <feathers-vuex-find
                    v-if="value.oem_company_id || editing"
                    v-slot="{ isFindPending: loading, items: companies }"
                    :query="{
                      $sort: { name: 1 }
                    }"
                    service="companies"
                  >
                    <v-select
                      v-model="value.oem_company_id"
                      :item-text="company => company.full_name || company.name"
                      :items="companies"
                      :label="loading ? 'Loading...' : 'OEM company'"
                      :loading="loading"
                      :readonly="!editing"
                      :clearable="editing"
                      item-value="_id"
                    ></v-select>
                  </feathers-vuex-find>

                  <feathers-vuex-find
                    v-if="value.reseller_company_id || editing"
                    v-slot="{ isFindPending: loading, items: companies }"
                    :query="{
                      $sort: { name: 1 }
                    }"
                    service="companies"
                  >
                    <v-select
                      v-model="value.reseller_company_id"
                      :item-text="company => company.full_name || company.name"
                      :items="companies"
                      :label="loading ? 'Loading...' : 'Reseller company'"
                      :loading="loading"
                      :readonly="!editing"
                      :clearable="editing"
                      item-value="_id"
                    ></v-select>
                  </feathers-vuex-find>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="description"
                    rules="min:5|max:5000"
                  >
                    <v-textarea
                      v-model.trim="value.description"
                      :error-messages="errors"
                      :readonly="!editing"
                      auto-grow
                      label="Description"
                    ></v-textarea>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <standard-options
                :editing="editing"
                :value="value"
                as="thing-types"
              />
              <standard-audit v-if="!editing" :value="value" />
              <standard-identifier :value="value" />
            </v-container>

            <v-card-actions v-if="!editing">
              <v-btn
                v-if="value.oem_company_id"
                :to="{
                  name: 'companies-companyId',
                  params: {
                    companyId: value.oem_company_id
                  }
                }"
                color="red"
                dark
                nuxt
                ><v-icon left>{{ mdiOfficeBuilding }}</v-icon
                >OEM Details</v-btn
              >
              <v-btn
                v-if="value.reseller_company_id"
                :to="{
                  name: 'companies-companyId',
                  params: {
                    companyId: value.reseller_company_id
                  }
                }"
                color="red"
                dark
                nuxt
                ><v-icon left>{{ mdiOfficeBuilding }}</v-icon
                >Reseller Details</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="!editing && externalImages.length">
        <v-col>
          <detail-images :items="externalImages">
            {{ value | thingTypeName }} {{ value.model }}
          </detail-images>
        </v-col>
      </v-row>

      <feathers-vuex-find
        v-if="!editing"
        v-slot="{ items: organizations }"
        :query="{ is_enabled: true, $sort: { sort_value: 1, name: 1 } }"
        service="organizations"
      >
        <v-row>
          <v-col
            v-for="org in organizations"
            :key="org._id"
            cols="12"
            sm="6"
            md="4"
          >
            <datastream-total
              :is-enabled="true"
              :org="org"
              :show-hidden="$canCreate('datastreams', org)"
              :thing-type-id="value._id"
              hide-actions
              show-org
              total-label="enabled"
            />
          </v-col>
        </v-row>
      </feathers-vuex-find>

      <v-row>
        <v-col>
          <detail-external-links
            :editing="editing"
            :value="value"
            @add="addExternalLink"
            @edit="editExternalLink"
            @remove="removeExternalLink"
          />
        </v-col>
      </v-row>

      <!-- TODO: Implement editing later! -->
      <v-row v-if="!editing">
        <v-col>
          <detail-external-refs :editing="editing" :value="value" />
        </v-col>
      </v-row>

      <detail-dialog
        ref="externalLinkDialog"
        v-model="externalLink"
        @commit="commitExternalLink"
      >
        <template #title>Specify external link</template>
        <template #default>
          <external-link-fields v-model="externalLink" />
        </template>
      </detail-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import externalLink from '@/mixins/external-link'
import DatastreamTotal from '@/components/DatastreamTotal'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalLinks from '@/components/DetailExternalLinks'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailImages from '@/components/DetailImages'
import ExternalLinkFields from '@/components/ExternalLinkFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    DatastreamTotal,
    DetailDialog,
    DetailExternalLinks,
    DetailExternalRefs,
    DetailImages,
    ExternalLinkFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  mixins: [externalLink],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  },

  computed: {
    externalLinks() {
      return this.value.external_links || []
    },

    externalImages() {
      return this.externalLinks.filter(item => item.title === 'Image')
    }
  }
}
</script>
