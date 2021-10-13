<template>
  <span class="text-xs-right text-no-wrap">
    <v-tooltip v-if="value.is_enabled === false" bottom>
      <template #activator="{ on }">
        <v-icon class="mx-1" color="red" v-on="on">{{  mdiEngineOff,
        }}</v-icon>
      </template>
      <span>Disabled</span>
    </v-tooltip>

    <v-tooltip v-if="value.is_hidden === true" bottom>
      <template #activator="{ on }">
        <v-icon class="mx-1" color="indigo" v-on="on">{{ mdiEyeOff }}</v-icon>
      </template>
      <span>Hidden</span>
    </v-tooltip>

    <v-tooltip v-if="!hideDescription && value.description" bottom>
      <template #activator="{ on }">
        <v-icon class="mx-1" v-on="on">{{ mdiNoteText }}</v-icon>
      </template>
      <span>{{ value.description }}</span>
    </v-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    hideDescription: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>
