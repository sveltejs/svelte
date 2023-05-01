<script>
	import Forward from './Forward.svelte';

  const name = 'prop';
  const slot = `${name}-${name}`;
</script>

<Forward prop={name} >
	<span {slot}>
		lol
	</span>
</Forward>
