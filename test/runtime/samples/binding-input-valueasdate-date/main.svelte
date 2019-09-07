<script>
	export let date;
</script>

<input type='date' bind:valueAsDate={date}>
<p>{Object.prototype.toString.call(date)} {date}</p>
