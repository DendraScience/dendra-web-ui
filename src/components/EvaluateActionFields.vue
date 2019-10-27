<template>
  <v-container fluid pt-0>
    <v-layout column>
      <v-flex align-self-end>
        <a href="https://mathjs.org/" target="_blank">
          See Math.js for help
        </a>
      </v-flex>

      <v-flex>
        <ValidationProvider
          name="expr"
          :rules="{
            required: true,
            resolved_valid: exprResolved
          }"
        >
          <v-text-field
            v-model.trim="value.expr"
            :error-messages="exprResolved.error || resultResolved.error"
            autofocus
            label="Expression"
            prepend-inner-icon="mdi-calculator"
            required
            solo
          ></v-text-field>
        </ValidationProvider>
      </v-flex>
    </v-layout>

    <v-flex>
      <v-container grid-list-md pa-0>
        <v-layout wrap>
          <v-flex>
            <v-tabs v-model="tabIndex">
              <v-tab>
                Datapoint
              </v-tab>
              <v-tab>
                Attributes
              </v-tab>

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
                    label="Input datapoint"
                    background-color="grey darken-4"
                    dark
                    rows="16"
                    spellcheck="false"
                    filled
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
                    label="Input attributes"
                    background-color="grey darken-4"
                    dark
                    rows="16"
                    spellcheck="false"
                    filled
                  ></v-textarea>
                </ValidationProvider>
              </v-tab-item>
            </v-tabs>
          </v-flex>

          <v-flex>
            <v-tabs :value="0">
              <v-tab>
                Datapoint
              </v-tab>

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
                    readonly
                    rows="16"
                    spellcheck="false"
                    filled
                  ></v-textarea>
                </ValidationProvider>
              </v-tab-item>
            </v-tabs>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
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
