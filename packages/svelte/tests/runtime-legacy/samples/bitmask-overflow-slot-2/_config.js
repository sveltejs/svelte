import { test } from '../../test';

export default test({
	html: `
	<p>d1</p>
	<p>d2</p>
	<p>d3</p>
	<p>d4</p>
	<p>d5</p>
	<p>d6</p>
	<p>d7</p>
	<p>d8</p>
	<p>d9</p>
	<p>d10</p>
	<p>d11</p>
	<p>d12</p>
	<p>d13</p>
	<p>d14</p>
	<p>d15</p>
	<p>d16</p>
	<p>d17</p>
	<p>d18</p>
	<p>d19</p>
	<p>d20</p>
	<p>d21</p>
	<p>d22</p>
	<p>d23</p>
	<p>d24</p>
	<p>d25</p>
	<p>d26</p>
	<p>d27</p>
	<p>d28</p>
	<p>d29</p>
	<p>d30</p>
	<p>d31</p>
	<p>2</p>
	<p>1</p>
	<p>0:1</p>
	<p>2:1</p>
	<p>0</p>
	<p>1</p>
	<p>2</p>
	`,

	test({ assert, component, target }) {
		component.reads = {};

		component._0 = 'a';
		component._1 = 'b';
		component._2 = 'c';

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>d1</p>
			<p>d2</p>
			<p>d3</p>
			<p>d4</p>
			<p>d5</p>
			<p>d6</p>
			<p>d7</p>
			<p>d8</p>
			<p>d9</p>
			<p>d10</p>
			<p>d11</p>
			<p>d12</p>
			<p>d13</p>
			<p>d14</p>
			<p>d15</p>
			<p>d16</p>
			<p>d17</p>
			<p>d18</p>
			<p>d19</p>
			<p>d20</p>
			<p>d21</p>
			<p>d22</p>
			<p>d23</p>
			<p>d24</p>
			<p>d25</p>
			<p>d26</p>
			<p>d27</p>
			<p>d28</p>
			<p>d29</p>
			<p>d30</p>
			<p>d31</p>
			<p>c</p>
			<p>b</p>
			<p>a:b</p>
			<p>c:b</p>
			<p>a</p>
			<p>b</p>
			<p>c</p>
		`
		);

		assert.deepEqual(component.reads, {
			_0: 2,
			_1: 2
		});
	}
});
