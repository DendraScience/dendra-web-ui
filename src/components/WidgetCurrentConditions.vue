<template>
  <v-simple-table :height="height" dense fixed-header>
    <template #default>
      <thead>
        <tr>
          <th v-if="items.length" :class="headerClass">Current conditions</th>
          <th v-else :class="headerClass">Sorry, no datastreams yet</th>
          <th :class="headerClass" class="text-right">Value</th>
          <th :class="headerClass">Unit</th>
          <th v-if="showLastSeen" :class="headerClass">Last seen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.valueKey">
          <th>{{ item.name }}</th>
          <td class="body-2 text-right">
            <span v-if="item.unitKey === 'direction'"
              >({{ item.value | direction }}) {{ item.value }}</span
            >
            <span v-else>{{ item.value }} </span>
          </td>
          <td class="body-2">{{ item.unit && item.unit.text }}</td>
          <td v-if="showLastSeen" class="body-2">
            {{ item.lastSeenTime | dateTimeFormatLocal('(no data)') }}
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import currentConditions from '@/mixins/current-conditions'

export default {
  mixins: [currentConditions],

  props: {
    height: { default: 100, type: Number },
    showLastSeen: { default: false, type: Boolean }
  },

  data: () => ({
    headerClass: 'grey darken-1 white--text'
  })
}
</script>
