<script>
	import { writable } from 'svelte/store';
	const user = writable(0);
	const users = [];

	$: console.log($user);
	$: selected = users.find(user => user.id == $user);
</script>
