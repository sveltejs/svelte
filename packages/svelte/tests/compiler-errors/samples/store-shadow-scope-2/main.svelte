<script>
	import { writable } from 'svelte/store';
	const user = writable(0);
	const users = [];
	$: selected = users.find(user => user.id == $user);

	$: console.log($user);
</script>
