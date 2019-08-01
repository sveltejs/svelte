<script>
	export let testName;

	function myHelper(testName) {
		return testName;
	}
</script>

<style>
  div {
    color: purple;
  }
</style>

<div class={myHelper(testName)}></div>
