<script>
	export let date;
</script>

<input type='date' bind:value={date}>
<p>{Object.prototype.toString.call(date)} {date}</p>
