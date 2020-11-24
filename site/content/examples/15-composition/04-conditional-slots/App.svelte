<script>
	import Profile from "./Profile.svelte";
</script>

<Profile>
	<span slot="name">Bob</span>
	<span slot="email">bob@email.com</span>
</Profile>

<Profile>
	<span slot="name">Alice</span>
	<span slot="phone">12345678</span>
</Profile>
