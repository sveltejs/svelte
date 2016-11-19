<p>{{a}} + {{b}} = {{c}}</p>
<p>{{c}} * {{c}} = {{cSquared}}</p>

<script>
	export default {
		data: () => ({
			a: 1,
			b: 2
		}),

		computed: {
			c: ( a, b ) => a + b,
			cSquared: c => c * c
		}
	};
</script>
