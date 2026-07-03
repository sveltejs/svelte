<script>
	import { fork } from "svelte";

	let portalKey = $state('a');
	let outletKey = $state('b');

	let queued = [];
	let first = true;
	let f;

	function push(v) {
		if (first) {
			first = false;
			return v;
		}

		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => portalKey = portalKey === 'a' ? 'b' : 'a'}>toggle portalKey</button>
<button onclick={() => f = fork(() => outletKey = outletKey === 'a' ? 'b' : 'a')}>toggle outletKey</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => queued.pop()?.()}>pop</button>
<button onclick={() => f.commit()}>commit</button>

{await push(portalKey + outletKey)}

{#portal portalKey}
	hi
{/portal}

{@portal outletKey}
