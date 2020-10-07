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
      this.member = {
        dialog: true,
        personId: id,
        roles: this.getMemberRoles(id),
        selectDisabled: true
      }

      requestAnimationFrame(() => {
        this.$refs.memberDialog.$refs.observer.reset()
      })
    },

    getMemberRoles(id) {
      const roles = this.value.involved_parties
        .filter(party => party.person_id === id)
        .reduce((accum, party) => accum.concat(party.roles), [])

      return this.member.roles.map(role => ({
        text: role.text,
        value: roles.includes(role.text)
      }))
    },

    setMemberRole(id, text, value = true) {
      const roles = this.getMemberRoles(id)
      const role = roles.find(role => role.text === text)

      if (role) {
        role.value = value
        this.commitMember({ personId: id, roles })
      }
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
