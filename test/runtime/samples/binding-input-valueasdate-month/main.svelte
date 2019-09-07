<script>
	export let month;
</script>

<input type="month" bind:valueAsDate={month}>
<p>{Object.prototype.toString.call(month)} {month}</p>
