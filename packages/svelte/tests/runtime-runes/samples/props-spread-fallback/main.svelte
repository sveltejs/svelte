<script>
	import Component from './Component.svelte';

	let props = $state({
		propA: true,
		propB: undefined
	});
</script>

<button on:click={() => {props.propA = !props.propA}}>change propA</button>
<button on:click={() => {props.propB = props.propB ? undefined : 'defined'}}>change propB</button>
<Component {...props}/>
