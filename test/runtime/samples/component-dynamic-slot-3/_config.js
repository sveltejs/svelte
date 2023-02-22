export default {
	html: `
		<div id="_">
			value: _
	 		<hr>
			<div id="a">
				value: a
	 			<hr>
				<div id="b">
					value: b
	 				<hr>
					<span>fallback folder</span>
					<hr>
					<div>#2 level</div>
				</div>
				<hr>
				<span>fallback file</span>
			</div>
			<hr>
			<span>fallback file</span>
		</div>
	`,
	test({ assert, component, target }) {
		const lvl1 = target.querySelector('#a');
		const lvl2 = target.querySelector('#b');
		component.paths = ['x', 'y', 'z'];
		assert.htmlEqual(target.innerHTML, `
			<div id="_">
			value: _
			<hr>
			<div id="x">
				value: x
				<hr>
				<div id="y">
					value: y
					<hr>
					<div id="z">
						value: z
						<hr>
						<span>fallback folder</span>
						<hr>
						<div>#3 level</div>
					</div>
					<hr>
					<span>fallback file</span>
				</div>
				<hr>
				<span>fallback file</span>
			</div>
			<hr>
			<span>fallback file</span>
		</div>
		`);

		assert.equal(lvl1, target.querySelector('#x'));
		assert.equal(lvl2, target.querySelector('#y'));
	
		component.paths = ['p'];
		assert.htmlEqual(target.innerHTML, `
			<div id="_">
			value: _
			<hr>
			<div id="p">
				value: p
				<hr>
				<span>fallback folder</span>
				<hr>
				<div>#1 level</div>
			</div>
			<hr>
			<span>fallback file</span>
		</div>
		`);

		assert.equal(lvl1, target.querySelector('#p'));
	}
};
