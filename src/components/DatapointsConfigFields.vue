<template>
  <v-container fluid pt-0>
    <v-layout column>
      <v-flex>
        <v-tabs v-model="value.tabIndex">
          <v-tab>
            Parameters
          </v-tab>
          <v-tab>
            Timeframe
          </v-tab>

          <v-tab-item>
            <v-card flat>
              <v-container fluid>
                <v-layout column>
                  <v-flex>
                    <ValidationProvider name="path" rules="required">
                      <v-select
                        v-model="value.path"
                        :items="pathItems"
                        item-text="text"
                        item-value="value"
                        label="Path"
                        prepend-inner-icon="mdi-settings"
                        solo
                      ></v-select>
                    </ValidationProvider>
                  </v-flex>
                </v-layout>

                <v-layout v-if="value.path" column>
                  <v-flex>
                    <v-btn
                      :disabled="!paramsResolved.valid"
                      class="mb-2"
                      @click="makePretty"
                      >Make Pretty</v-btn
                    >

                    <v-btn class="mb-2" @click="pasteSnippet"
                      >Paste Snippet</v-btn
                    >
                  </v-flex>

                  <v-flex>
                    <ValidationProvider
                      name="params"
                      :rules="{
                        params_resolved: paramsResolved
                      }"
                    >
                      <v-textarea
                        id="datapointsConfigFieldsParamsTextarea"
                        v-model.trim="value.params"
                        background-color="grey darken-4"
                        dark
                        :error-messages="paramsResolved.error"
                        rows="16"
                        class="params-textarea"
                        spellcheck="false"
                        outlined
                      ></v-textarea>
                    </ValidationProvider>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-tab-item>

          <v-tab-item>
            <v-card flat>
              <ValidationProvider
                :rules="{
                  date_range_resolved: dateRangeResolved
                }"
              >
                <date-range-picker v-model="value.dateRange" nullable show-time>
                  <template v-slot:footer>
                    <span class="font-weight-medium">
                      <span v-if="!dateRangeResolved.valid">
                        Please specify a begin and end time
                      </span>
                      <span
                        v-else-if="
                          dateRangeResolved.from && dateRangeResolved.to
                        "
                      >
                        Begins at
                        {{
                          dateRangeResolved.from
                            | moment('', ['format', 'lll (UTC)'])
                        }}
                        and ends before
                        {{
                          dateRangeResolved.to
                            | moment('', ['format', 'lll (UTC)'])
                        }}</span
                      >
                      <span
                        v-else-if="
                          !dateRangeResolved.from && dateRangeResolved.to
                        "
                      >
                        Begins with first row and ends before
                        {{
                          dateRangeResolved.to
                            | moment('', ['format', 'lll (UTC)'])
                        }}</span
                      >
                      <span
                        v-else-if="
                          dateRangeResolved.from && !dateRangeResolved.to
                        "
                      >
                        Begins at
                        {{
                          dateRangeResolved.from
                            | moment('', ['format', 'lll (UTC)'])
                        }}
                        and returns all rows thereafter</span
                      >
                    </span>
                  </template>
                </date-range-picker>
              </ValidationProvider>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import DateRangePicker from '@/components/DateRangePicker'

export default {
  components: {
    DateRangePicker,
    ValidationProvider
  },

  props: {
    dateRangeResolved: { type: Object, required: true },
    paramsResolved: { type: Object, required: true },
    pathItems: { type: Array, required: true },
    value: { type: Object, required: true }
  },

  methods: {
    makePretty() {
      this.value.params = JSON.stringify(this.paramsResolved.data, null, 2)
    },

    pasteSnippet(item) {
      const { value } = this
      const pathItem = this.pathItems.find(item => item.value === value.path)

      if (pathItem)
        this.value.params = JSON.stringify(pathItem.spec.snippet, null, 2)
    }
  }
}
</script>

<style>
#datapointsConfigFieldsParamsTextarea {
  font-family: monospace !important;
}
</style>
