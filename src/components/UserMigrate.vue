<template>
  <v-card>
    <v-card-title class="headline">Migrate my account</v-card-title>

    <v-card-text
      ><p>
        You are currently logged in with a user account that was manually set up
        by our support team. You may continue to use this account for now;
        however, we encourage users to migrate to a Dendra Cloud account that
        supports Single Sign-On (SSO).
      </p>

      <p>
        By migrating to Dendra Cloud, you can log in using
        <a href="https://orcid.org/" target="_blank">ORCID</a> and Google. You
        may also continue to use email and password, with the added benefit of
        resetting your password in case you forget it.
      </p>

      <h4>IMPORTANT for API and CLI users</h4>
      <p>
        If you migrate, you will be unable to use your credentials to access our
        API or CLI tool. Our support team can manually issue you an API key if
        you need authenticated API access for scripts. This workaround is
        temporary as we are working on a feature that allows you to manage your
        own API keys.
      </p>

      <h4>Instructions</h4>
      <p>
        If you click Migrate below, you will be logged out and redirected to the
        Dendra Cloud login page. On this page you can choose to continue with
        SSO, or click Sign up to create a new account with email and password.
        <strong
          >You must ensure that the SSO or new account is tied to the email
          <code>{{ email }}</code> in order for your current permissions to be
          automatically carried over.</strong
        >
      </p>
    </v-card-text>

    <v-card-actions>
      <v-btn color="warning" @click="submit"
        >Log out and Migrate my account
        <v-icon right>{{ mdiArrowRight }}</v-icon></v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'

export default {
  props: {
    user: { default: null, type: Object }
  },

  data() {
    const { user } = this

    return {
      email: user.email
    }
  },

  methods: {
    ...mapActions('auth', ['logout']),

    ...mapMutations({
      setLocal: 'session/setLocal'
    }),

    async submit() {
      // Native logout
      this.setLocal(true)
      await this.logout()

      window.location.assign(this.canopyLoginURL)
    }
  }
}
</script>
