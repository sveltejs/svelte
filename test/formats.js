import deindent from '../src/utils/deindent.js';
import assert from 'assert';
import { svelte, env, setupHtmlEqual } from './helpers.js';

function testAmd ( code, expectedId, dependencies, html ) {
	const fn = new Function( 'define', code );

	return env().then( window => {
		function define ( id, deps, factory ) {
			assert.equal( id, expectedId );
			assert.deepEqual( deps, Object.keys( dependencies ) );

			const SvelteComponent = factory( ...Object.keys( dependencies ).map( key => dependencies[ key ] ) );

			const main = window.document.body.querySelector( 'main' );
			const component = new SvelteComponent({ target: main });

			assert.htmlEqual( main.innerHTML, html );

			component.destroy();
		}

		define.amd = true;

		fn( define );
	});
}

function testCjs ( code, dependencyById, html ) {
	const fn = new Function( 'module', 'exports', 'require', code );

	return env().then( window => {
		const module = { exports: {} };
		const require = id => {
			return dependencyById[ id ];
		};

		fn( module, module.exports, require );

		const SvelteComponent = module.exports;

		const main = window.document.body.querySelector( 'main' );
		const component = new SvelteComponent({ target: main });

		assert.htmlEqual( main.innerHTML, html );

		component.destroy();
	});
}

function testIife ( code, name, globals, html ) {
	const fn = new Function( Object.keys( globals ), `${code}\n\nreturn ${name};` );

	return env().then( window => {
		const SvelteComponent = fn( ...Object.keys( globals ).map( key => globals[ key ] ) );

		const main = window.document.body.querySelector( 'main' );
		const component = new SvelteComponent({ target: main });

		assert.htmlEqual( main.innerHTML, html );

		component.destroy();
	});
}

function testEval ( code, name, globals, html ) {
	const fn = new Function( Object.keys( globals ), `return ${code};` );

	return env().then( window => {
		const SvelteComponent = fn( ...Object.keys( globals ).map( key => globals[ key ] ) );

		const main = window.document.body.querySelector( 'main' );
		const component = new SvelteComponent({ target: main });

		assert.htmlEqual( main.innerHTML, html );

		component.destroy();
	});
}

describe( 'formats', () => {
	before( setupHtmlEqual );

	describe( 'amd', () => {
		it( 'generates an AMD module', () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { code } = svelte.compile( source, {
				format: 'amd',
				amd: { id: 'foo' }
			});

			return testAmd( code, 'foo', { answer: 42 }, `<div>42</div>` );
		});
	});

	describe( 'cjs', () => {
		it( 'generates a CommonJS module', () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { code } = svelte.compile( source, {
				format: 'cjs'
			});

			return testCjs( code, { answer: 42 }, `<div>42</div>` );
		});
	});

	describe( 'iife', () => {
		it( 'generates a self-executing script', () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { code } = svelte.compile( source, {
				format: 'iife',
				name: 'Foo',
				globals: {
					answer: 'answer'
				}
			});

			return testIife( code, 'Foo', { answer: 42 }, `<div>42</div>` );
		});
	});

	describe( 'umd', () => {
		it( 'generates a UMD build', () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { code } = svelte.compile( source, {
				format: 'umd',
				name: 'Foo',
				globals: {
					answer: 'answer'
				},
				amd: {
					id: 'foo'
				}
			});

			return testAmd( code, 'foo', { answer: 42 }, `<div>42</div>` )
				.then( () => testCjs( code, { answer: 42 }, `<div>42</div>` ) )
				.then( () => testIife( code, 'Foo', { answer: 42 }, `<div>42</div>` ) );
		});
	});

	describe( 'eval', () => {
		it( 'generates a self-executing script that returns the component on eval', () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { code } = svelte.compile( source, {
				format: 'eval',
				globals: {
					answer: 'answer'
				}
			});

			return testEval( code, 'Foo', { answer: 42 }, `<div>42</div>` );
		});
	});
});
