<script>
	export let time;
</script>

<input type="time" bind:valueAsDate={time}>
<p>{Object.prototype.toString.call(time)} {time}</p>
