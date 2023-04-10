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
                    rules="required"
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
                    name="slug"
                    :rules="{
                      required: true,
                      regex: /^[a-z0-9-]+$/
                    }"
                  >
                    <v-text-field
                      v-model.trim="value.slug"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Slug"
                      required
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider v-slot="{ errors }" name="full_name">
                    <v-text-field
                      v-model.trim="value.full_name"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Full name"
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider v-slot="{ errors }" name="description">
                    <v-textarea
                      v-model.trim="value.description"
                      :error-messages="errors"
                      :readonly="!editing"
                      auto-grow
                      label="Description"
                    ></v-textarea>
                  </ValidationProvider>

                  <ValidationProvider
                    v-slot="{ errors }"
                    name="url"
                    :rules="{
                      url: {
                        protocols: ['http', 'https'],
                        require_protocol: true
                      }
                    }"
                  >
                    <v-text-field
                      v-model.trim="value.url"
                      :error-messages="errors"
                      :readonly="!editing"
                      label="Url"
                      required
                    ></v-text-field>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <standard-options
                :editing="editing"
                :value="value"
                as="organizations"
              />

              <standard-audit v-if="!editing" :value="value" />

              <standard-identifier v-if="!editing" :value="value" />
            </v-container>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-general-config
            :editing="editing"
            :value="value"
            @add="addGeneralConfig"
            @edit="editGeneralConfig"
            @remove="removeGeneralConfig"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-access-levels
            :editing="editing"
            :value="value"
            @add="addAccessLevel"
            @edit="editAccessLevel"
            @remove="removeAccessLevel"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <detail-external-refs
            :editing="editing"
            :value="value"
            @add="addExternalReference"
            @edit="editExternalReference"
            @remove="removeExternalReference"
          />
        </v-col>
      </v-row>

      <detail-dialog
        ref="generalConfigDialog"
        v-model="generalConfig"
        max-width="800"
        @commit="commitGeneralConfig"
      >
        <template #title>Specify configuration</template>
        <template #default>
          <general-config-fields
            v-model="generalConfig"
            :settings-resolved="configSettingsResolved"
          />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="accessLevelDialog"
        v-model="accessLevel"
        @commit="commitAccessLevel"
      >
        <template #title>Specify access level</template>
        <template #default>
          <access-level-fields v-model="accessLevel" />
        </template>
      </detail-dialog>

      <detail-dialog
        ref="externalRefDialog"
        v-model="externalReference"
        @commit="commitExternalReference"
      >
        <template #title>Specify external reference</template>
        <template #default>
          <external-reference-fields
            v-model="externalReference"
            :type-resolved="externalRefTypeResolved"
          />
        </template>
      </detail-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import accessLevel from '@/mixins/access-level'
import externalReference from '@/mixins/external-reference'
import generalConfig from '@/mixins/general-config'
import AccessLevelFields from '@/components/AccessLevelFields'
import DetailAccessLevels from '@/components/DetailAccessLevels'
import DetailDialog from '@/components/DetailDialog'
import DetailExternalRefs from '@/components/DetailExternalRefs'
import DetailGeneralConfig from '@/components/DetailGeneralConfig'
import ExternalReferenceFields from '@/components/ExternalReferenceFields'
import GeneralConfigFields from '@/components/GeneralConfigFields'
import StandardAudit from '@/components/StandardAudit'
import StandardIdentifier from '@/components/StandardIdentifier'
import StandardOptions from '@/components/StandardOptions'

export default {
  components: {
    AccessLevelFields,
    DetailAccessLevels,
    DetailDialog,
    DetailExternalRefs,
    DetailGeneralConfig,
    ExternalReferenceFields,
    GeneralConfigFields,
    StandardAudit,
    StandardIdentifier,
    StandardOptions,
    ValidationProvider
  },

  mixins: [accessLevel, externalReference, generalConfig],

  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>
