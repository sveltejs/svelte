<script>
	let count = $state(0);
	let muted = $state(false);
	let volume = $state(0.5);
	let value = $state(undefined);
</script>

<audio {muted} {volume}></audio>
<input defaultValue={value} />
<p>{count}</p>
<button onclick={() => count++}>unrelated update</button>
<button
	onclick={() => {
		muted = !muted;
		volume = 0.25;
		value = 'updated';
	}}>change properties</button
>
<button onclick={() => (value = undefined)}>clear default</button>
