<template>
  <v-layout column>
    <v-flex>
      <v-container grid-list-xl>
        <v-layout row>
          <v-flex xs12>
            <h3 class="display-2 mb-2">Theme</h3>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs6>
            <v-btn block color="primary">Primary</v-btn>
            <v-btn block color="secondary">Secondary</v-btn>
            <v-btn block color="tertiary" dark>Tertiary</v-btn>
            <v-btn block color="accent">Accent</v-btn>
          </v-flex>

          <v-flex xs6>
            <v-btn block outline color="primary">Primary</v-btn>
            <v-btn block outline color="secondary">Secondary</v-btn>
            <v-btn block outline color="tertiary" dark>Tertiary</v-btn>
            <v-btn block outline color="accent">Accent</v-btn>
          </v-flex>

          <v-flex xs6>
            <v-btn block color="info">Info</v-btn>
            <v-btn block color="warning">Warning</v-btn>
            <v-btn block color="error">Error</v-btn>
            <v-btn block color="success">Success</v-btn>
          </v-flex>

          <v-flex xs6>
            <v-btn block outline color="info">Info</v-btn>
            <v-btn block outline color="warning">Warning</v-btn>
            <v-btn block outline color="error">Error</v-btn>
            <v-btn block outline color="success">Success</v-btn>
          </v-flex>

          <v-flex xs12>
            <v-alert :value="true" type="info">
              This is a info alert. {{ lorem }}
            </v-alert>

            <v-alert :value="true" type="warning">
              This is a warning alert. {{ lorem }}
            </v-alert>

            <v-alert :value="true" type="error">
              This is a error alert. {{ lorem }}
            </v-alert>

            <v-alert :value="true" type="success">
              This is a success alert. {{ lorem }}
            </v-alert>
          </v-flex>

          <v-flex xs12>
            <v-alert :value="true" outline type="info">
              This is a info alert. {{ lorem }}
            </v-alert>

            <v-alert :value="true" outline type="warning">
              This is a warning alert. {{ lorem }}
            </v-alert>

            <v-alert :value="true" outline type="error">
              This is a error alert. {{ lorem }}
            </v-alert>

            <v-alert :value="true" outline type="success">
              This is a success alert. {{ lorem }}
            </v-alert>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data: () => ({
    lorem:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  })
}
</script>
