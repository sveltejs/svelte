<script>
	import Prop from './Prop.svelte';
	import Bare from './Bare.svelte';

	let count = $state(1);
</script>

<button onclick={() => (count += 1)}>{count}</button>
<Prop />
<Prop constructor={count} toString="given" />
<Bare />
<Bare valueOf={count} />
