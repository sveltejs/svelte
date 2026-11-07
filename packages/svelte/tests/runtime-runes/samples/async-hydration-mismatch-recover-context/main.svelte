<script>
	import { setContext } from 'svelte';
	import Field from './Field.svelte';

	setContext('parent', 'parent');
</script>

<Field label={await Promise.resolve('clicks')} />
