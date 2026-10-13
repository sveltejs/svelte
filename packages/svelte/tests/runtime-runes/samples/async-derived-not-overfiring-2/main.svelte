<script>
	let a = $state(0);
	let b = $state(0);
	let a_d = $derived(await delay(a, 'a_d'));
	let c = $derived(await delay(a_d + b, 'c'));

	function delay(value, source) {
		if (!value) return value;
		console.log(source + ': ' + value);
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	let deferred = [];
</script> 

<button onclick={() => a++}>increment a</button>
<button onclick={() => {a++; b++}}>increment a & b</button>
<button onclick={() => deferred.splice(1,1)[0]?.()}>shift second</button>
<button onclick={() => deferred.shift()?.()}>shift</button>

<p>{c}</p>
