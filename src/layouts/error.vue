<template>
  <v-container py-10>
    <v-row>
      <v-col>
        <div v-if="error.statusCode === 404">
          <h1 class="text-h2 mb-4">{{ error.message }}</h1>
          <p class="text-body-1">
            Please check the URL for typos, or maybe we made a mistake.
          </p>
          <v-btn href="/">Return Home</v-btn>
        </div>

        <div v-else-if="error.isDown">
          <h1 class="text-h2 mb-4">Our systems are offline.</h1>
          <p class="text-body-1">
            Our apologies. We are either performing system maintenance or
            experiencing technical difficulties. Try refreshing the page or
            check back later. If you have any questions, please email us at
            <a :href="`mailto:${infoEmail}?subject=Offline`">{{ infoEmail }}</a
            >.
          </p>
          <v-btn :href="systemStatusURL" target="_blank">
            Visit Our System Status Page
          </v-btn>
        </div>

        <div v-else>
          <h1 class="text-h2 mb-4">Application Error</h1>
          <p class="text-body-1">
            Our apologies. An application error was encountered. The details of
            the error are below. If this persists, please email us at
            <a :href="`mailto:${infoEmail}?subject=Error`">{{ infoEmail }}</a
            >.
          </p>
          <p class="text-body-1">
            <code>{{ error.message }}</code>
          </p>
          <v-btn href="/">Return Home</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'minimal',

  props: {
    error: { type: Object, required: true }
  }
}
</script>
