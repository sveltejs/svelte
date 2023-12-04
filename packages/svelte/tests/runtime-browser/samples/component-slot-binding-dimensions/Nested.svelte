<script>
	// bind:clientHeight on the parent is not really part of the test, just here for forwarding the value
	export let clientHeight;
</script>

<p bind:clientHeight>
	<slot/>
</p>
