<script>
	import { foo } from './utils';
</script>

{#each foo.bar as bar}
	<input type="text" bind:value={bar.value} />
{/each}