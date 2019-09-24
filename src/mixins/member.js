export default {
  data: () => ({
    member: {
      dialog: false,
      roles: [
        {
          text: 'contact'
        }
      ],
      selectDisabled: false
    }
  }),

  methods: {
    addMember() {
      this.member = {
        dialog: true,
        personId: null,
        roles: this.member.roles.map(role => ({
          text: role.text,
          value: null
        })),
        selectDisabled: false
      }

      requestAnimationFrame(() => {
        this.$refs.memberDialog.$refs.observer.reset()
      })
    },

    editMember({ id }) {
      const roles = this.value.involved_parties
        .filter(party => party.person_id === id)
        .reduce((accum, party) => accum.concat(party.roles), [])

      this.member = {
        dialog: true,
        personId: id,
        roles: this.member.roles.map(role => ({
          text: role.text,
          value: roles.includes(role.text)
        })),
        selectDisabled: true
      }

      requestAnimationFrame(() => {
        this.$refs.memberDialog.$refs.observer.reset()
      })
    },

    commitMember({ personId, roles }) {
      const { value } = this

      const involvedParties = value.involved_parties.filter(
        party => party.person_id !== personId
      )
      const newRoles = roles.filter(role => role.value).map(role => role.text)
      if (newRoles.length)
        involvedParties.push({
          person_id: personId,
          roles: newRoles
        })

      value.involved_parties = involvedParties

      this.member.dialog = false
    },

    removeMember(item) {
      this.value.involved_parties = this.value.involved_parties.filter(
        (action, index) => index !== item.key
      )
    }
  }
}
