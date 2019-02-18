<script>
	import Nested from './Nested.svelte';
	export let currentUser;
</script>

<Nested user={currentUser}/>