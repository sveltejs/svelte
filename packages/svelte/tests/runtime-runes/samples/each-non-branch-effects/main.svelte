<script>
	let items = $state([]);

	const proxy = new Proxy(items, {
		get: (target, prop) => {
			try {
				$effect.pre(() => {
					return () => {};
				});
			} catch {}

			return Reflect.get(target, prop);
		}
	});

	function add() {
		items.push(items.length + 1);
	}

	function remove() {
		items.pop();
	}
</script>

{#each proxy as item}
	<span>{item}</span>
{/each}

<button class="add" onclick={add}>add</button>
<button class="remove" onclick={remove}>remove</button>
