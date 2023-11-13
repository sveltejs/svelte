<script>
	export let testName;

  export function _() {
    // Make the prop a source. Difference from Svelte 4.
    testName = '';
  }
</script>

<style>
  div {
    color: purple;
  }
</style>

<div class={testName}></div>
