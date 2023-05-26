<script>
  export let id;
</script>

<g {id}>
  <circle cx="50" cy="50" r="10" />
  <rect width="100" height="100" />
</g>

<style>
  circle {
    fill: var(--circle-color);
  }
  rect {
    fill: var(--rect-color)
  }
</style>