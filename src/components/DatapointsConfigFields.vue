<template>
  <v-container fluid grid-list-xs pt-0>
    <v-layout column>
      <v-flex>
        <v-tabs>
          <v-tab>
            Timeframe
          </v-tab>
          <v-tab>
            Params
          </v-tab>
          <v-tab>
            Path
          </v-tab>

          <v-tab-item>
            <v-card flat>
              <v-card-text>
                Coming soon!
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                Coming soon!
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                Coming soon!
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: {
    value: { type: Object, required: true }
  }
}
</script>
