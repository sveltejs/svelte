<script>
	function foo(node, params) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.foo = t;
			}
		};
	}

	let list = $state([]);
	let id = 0;

	function push() {
		list.push({ id: id++ })
	}

	function removeFirst() {
		list.splice(0, 1);
	}
</script>

<button onclick={push}>Push</button>
<button onclick={removeFirst}>Remove</button>

<ul>
	{#each list as item (item.id)}
		<li out:foo>{item.id}</li>
	{/each}
</ul>
