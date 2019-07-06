<template>
  <form @submit.prevent="submit">
    <v-container fluid pa-0>
      <v-layout column>
        <v-flex>
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="title"
                v-validate="'required|max:100'"
                :error-messages="errors.collect('title')"
                :readonly="!editing"
                data-vv-name="title"
                label="Title"
                required
              ></v-text-field>

              <v-select
                v-model="state"
                :items="stateItems"
                :readonly="!editing"
                label="State"
              ></v-select>

              <v-textarea
                v-model="description"
                v-validate="'required|max:5000'"
                :error-messages="errors.collect('description')"
                :readonly="!editing"
                auto-grow
                data-vv-name="description"
                label="Description"
              ></v-textarea>
            </v-card-text>

            <v-card-actions>
              <v-chip v-if="id" label>id: {{ id }}</v-chip>
            </v-card-actions>
          </v-card>
        </v-flex>

        <v-flex>
          <annotation-detail-applies v-model="applies" :editing="editing" />
        </v-flex>

        <v-flex>
          <annotation-detail-intervals v-model="intervals" :editing="editing" />
        </v-flex>

        <v-flex>
          <v-card>
            <v-card-title primary-title class="headline">
              Actions
            </v-card-title>

            <v-card-text> </v-card-text>

            <v-card-actions v-if="editing">
              <v-btn color="primary">
                <v-icon left dark>add</v-icon>Exclude
              </v-btn>

              <v-btn color="primary">
                <v-icon left dark>add</v-icon>Evaluate
              </v-btn>

              <v-btn color="primary">
                <v-icon left dark>add</v-icon>Flag
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>

        <v-flex>
          <v-card>
            <v-card-title primary-title class="headline">
              External references
            </v-card-title>

            <v-card-text> </v-card-text>

            <v-card-actions v-if="editing">
              <v-btn color="primary">
                <v-icon left dark>add</v-icon>Reference
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </form>
</template>

<script>
import AnnotationDetailApplies from '@/components/AnnotationDetailApplies'
import AnnotationDetailIntervals from '@/components/AnnotationDetailIntervals'

// import _pick from 'lodash/pick'

// import { mapActions } from 'vuex'

export default {
  $_veeValidate: {
    validator: 'new'
  },

  components: {
    AnnotationDetailApplies,
    AnnotationDetailIntervals
  },

  props: {
    annotation: { default: null, type: Object },
    editing: { default: false, type: Boolean }
  },

  data() {
    const { annotation } = this
    const stateItems = ['pending', 'approved', 'rejected']

    if (annotation) {
      return {
        id: annotation._id,
        title: annotation.title,
        state: annotation.state,
        stateItems,
        description: annotation.description,
        applies: {
          stationIds: annotation.station_ids
            ? annotation.station_ids.slice()
            : [],
          datastreamIds: annotation.datastream_ids
            ? annotation.datastream_ids.slice()
            : []
        },
        intervals: {
          items: annotation.intervals ? annotation.intervals.slice() : []
        }
      }
    }

    return {
      title: null,
      state: 'pending',
      stateItems,
      description: null,
      applies: {
        stationIds: [],
        datastreamIds: []
      },
      intervals: {
        items: []
      }
    }
  },

  computed: {},

  mounted() {},

  methods: {
    //   async submit() {
    //     if (!(await this.$validator.validateAll())) return
    //     const $set = _pick(this, ['email', 'name'])
    //     return this.patch([this.id, { $set }, {}])
    //       .then(() =>
    //         this.$emit('status', {
    //           type: 'success',
    //           message: 'Account updated.' // TODO: Localize
    //         })
    //       )
    //       .catch(({ message }) =>
    //         this.$emit('status', { type: 'error', message })
    //       )
    //   }
  }
}
</script>
