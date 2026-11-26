<script>
	import { getAbortSignal } from 'svelte';

	const queue = [];

	function push(value) {
		if (value === 1) return 1;
		const d = Promise.withResolvers();

		queue.push(() => d.resolve(value));

		const signal = getAbortSignal();
		signal.onabort = () => d.reject(signal.reason);

		return d.promise;
	}

	function shift() {
		queue.shift()?.();
	}

	function pop() {
		queue.pop()?.();
	}

	let n = $state(1);
</script>

<button onclick={() => n++}>
	{$state.eager(n)}
</button>

<button onclick={shift}>shift</button>
<button onclick={pop}>pop</button>

<p>{n} = {await push(n)}</p>
