<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="display-2 font-weight-light my-2">Theme</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <v-btn block class="mb-2" color="primary">Primary</v-btn>
        <v-btn block class="mb-2" color="secondary">Secondary</v-btn>
        <v-btn block class="mb-2" color="tertiary" dark>Tertiary</v-btn>
        <v-btn block class="mb-2" color="accent">Accent</v-btn>
      </v-col>

      <v-col cols="6">
        <v-btn block outlined class="mb-2" color="primary">Primary</v-btn>
        <v-btn block outlined class="mb-2" color="secondary">Secondary</v-btn>
        <v-btn block outlined class="mb-2" color="tertiary" dark
          >Tertiary</v-btn
        >
        <v-btn block outlined class="mb-2" color="accent">Accent</v-btn>
      </v-col>

      <v-col cols="6">
        <v-btn block class="mb-2" color="info">Info</v-btn>
        <v-btn block class="mb-2" color="warning">Warning</v-btn>
        <v-btn block class="mb-2" color="error">Error</v-btn>
        <v-btn block class="mb-2" color="success">Success</v-btn>
      </v-col>

      <v-col cols="6">
        <v-btn block outlined class="mb-2" color="info">Info</v-btn>
        <v-btn block outlined class="mb-2" color="warning">Warning</v-btn>
        <v-btn block outlined class="mb-2" color="error">Error</v-btn>
        <v-btn block outlined class="mb-2" color="success">Success</v-btn>
      </v-col>

      <v-col cols="12">
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
      </v-col>

      <v-col cols="12">
        <v-alert :value="true" outlined type="info">
          This is a info alert. {{ lorem }}
        </v-alert>

        <v-alert :value="true" outlined type="warning">
          This is a warning alert. {{ lorem }}
        </v-alert>

        <v-alert :value="true" outlined type="error">
          This is a error alert. {{ lorem }}
        </v-alert>

        <v-alert :value="true" outlined type="success">
          This is a success alert. {{ lorem }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['no-org'],

  data: () => ({
    lorem:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  })
}
</script>
