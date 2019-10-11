<script>
	import ContactCard from './ContactCard.svelte';
</script>

<ContactCard>
	<span slot="name">
		P. Sherman
	</span>

	<span slot="address">
		42 Wallaby Way<br>
		Sydney
	</span>

	<a href="mailto:p.sherman@example.com" slot="email">p.sherman@example.com</a>
</ContactCard>
