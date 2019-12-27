export default {
	props: {
		things: [
			{ klass: 'small', text: 'One',},
			{ text: 'Two',},
			{ klass: 'big', text: 'Ten',},
		]
	},

	html: `
		<div>
			<div slot="foo"><span class="small">One</span></div>
			<div slot="foo"><span class="no-class">Two</span></div>
			<div slot="foo"><span class="big">Three</span></div>
		</div>`,

	test({ assert, component, target }) {
		component.things = [
			{ klass: 'small', text: 'One', },
			{ text: 'Two', },
			{ klass: 'big', text: 'Ten', },
			{ klass: 'huge', text: 'Ten Million', },
		];
		assert.htmlEqual(target.innerHTML, `
		<div>
			<div slot="foo"><span class="small">One</span></div>
			<div slot="foo"><span class="no-class">Two</span></div>
			<div slot="foo"><span class="big">Three</span></div>
			<div slot="foo"><span class="huge">Ten Million</span></div>
		</div>`);
	}
};