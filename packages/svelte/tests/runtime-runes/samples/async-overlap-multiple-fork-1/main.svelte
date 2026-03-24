<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let f;

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<p>a {await delay(a)} | b {await delay(b)} | c {c}</p>

<button onclick={() => {f = fork(() => {a++;b++;});}}>
	a and b (fork)
</button>
<button onclick={() => {a++;c++;}}>
	a and c
</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button>
<button onclick={() => f.commit()}>commit fork</button>
