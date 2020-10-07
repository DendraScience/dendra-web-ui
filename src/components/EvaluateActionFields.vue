<template>
  <v-container fluid>
    <v-row dense>
      <v-col align="end">
        <a class="body-2" href="https://mathjs.org/" target="_blank">
          See Math.js for help
        </a>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <ValidationProvider
          name="expr"
          :rules="{
            required,
            resolved_valid: exprResolved
          }"
        >
          <v-text-field
            v-model.trim="value.expr"
            :error-messages="exprResolved.error || resultResolved.error"
            :prepend-inner-icon="mdiCalculator"
            autofocus
            label="Expression"
            required
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col>
        <v-row dense>
          <v-col>
            <v-tabs v-model="tabIndex">
              <v-tab> Datapoint </v-tab>
              <v-tab> Attributes </v-tab>

              <v-tab-item>
                <ValidationProvider
                  name="datapoint"
                  :rules="{
                    resolved_valid: datapointResolved
                  }"
                >
                  <v-textarea
                    id="textarea1571758315461"
                    v-model.trim="value.datapoint"
                    :error-messages="datapointResolved.error"
                    background-color="grey darken-4"
                    dark
                    dense
                    filled
                    label="Input datapoint"
                    rows="14"
                    spellcheck="false"
                  ></v-textarea>
                </ValidationProvider>
              </v-tab-item>

              <v-tab-item>
                <ValidationProvider
                  name="attributes"
                  :rules="{
                    resolved_valid: attributesResolved
                  }"
                >
                  <v-textarea
                    id="textarea1572143364122"
                    v-model.trim="value.attributes"
                    :error-messages="attributesResolved.error"
                    background-color="grey darken-4"
                    dark
                    dense
                    filled
                    label="Input attributes"
                    rows="14"
                    spellcheck="false"
                  ></v-textarea>
                </ValidationProvider>
              </v-tab-item>
            </v-tabs>
          </v-col>

          <v-col>
            <v-tabs :value="0">
              <v-tab> Datapoint </v-tab>

              <v-tab-item>
                <ValidationProvider
                  name="after"
                  :rules="{
                    resolved_valid: resultResolved
                  }"
                >
                  <v-textarea
                    id="textarea1571758329826"
                    :value="resultResolved.datapoint"
                    label="Evaluated datapoint"
                    background-color="grey darken-4"
                    dark
                    dense
                    filled
                    readonly
                    rows="14"
                    spellcheck="false"
                  ></v-textarea>
                </ValidationProvider>
              </v-tab-item>
            </v-tabs>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationProvider
  },

  props: {
    attributesResolved: { type: Object, required: true },
    datapointResolved: { type: Object, required: true },
    exprResolved: { type: Object, required: true },
    required: { default: true, type: Boolean },
    resultResolved: { type: Object, required: true },
    value: { type: Object, required: true }
  },

  data: () => ({
    tabIndex: 0
  })
}
</script>

<style>
#textarea1571758315461,
#textarea1571758329826,
#textarea1572143364122 {
  font-family: monospace !important;
}
</style>
