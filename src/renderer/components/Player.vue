<template>
  <div class="player section has-background-primary has-text-white">
    <div class="columns is-vcentered">
      <TrackInfo :track="track" class="column" />
      <div class="controls column is-2 has-text-centered">
        <div class="level">
          <a class="level-item level-right has-text-white" @click="prev">
            <b-icon icon="skip-previous"></b-icon>
          </a>
          <a class="level-item has-text-white" @click="pause" v-if="playing">
            <b-icon icon="pause-circle-outline" size="is-medium"></b-icon>
          </a>
          <a class="level-item has-text-white" @click="play" v-else>
            <b-icon icon="play-circle-outline" size="is-medium"></b-icon>
          </a>
          <a class="level-item level-left has-text-white" @click="next">
            <b-icon icon="skip-next"></b-icon>
          </a>
        </div>
      </div>
      <div class="controls column">
        <div class="columns">
          <div class="column is-6 is-offset-6">
            <b-field horizontal>
              <template slot="label">
                <b-icon icon="volume-high has-text-white" v-if="volume >= 1"></b-icon>
                <b-icon icon="volume-mute has-text-white" v-else-if="volume <= 0"></b-icon>
                <b-icon icon="volume-medium has-text-white" v-else></b-icon>
              </template>
              <b-slider
                type="is-white"
                v-model="volume"
                :min="0"
                :max="1"
                :step="0.01"
                :tooltip="false"
                @input="setVolume"
              ></b-slider>
            </b-field>
          </div>
        </div>
      </div>
    </div>
    <section class="track-loading container" v-show="track && !ready">Processing waveform</section>
    <section class="waveform container" ref="wave" :class="{hidden: !ready}"></section>
  </div>
</template>

<script>
import WaveSurfer from "wavesurfer.js";
import TrackInfo from "@/components/TrackInfo";

export default {
  name: "Player",
  components: { TrackInfo },
  data() {
    return {
      ready: false,
      volume: 1
    };
  },
  computed: {
    track() {
      return this.$store.state.player.track;
    },
    playing() {
      return this.$store.state.player.playing;
    }
  },
  watch: {
    track(val) {
      if (val) this.load(val);
    }
  },
  mounted() {
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.wave,
      backend: "MediaElement",
      barWidth: 2,
      height: 64,
      waveColor: "#ffffff",
      responsive: true
    });
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  },
  methods: {
    load(track) {
      this.ready = false;
      this.getTrackWaveform(track).then(waveform => {
        console.log(waveform);
        this.wavesurfer.load(track.path, waveform.data);
        if (waveform) this.ready = true;
      });
      this.wavesurfer.on("waveform-ready", () => (this.ready = true));
      this.wavesurfer.on("ready", () => {
        this.play();
      });
    },
    getTrackWaveform(track) {
      if (!track.waveformPath) return Promise.resolve(null);
      return this.$axios.get(track.waveformPath).then(r => {
        return r.data;
      });
    },
    handleKeyDown(e) {
      switch (e.key) {
        case " ":
          if (this.playing) this.pause();
          else this.play();
          break;
      }
    },
    play() {
      this.wavesurfer.play();
      this.$store.dispatch("player/play");
    },
    pause() {
      this.wavesurfer.pause();
      this.$store.dispatch("player/pause");
    },
    stop() {
      this.wavesurfer.stop();
      this.$store.dispatch("player/stop");
    },
    next() {
      this.$store.dispatch("player/next");
    },
    prev() {
      this.$store.dispatch("player/prev");
    },
    setVolume(val) {
      this.wavesurfer.setVolume(val);
    }
  }
};
</script>

<style lang="scss">
.waveform {
  &.hidden {
    height: 0;
    overflow: hidden;
  }
}
</style>