<template>
  <v-layout wrap>
    <v-flex v-if="typeof value.is_active === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_active"
        :disabled="!editing || $cannot('assign', value, '$set.is_active')"
        hide-details
        label="active"
      ></v-checkbox>
    </v-flex>

    <v-flex v-if="typeof value.is_enabled === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_enabled"
        :disabled="!editing || $cannot('assign', value, '$set.is_enabled')"
        hide-details
        label="enabled"
      ></v-checkbox>
    </v-flex>

    <v-flex v-if="typeof value.is_hidden === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_hidden"
        :disabled="!editing || $cannot('assign', value, '$set.is_hidden')"
        hide-details
        label="hidden"
      ></v-checkbox>
    </v-flex>

    <v-flex v-if="typeof value.is_geo_protected === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_geo_protected"
        :disabled="
          !editing || $cannot('assign', value, '$set.is_geo_protected')
        "
        hide-details
        label="geo protected"
      ></v-checkbox>
    </v-flex>

    <v-flex v-if="typeof value.is_stationary === 'boolean'" shrink pt-0>
      <v-checkbox
        v-model="value.is_stationary"
        :disabled="!editing || $cannot('assign', value, '$set.is_stationary')"
        hide-details
        label="stationary"
      ></v-checkbox>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>
