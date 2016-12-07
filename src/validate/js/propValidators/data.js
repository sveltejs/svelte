const disallowed = {
	Literal: true,
	ObjectExpression: true,
	ArrayExpression: true
};

export default function data ( validator, prop ) {
	while ( prop.type === 'ParenthesizedExpression' ) prop = prop.expression;

	// TODO should we disallow references and expressions as well?

	if ( disallowed[ prop.value.type ] ) {
		validator.error( `'data' must be a function`, prop.value.start );
	}
}
