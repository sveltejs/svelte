export default {
	props: {
		x: 'bar'
	},

	html: `
		<svg>
			<circle class="svelte-1h4oike" cx=50 cy=50 r=50 />
			<circle class="foo svelte-1h4oike" cx=150 cy=50 r=50 />
			<circle class="bar svelte-1h4oike" cx=250 cy=50 r=50 />
		</svg>
	`
};
