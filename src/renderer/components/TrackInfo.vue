<template>
  <div class="track-info">
    <article class="media">
      <figure class="media-left">
        <p class="image is-64x64">
          <img src="https://bulma.io/images/placeholders/128x128.png" />
        </p>
      </figure>
      <div class="media-content">
        <div>
          <div v-if="track">
            <h3>{{track.info.title}}</h3>
            <small>{{track.info.albumartist}}</small>
          </div>
          <div v-else>
            <h3>No track</h3>
            <small>Select a track to play</small>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  props: {
    track: {
      type: Object,
      default: null
    }
  }
};
</script>

<style>
</style>