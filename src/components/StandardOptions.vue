<template>
  <v-row>
    <v-col v-if="typeof value.is_active === 'boolean'" cols="auto">
      <v-checkbox
        v-model="value.is_active"
        :disabled="!editing || $cannotAssign(as, value, '$set.is_active')"
        hide-details
        label="active"
      ></v-checkbox>
    </v-col>

    <v-col v-if="typeof value.is_enabled === 'boolean'" cols="auto">
      <v-checkbox
        v-model="value.is_enabled"
        :disabled="!editing || $cannotAssign(as, value, '$set.is_enabled')"
        hide-details
        label="enabled"
      ></v-checkbox>
    </v-col>

    <v-col v-if="typeof value.is_hidden === 'boolean'" cols="auto">
      <v-checkbox
        v-model="value.is_hidden"
        :disabled="!editing || $cannotAssign(as, value, '$set.is_hidden')"
        hide-details
        label="hidden"
      ></v-checkbox>
    </v-col>

    <v-col v-if="typeof value.is_geo_protected === 'boolean'" cols="auto">
      <v-checkbox
        v-model="value.is_geo_protected"
        :disabled="
          !editing || $cannotAssign(as, value, '$set.is_geo_protected')
        "
        hide-details
        label="geo protected"
      ></v-checkbox>
    </v-col>

    <v-col v-if="typeof value.is_stationary === 'boolean'" cols="auto">
      <v-checkbox
        v-model="value.is_stationary"
        :disabled="!editing || $cannotAssign(as, value, '$set.is_stationary')"
        hide-details
        label="stationary"
      ></v-checkbox>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    as: { type: String, required: true },
    editing: { default: false, type: Boolean },
    value: { type: Object, required: true }
  }
}
</script>
