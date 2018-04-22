import Generator from '../../Generator';

export default class Expression {
	compiler: Generator;
	info: any;

	constructor(compiler, info) {
		this.compiler = compiler;
		this.info = info;
	}
}