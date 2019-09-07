<script>
	export let week;
</script>

<input type="week" bind:valueAsDate={week}>
<p>{Object.prototype.toString.call(week)} {week}</p>
