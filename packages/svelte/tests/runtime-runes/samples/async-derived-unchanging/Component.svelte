<script lang="ts">
	let queue: Array<{ deferred: PromiseWithResolvers<number>; value: number }> = [];
	let inited = false;

	function push(value: number) {
		const deferred = Promise.withResolvers<number>();
		queue.push({ deferred, value });

		if (!inited) {
			inited = true;
			shift();
		}

		return deferred.promise;
	}

	function shift() {
		const next = queue.shift();
		next?.deferred.resolve(next.value);
	}

	let n = $state(0);
	let current = $derived(await push(n));
</script>

<button onclick={shift}>shift</button>
<button onclick={() => n += 1}>increment</button>

<p>{n}: {Math.min(current, 3)}</p>
