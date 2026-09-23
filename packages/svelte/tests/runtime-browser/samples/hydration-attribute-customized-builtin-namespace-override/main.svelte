<script>
	const inherited = { is: 'inherited-namespace-button', 'data-n': 1 };
	const own = { is: 'own-namespace-button', 'data-n': 1 };
</script>

<button {...inherited}>inherited</button>
<button {...own}>own</button>
