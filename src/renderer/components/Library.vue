<template>
  <section class="library">
    <b-table
      :data="tracks"
      bordered
      striped
      narrowed
      hoverable
      :loading="isLoading"
      @dblclick="play"
    >
      <template slot-scope="props">
        <b-table-column field="id" label="ID" width="40" numeric>{{ props.index+1 }}</b-table-column>
        <b-table-column field="title" label="Title">{{ props.row.info.title }}</b-table-column>
        <b-table-column field="duration" label="Duration">{{ props.row.format.duration | time }}</b-table-column>
        <b-table-column field="albumartist" label="Artist">{{ props.row.info.albumartist }}</b-table-column>
        <b-table-column
          field="date"
          label="Date"
          centered
        >{{ new Date(props.row.added).toLocaleDateString() }}</b-table-column>
        <b-table-column label="Format">{{ props.row.ext }}</b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large"></b-icon>
            </p>
            <p>Nothing here.</p>
          </div>
        </section>
      </template>
    </b-table>
  </section>
</template>

<script>
export default {
  filters: {
    time: function(value) {
      if (!value) return "";
      var date = new Date(0);
      date.setSeconds(value);
      return date.toISOString().substr(11, 8);
    }
  },
  computed: {
    tracks() {
      return this.$store.state.library.tracks;
    },
    isLoading() {
      return this.$store.state.library.loading;
    }
  },
  methods: {
    play(track) {
      this.$store.dispatch("player/load", track);
      this.$store.dispatch("player/playlist", this.tracks);
    }
  }
};
</script>