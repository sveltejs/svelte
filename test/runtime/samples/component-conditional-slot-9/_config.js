export default {
	html: `
		<div>
			<span>2 ~ 3</span>
			<div>
				<span>3 ~ 5</span>
				<div>
					<span>5 ~ 8</span>
					<hr>
					#2 &gt; 5
				</div>
			</div>
		</div>
	`,
	test({ assert, component, target }) {
		component.array = [3, 5, 8];
		assert.htmlEqual(target.innerHTML, `
			<div>
				<span>2 ~ 5</span>
				<div>
					<span>5 ~ 10</span>
					<div>
						<span>10 ~ 18</span>
						<hr>
						#2 &gt; 5
					</div>
					<hr>
					#1 &gt; 5
				</div>
			</div>
		`);

		component.value = 8;
		assert.htmlEqual(target.innerHTML, `
			<div>
				<span>8 ~ 11</span>
				<div>
					<span>11 ~ 16</span>
					<div>
						<span>16 ~ 24</span>
						<hr>
						#2 &gt; 5
					</div>
					<hr>
					#1 &gt; 5
				</div>
				<hr>
				#0 &gt; 5
			</div>
		`);

		component.array = [1, 3];
		assert.htmlEqual(target.innerHTML, `
			<div>
				<span>8 ~ 9</span>
				<div>
					<span>9 ~ 12</span>
					<div>
						fallback 24
					</div>
					<hr>
					#1 &gt; 5
				</div>
				<hr>
				#0 &gt; 5
			</div>
		`);
		
		component.array = [];
		assert.htmlEqual(target.innerHTML, `
			<div>
				fallback 16
			</div>
		`);
	}
};
