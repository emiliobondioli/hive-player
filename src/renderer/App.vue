<template>
  <div id="app">
    <Player />
    <router-view v-if="config"></router-view>
    <b-sidebar type="is-light" fullheight overlay :open.sync="sidebar"></b-sidebar>
    <div class="container" v-if="setup">
      <h2>Hive player</h2>
      <b-button
        type="is-primary"
        @click="$electron.ipcRenderer.send('begin-config')"
      >Set library path</b-button>
    </div>
  </div>
</template>

<script>
import Player from "@/components/Player";
export default {
  name: "vuetron",
  components: { Player },
  data() {
    return {
      config: null,
      setup: false,
      sidebar: false
    };
  },
  mounted() {
    this.$electron.ipcRenderer.on("begin-config", () => {
      console.log("begin setup");
      this.setup = true;
    });
    this.$electron.ipcRenderer.send("config");
    this.$electron.ipcRenderer.on("config", (event, config) => {
      console.log(config);
      this.config = config;
      this.setup = false;
    });
    this.$store.dispatch("library/setupListeners");
  }
};
</script>

<style>
/* CSS */
</style>
