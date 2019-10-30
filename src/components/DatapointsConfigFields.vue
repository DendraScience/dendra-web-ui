<template>
  <v-container fluid pa-0>
    <v-layout column>
      <v-flex>
        <v-tabs
          v-model="value.tabIndex"
          background-color="primary"
          dark
          fixed-tabs
        >
          <v-tab>
            Parameters
          </v-tab>
          <v-tab>
            Timeframe
          </v-tab>
          <v-tab>
            Expression
          </v-tab>

          <v-tab-item>
            <v-card flat>
              <v-container fluid pt-4>
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

                    <v-btn class="mb-2" @click="pasteSample"
                      >Paste Sample</v-btn
                    >
                  </v-flex>

                  <v-flex>
                    <ValidationProvider
                      name="params"
                      :rules="{
                        resolved_valid: paramsResolved
                      }"
                    >
                      <v-textarea
                        id="textarea1571758369645"
                        v-model.trim="value.params"
                        :error-messages="paramsResolved.error"
                        background-color="grey darken-4"
                        dark
                        label="Config params"
                        rows="16"
                        spellcheck="false"
                        filled
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
                  resolved_valid: dateRangeResolved
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

          <v-tab-item>
            <v-card flat>
              <slot name="expression" :value="value" />
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
import { jsonFormat } from '@/lib/utils'

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
      this.value.params = jsonFormat(this.paramsResolved.data)
    },

    pasteSample(item) {
      const { value } = this
      const pathItem = this.pathItems.find(item => item.value === value.path)

      if (pathItem) this.value.params = jsonFormat(pathItem.spec.sample)
    }
  }
}
</script>

<style>
#textarea1571758369645 {
  font-family: monospace !important;
}
</style>
