import deindent from '../utils/deindent.js';
import counter from '../utils/counter.js';

export default {
	enter ( generator ) {
		const name = generator.current.name.replace( 'If', 'Else' );

		generator.push({
			name,

			initStatements: [],
			updateStatements: [],
			teardownStatements: [],

			counter: counter()
		});
	},

	leave ( generator ) {
		generator.addRenderer( generator.current );
		generator.pop();
	}
};
