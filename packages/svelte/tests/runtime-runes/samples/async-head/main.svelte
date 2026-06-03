<script lang="ts">
	import A from './A.svelte';
	import B from './B.svelte';
</script>

<A name="a-1" content={await 1} />
<A name="a-2" content={await 2} />
<B name="b-1" content={1} />
<A name="a-3" content={await 3} />
<B name="b-2" content={2} />
<B name="b-3" content={3} />
