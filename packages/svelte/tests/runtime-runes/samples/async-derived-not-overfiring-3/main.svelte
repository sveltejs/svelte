<script>
	let a = $state(0);
	let b = $state(0);
	const runs = { parent: 0, child: 0 };

	let parent = $derived((runs.parent++, a * 2));
	let child = $derived((runs.child++, parent + parent + b));

	const queued = [];
	function push(v) {
		if (!v) return v;
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>
<button onclick={() => queued.shift()?.()}>resolve</button>
<button
	onclick={() => {
		console.log(`parent ${runs.parent}, child ${runs.child}`);
		runs.parent = runs.child = 0;
	}}>log runs</button
>

<p>{await push(a)}</p>
<p>{child} {child}</p>
