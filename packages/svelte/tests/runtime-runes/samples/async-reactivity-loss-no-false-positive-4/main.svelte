<script>
	let x = $state(0);
	let y = $state(0);
</script>

<button
	onclick={() => {
		x++;
		queueMicrotask(() => queueMicrotask(() => y++));
	}}
>
	increment
</button>

{await x}
{y}
