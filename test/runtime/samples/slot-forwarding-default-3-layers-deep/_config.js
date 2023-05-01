export default {
	compileOptions: {
		dev: false 
	},
	html: `
		Default here is applied
		<h3 slot="first">First slot</h3>
		Second slot's default text
		Default here is applied
		First slot's default text
		<h4 slot="second">Second slot</h3>
		<h3>Default slot</h3>
		First slot's default text
		Second slot's default text
	`
};
