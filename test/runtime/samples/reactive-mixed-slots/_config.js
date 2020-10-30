export default {
	html: `
    <div slot='named'></div>
    <a href='___init'>___init</a>
    `,

	test({ assert, component, target }) {
        component.value = 'update';
        
        assert.htmlEqual(target.innerHTML, `
            <div slot='named'></div>
            <a href='___update'>___update</a>
		`);
	}
};
