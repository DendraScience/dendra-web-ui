<template>
  <v-row no-gutters>
    <v-col>
      <v-tabs
        v-model="value.tabIndex"
        background-color="grey lighten-2"
        fixed-tabs
      >
        <v-tab> Parameters </v-tab>
        <v-tab> Timeframe </v-tab>
        <v-tab> Expression </v-tab>

        <v-tab-item>
          <v-card flat>
            <v-container fluid>
              <v-row dense>
                <v-col>
                  <ValidationProvider name="path" rules="required">
                    <v-select
                      v-model="value.path"
                      :items="pathItems"
                      :prepend-inner-icon="mdiCog"
                      hide-details
                      item-text="text"
                      item-value="value"
                      label="Path"
                      solo
                    ></v-select>
                  </ValidationProvider>
                </v-col>
              </v-row>

              <v-row v-if="value.path" dense>
                <v-col>
                  <v-row dense>
                    <v-col>
                      <v-btn
                        :disabled="!paramsResolved.valid"
                        @click="makePretty"
                        >Make Pretty</v-btn
                      >

                      <v-btn @click="pasteSample">Paste Sample</v-btn>
                    </v-col>
                  </v-row>

                  <v-row dense>
                    <v-col>
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
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
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
              <date-range-picker v-model="value.dateRange" optional show-time>
                <template #footer>
                  <div class="text-center">
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
                        <date-chip
                          :time-zone="dateRangeResolved.timeZone"
                          :utc-offset="dateRangeResolved.utcOffset"
                          :value="Object.freeze(dateRangeResolved.from)"
                          class="ma-1"
                          color="success"
                        />
                        and ends before
                        <date-chip
                          :time-zone="dateRangeResolved.timeZone"
                          :utc-offset="dateRangeResolved.utcOffset"
                          :value="Object.freeze(dateRangeResolved.to)"
                          class="ma-1"
                          color="error"
                        />
                      </span>

                      <span
                        v-else-if="
                          !dateRangeResolved.from && dateRangeResolved.to
                        "
                      >
                        Begins with first row and ends before
                        <date-chip
                          :time-zone="dateRangeResolved.timeZone"
                          :utc-offset="dateRangeResolved.utcOffset"
                          :value="Object.freeze(dateRangeResolved.to)"
                          class="ma-1"
                          color="error"
                        />
                      </span>

                      <span
                        v-else-if="
                          dateRangeResolved.from && !dateRangeResolved.to
                        "
                      >
                        Begins at
                        <date-chip
                          :time-zone="dateRangeResolved.timeZone"
                          :utc-offset="dateRangeResolved.utcOffset"
                          :value="Object.freeze(dateRangeResolved.from)"
                          class="ma-1"
                          color="success"
                        />
                        and returns all rows thereafter</span
                      >
                    </span>
                  </div>
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
    </v-col>
  </v-row>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import DateChip from '@/components/DateChip'
import DateRangePicker from '@/components/DateRangePicker'
import { jsonFormat } from '@/lib/utils'

export default {
  components: {
    DateChip,
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
