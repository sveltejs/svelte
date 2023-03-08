<script>
  export let naturalWidth = 0;
  export let naturalHeight = 0;
</script>

<img src="something.jpg" bind:naturalWidth bind:naturalHeight>

{naturalWidth} x {naturalHeight}
