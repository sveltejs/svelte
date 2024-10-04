export type JSXElementName = JSXIdentifier | JSXNamespacedName | JSXMemberExpression;
export type JSXMemberExpressionObject = JSXIdentifier | JSXMemberExpression;
export type Atom = string;

export interface Node extends Span {
	type: string;
}

export interface TSIndexSignatureName extends Span {
	type: 'Identifier';
	name: Atom;
	typeAnnotation: TSTypeAnnotation;
}
export type RegExpFlags = {
	/** Global flag */
	G: 1;
	/** Ignore case flag */
	I: 2;
	/** Multiline flag */
	M: 4;
	/** DotAll flag */
	S: 8;
	/** Unicode flag */
	U: 16;
	/** Sticky flag */
	Y: 32;
	/** Indices flag */
	D: 64;
	/** Unicode sets flag */
	V: 128;
};
export interface BindingIdentifier extends Span {
	type: 'Identifier';
	name: Atom;
}
export interface IdentifierReference extends Span {
	type: 'Identifier';
	name: Atom;
}
export interface IdentifierName extends Span {
	type: 'Identifier';
	name: Atom;
}
export interface LabelIdentifier extends Span {
	type: 'Identifier';
	name: Atom;
}
export interface AssignmentTargetRest extends Span {
	type: 'RestElement';
	argument: AssignmentTarget;
}
export interface BindingRestElement extends Span {
	type: 'RestElement';
	argument: BindingPattern;
}
export interface FormalParameterRest extends Span {
	type: 'RestElement';
	argument: BindingPatternKind;
	typeAnnotation?: TSTypeAnnotation;
	optional: boolean;
}
export interface BooleanLiteral extends Span {
	type: 'BooleanLiteral';
	value: boolean;
}
export interface NullLiteral extends Span {
	type: 'NullLiteral';
}
export interface NumericLiteral extends Span {
	type: 'NumericLiteral';
	value: number;
	raw: string;
}
export interface BigIntLiteral extends Span {
	type: 'BigIntLiteral';
	raw: Atom;
}
export interface RegExpLiteral extends Span {
	type: 'RegExpLiteral';
	value: EmptyObject;
	regex: RegExp;
}
export interface RegExp {
	pattern: RegExpPattern;
	flags: RegExpFlags;
}
export type RegExpPattern = { Raw: string } | { Invalid: string } | { Pattern: Pattern };
export type EmptyObject = null;
export interface StringLiteral extends Span {
	type: 'StringLiteral';
	value: Atom;
}
export interface Program extends Span {
	type: 'Program';
	sourceType: SourceType;
	hashbang: Hashbang | null;
	directives: Directive[];
	body: Statement[];
}
export type Expression =
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface ThisExpression extends Span {
	type: 'ThisExpression';
}
export interface ArrayExpression extends Span {
	type: 'ArrayExpression';
	elements: Array<SpreadElement | Expression | null>;
}
export interface ObjectExpression extends Span {
	type: 'ObjectExpression';
	properties: ObjectPropertyKind[];
}
export type ObjectPropertyKind = ObjectProperty | SpreadElement;
export interface ObjectProperty extends Span {
	type: 'ObjectProperty';
	kind: PropertyKind;
	key: PropertyKey;
	value: Expression;
	init: Expression | null;
	method: boolean;
	shorthand: boolean;
	computed: boolean;
}
export type PropertyKey =
	| IdentifierName
	| PrivateIdentifier
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export type PropertyKind = 'init' | 'get' | 'set';
export interface TemplateLiteral extends Span {
	type: 'TemplateLiteral';
	quasis: TemplateElement[];
	expressions: Expression[];
}
export interface TaggedTemplateExpression extends Span {
	type: 'TaggedTemplateExpression';
	tag: Expression;
	quasi: TemplateLiteral;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TemplateElement extends Span {
	type: 'TemplateElement';
	tail: boolean;
	value: TemplateElementValue;
}
export interface TemplateElementValue {
	raw: Atom;
	cooked: Atom | null;
}
export type MemberExpression =
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface ComputedMemberExpression extends Span {
	type: 'ComputedMemberExpression';
	object: Expression;
	expression: Expression;
	optional: boolean;
}
export interface StaticMemberExpression extends Span {
	type: 'StaticMemberExpression';
	object: Expression;
	property: IdentifierName;
	optional: boolean;
}
export interface PrivateFieldExpression extends Span {
	type: 'PrivateFieldExpression';
	object: Expression;
	field: PrivateIdentifier;
	optional: boolean;
}
export interface CallExpression extends Span {
	type: 'CallExpression';
	callee: Expression;
	typeParameters: TSTypeParameterInstantiation | null;
	arguments: Argument[];
	optional: boolean;
}
export interface NewExpression extends Span {
	type: 'NewExpression';
	callee: Expression;
	arguments: Argument[];
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface MetaProperty extends Span {
	type: 'MetaProperty';
	meta: IdentifierName;
	property: IdentifierName;
}
export interface SpreadElement extends Span {
	type: 'SpreadElement';
	argument: Expression;
}
export type Argument =
	| SpreadElement
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface UpdateExpression extends Span {
	type: 'UpdateExpression';
	operator: UpdateOperator;
	prefix: boolean;
	argument: SimpleAssignmentTarget;
}
export interface UnaryExpression extends Span {
	type: 'UnaryExpression';
	operator: UnaryOperator;
	argument: Expression;
}
export interface BinaryExpression extends Span {
	type: 'BinaryExpression';
	left: Expression;
	operator: BinaryOperator;
	right: Expression;
}
export interface PrivateInExpression extends Span {
	type: 'PrivateInExpression';
	left: PrivateIdentifier;
	operator: BinaryOperator;
	right: Expression;
}
export interface LogicalExpression extends Span {
	type: 'LogicalExpression';
	left: Expression;
	operator: LogicalOperator;
	right: Expression;
}
export interface ConditionalExpression extends Span {
	type: 'ConditionalExpression';
	test: Expression;
	consequent: Expression;
	alternate: Expression;
}
export interface AssignmentExpression extends Span {
	type: 'AssignmentExpression';
	operator: AssignmentOperator;
	left: AssignmentTarget;
	right: Expression;
}
export type AssignmentTarget =
	| IdentifierReference
	| TSAsExpression
	| TSSatisfiesExpression
	| TSNonNullExpression
	| TSTypeAssertion
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression
	| ArrayAssignmentTarget
	| ObjectAssignmentTarget;
export type SimpleAssignmentTarget =
	| IdentifierReference
	| TSAsExpression
	| TSSatisfiesExpression
	| TSNonNullExpression
	| TSTypeAssertion
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export type AssignmentTargetPattern = ArrayAssignmentTarget | ObjectAssignmentTarget;
export interface ArrayAssignmentTarget extends Span {
	type: 'ArrayAssignmentTarget';
	elements: Array<AssignmentTargetMaybeDefault | AssignmentTargetRest | null>;
}
export interface ObjectAssignmentTarget extends Span {
	type: 'ObjectAssignmentTarget';
	properties: Array<AssignmentTargetProperty | AssignmentTargetRest>;
}
export type AssignmentTargetMaybeDefault =
	| AssignmentTargetWithDefault
	| IdentifierReference
	| TSAsExpression
	| TSSatisfiesExpression
	| TSNonNullExpression
	| TSTypeAssertion
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression
	| ArrayAssignmentTarget
	| ObjectAssignmentTarget;
export interface AssignmentTargetWithDefault extends Span {
	type: 'AssignmentTargetWithDefault';
	binding: AssignmentTarget;
	init: Expression;
}
export type AssignmentTargetProperty =
	| AssignmentTargetPropertyIdentifier
	| AssignmentTargetPropertyProperty;
export interface AssignmentTargetPropertyIdentifier extends Span {
	type: 'AssignmentTargetPropertyIdentifier';
	binding: IdentifierReference;
	init: Expression | null;
}
export interface AssignmentTargetPropertyProperty extends Span {
	type: 'AssignmentTargetPropertyProperty';
	name: PropertyKey;
	binding: AssignmentTargetMaybeDefault;
}
export interface SequenceExpression extends Span {
	type: 'SequenceExpression';
	expressions: Expression[];
}
export interface Super extends Span {
	type: 'Super';
}
export interface AwaitExpression extends Span {
	type: 'AwaitExpression';
	argument: Expression;
}
export interface ChainExpression extends Span {
	type: 'ChainExpression';
	expression: ChainElement;
}
export type ChainElement =
	| CallExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface ParenthesizedExpression extends Span {
	type: 'ParenthesizedExpression';
	expression: Expression;
}
export type Statement =
	| BlockStatement
	| BreakStatement
	| ContinueStatement
	| DebuggerStatement
	| DoWhileStatement
	| EmptyStatement
	| ExpressionStatement
	| ForInStatement
	| ForOfStatement
	| ForStatement
	| IfStatement
	| LabeledStatement
	| ReturnStatement
	| SwitchStatement
	| ThrowStatement
	| TryStatement
	| WhileStatement
	| WithStatement
	| VariableDeclaration
	| Function
	| Class
	| TSTypeAliasDeclaration
	| TSInterfaceDeclaration
	| TSEnumDeclaration
	| TSModuleDeclaration
	| TSImportEqualsDeclaration
	| ImportDeclaration
	| ExportAllDeclaration
	| ExportDefaultDeclaration
	| ExportNamedDeclaration
	| TSExportAssignment
	| TSNamespaceExportDeclaration;
export interface Directive extends Span {
	type: 'Directive';
	expression: StringLiteral;
	directive: Atom;
}
export interface Hashbang extends Span {
	type: 'Hashbang';
	value: Atom;
}
export interface BlockStatement extends Span {
	type: 'BlockStatement';
	body: Statement[];
}
export type Declaration =
	| VariableDeclaration
	| Function
	| Class
	| TSTypeAliasDeclaration
	| TSInterfaceDeclaration
	| TSEnumDeclaration
	| TSModuleDeclaration
	| TSImportEqualsDeclaration;
export interface VariableDeclaration extends Span {
	type: 'VariableDeclaration';
	kind: VariableDeclarationKind;
	declarations: VariableDeclarator[];
	declare: boolean;
}
export type VariableDeclarationKind = 'var' | 'const' | 'let' | 'using' | 'await using';
export interface VariableDeclarator extends Span {
	type: 'VariableDeclarator';
	id: BindingPattern;
	init: Expression | null;
	definite: boolean;
}
export interface EmptyStatement extends Span {
	type: 'EmptyStatement';
}
export interface ExpressionStatement extends Span {
	type: 'ExpressionStatement';
	expression: Expression;
}
export interface IfStatement extends Span {
	type: 'IfStatement';
	test: Expression;
	consequent: Statement;
	alternate: Statement | null;
}
export interface DoWhileStatement extends Span {
	type: 'DoWhileStatement';
	body: Statement;
	test: Expression;
}
export interface WhileStatement extends Span {
	type: 'WhileStatement';
	test: Expression;
	body: Statement;
}
export interface ForStatement extends Span {
	type: 'ForStatement';
	init: ForStatementInit | null;
	test: Expression | null;
	update: Expression | null;
	body: Statement;
}
export type ForStatementInit =
	| VariableDeclaration
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface ForInStatement extends Span {
	type: 'ForInStatement';
	left: ForStatementLeft;
	right: Expression;
	body: Statement;
}
export type ForStatementLeft =
	| VariableDeclaration
	| IdentifierReference
	| TSAsExpression
	| TSSatisfiesExpression
	| TSNonNullExpression
	| TSTypeAssertion
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression
	| ArrayAssignmentTarget
	| ObjectAssignmentTarget;
export interface ForOfStatement extends Span {
	type: 'ForOfStatement';
	await: boolean;
	left: ForStatementLeft;
	right: Expression;
	body: Statement;
}
export interface ContinueStatement extends Span {
	type: 'ContinueStatement';
	label: LabelIdentifier | null;
}
export interface BreakStatement extends Span {
	type: 'BreakStatement';
	label: LabelIdentifier | null;
}
export interface ReturnStatement extends Span {
	type: 'ReturnStatement';
	argument: Expression | null;
}
export interface WithStatement extends Span {
	type: 'WithStatement';
	object: Expression;
	body: Statement;
}
export interface SwitchStatement extends Span {
	type: 'SwitchStatement';
	discriminant: Expression;
	cases: SwitchCase[];
}
export interface SwitchCase extends Span {
	type: 'SwitchCase';
	test: Expression | null;
	consequent: Statement[];
}
export interface LabeledStatement extends Span {
	type: 'LabeledStatement';
	label: LabelIdentifier;
	body: Statement;
}
export interface ThrowStatement extends Span {
	type: 'ThrowStatement';
	argument: Expression;
}
export interface TryStatement extends Span {
	type: 'TryStatement';
	block: BlockStatement;
	handler: CatchClause | null;
	finalizer: BlockStatement | null;
}
export interface CatchClause extends Span {
	type: 'CatchClause';
	param: CatchParameter | null;
	body: BlockStatement;
}
export interface CatchParameter extends Span {
	type: 'CatchParameter';
	pattern: BindingPattern;
}
export interface DebuggerStatement extends Span {
	type: 'DebuggerStatement';
}
export type BindingPattern = {
	typeAnnotation: TSTypeAnnotation | null;
	optional: boolean;
} & (BindingIdentifier | ObjectPattern | ArrayPattern | AssignmentPattern);
export type BindingPatternKind =
	| BindingIdentifier
	| ObjectPattern
	| ArrayPattern
	| AssignmentPattern;
export interface AssignmentPattern extends Span {
	type: 'AssignmentPattern';
	left: BindingPattern;
	right: Expression;
}
export interface ObjectPattern extends Span {
	type: 'ObjectPattern';
	properties: Array<BindingProperty | BindingRestElement>;
}
export interface BindingProperty extends Span {
	type: 'BindingProperty';
	key: PropertyKey;
	value: BindingPattern;
	shorthand: boolean;
	computed: boolean;
}
export interface ArrayPattern extends Span {
	type: 'ArrayPattern';
	elements: Array<BindingPattern | BindingRestElement | null>;
}
export interface Function extends Span {
	type: FunctionType;
	id: BindingIdentifier | null;
	generator: boolean;
	async: boolean;
	declare: boolean;
	typeParameters: TSTypeParameterDeclaration | null;
	thisParam: TSThisParameter | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	body: FunctionBody | null;
}
export type FunctionType =
	| 'FunctionDeclaration'
	| 'FunctionExpression'
	| 'TSDeclareFunction'
	| 'TSEmptyBodyFunctionExpression';
export interface FormalParameters extends Span {
	type: 'FormalParameters';
	kind: FormalParameterKind;
	items: Array<FormalParameter | FormalParameterRest>;
}
export interface FormalParameter extends Span {
	type: 'FormalParameter';
	decorators: Decorator[];
	pattern: BindingPattern;
	accessibility: TSAccessibility | null;
	readonly: boolean;
	override: boolean;
}
export type FormalParameterKind =
	| 'FormalParameter'
	| 'UniqueFormalParameters'
	| 'ArrowFormalParameters'
	| 'Signature';
export interface FunctionBody extends Span {
	type: 'FunctionBody';
	directives: Directive[];
	statements: Statement[];
}
export interface ArrowFunctionExpression extends Span {
	type: 'ArrowFunctionExpression';
	expression: boolean;
	async: boolean;
	typeParameters: TSTypeParameterDeclaration | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	body: FunctionBody;
}
export interface YieldExpression extends Span {
	type: 'YieldExpression';
	delegate: boolean;
	argument: Expression | null;
}
export interface Class extends Span {
	type: ClassType;
	decorators: Decorator[];
	id: BindingIdentifier | null;
	typeParameters: TSTypeParameterDeclaration | null;
	superClass: Expression | null;
	superTypeParameters: TSTypeParameterInstantiation | null;
	implements: TSClassImplements[] | null;
	body: ClassBody;
	abstract: boolean;
	declare: boolean;
}
export type ClassType = 'ClassDeclaration' | 'ClassExpression';
export interface ClassBody extends Span {
	type: 'ClassBody';
	body: ClassElement[];
}
export type ClassElement =
	| StaticBlock
	| MethodDefinition
	| PropertyDefinition
	| AccessorProperty
	| TSIndexSignature;
export interface MethodDefinition extends Span {
	type: MethodDefinitionType;
	decorators: Decorator[];
	key: PropertyKey;
	value: Function;
	kind: MethodDefinitionKind;
	computed: boolean;
	static: boolean;
	override: boolean;
	optional: boolean;
	accessibility: TSAccessibility | null;
}
export type MethodDefinitionType = 'MethodDefinition' | 'TSAbstractMethodDefinition';
export interface PropertyDefinition extends Span {
	type: PropertyDefinitionType;
	decorators: Decorator[];
	key: PropertyKey;
	value: Expression | null;
	computed: boolean;
	static: boolean;
	declare: boolean;
	override: boolean;
	optional: boolean;
	definite: boolean;
	readonly: boolean;
	typeAnnotation: TSTypeAnnotation | null;
	accessibility: TSAccessibility | null;
}
export type PropertyDefinitionType = 'PropertyDefinition' | 'TSAbstractPropertyDefinition';
export type MethodDefinitionKind = 'constructor' | 'method' | 'get' | 'set';
export interface PrivateIdentifier extends Span {
	type: 'PrivateIdentifier';
	name: Atom;
}
export interface StaticBlock extends Span {
	type: 'StaticBlock';
	body: Statement[];
}
export type ModuleDeclaration =
	| ImportDeclaration
	| ExportAllDeclaration
	| ExportDefaultDeclaration
	| ExportNamedDeclaration
	| TSExportAssignment
	| TSNamespaceExportDeclaration;
export type AccessorPropertyType = 'AccessorProperty' | 'TSAbstractAccessorProperty';
export interface AccessorProperty extends Span {
	type: AccessorPropertyType;
	decorators: Decorator[];
	key: PropertyKey;
	value: Expression | null;
	computed: boolean;
	static: boolean;
	definite: boolean;
	typeAnnotation: TSTypeAnnotation | null;
	accessibility: TSAccessibility | null;
}
export interface ImportExpression extends Span {
	type: 'ImportExpression';
	source: Expression;
	arguments: Expression[];
}
export interface ImportDeclaration extends Span {
	type: 'ImportDeclaration';
	specifiers: ImportDeclarationSpecifier[] | null;
	source: StringLiteral;
	withClause: WithClause | null;
	importKind: ImportOrExportKind;
}
export type ImportDeclarationSpecifier =
	| ImportSpecifier
	| ImportDefaultSpecifier
	| ImportNamespaceSpecifier;
export interface ImportSpecifier extends Span {
	type: 'ImportSpecifier';
	imported: ModuleExportName;
	local: BindingIdentifier;
	importKind: ImportOrExportKind;
}
export interface ImportDefaultSpecifier extends Span {
	type: 'ImportDefaultSpecifier';
	local: BindingIdentifier;
}
export interface ImportNamespaceSpecifier extends Span {
	type: 'ImportNamespaceSpecifier';
	local: BindingIdentifier;
}
export interface WithClause extends Span {
	type: 'WithClause';
	attributesKeyword: IdentifierName;
	withEntries: ImportAttribute[];
}
export interface ImportAttribute extends Span {
	type: 'ImportAttribute';
	key: ImportAttributeKey;
	value: StringLiteral;
}
export type ImportAttributeKey = IdentifierName | StringLiteral;
export interface ExportNamedDeclaration extends Span {
	type: 'ExportNamedDeclaration';
	declaration: Declaration | null;
	specifiers: ExportSpecifier[];
	source: StringLiteral | null;
	exportKind: ImportOrExportKind;
	withClause: WithClause | null;
}
export interface ExportDefaultDeclaration extends Span {
	type: 'ExportDefaultDeclaration';
	declaration: ExportDefaultDeclarationKind;
	exported: ModuleExportName;
}
export interface ExportAllDeclaration extends Span {
	type: 'ExportAllDeclaration';
	exported: ModuleExportName | null;
	source: StringLiteral;
	withClause: WithClause | null;
	exportKind: ImportOrExportKind;
}
export interface ExportSpecifier extends Span {
	type: 'ExportSpecifier';
	local: ModuleExportName;
	exported: ModuleExportName;
	exportKind: ImportOrExportKind;
}
export type ExportDefaultDeclarationKind =
	| Function
	| Class
	| TSInterfaceDeclaration
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export type ModuleExportName = IdentifierName | IdentifierReference | StringLiteral;
export interface TSThisParameter extends Span {
	type: 'TSThisParameter';
	thisSpan: Span;
	typeAnnotation: TSTypeAnnotation | null;
}
export interface TSEnumDeclaration extends Span {
	type: 'TSEnumDeclaration';
	id: BindingIdentifier;
	members: TSEnumMember[];
	const: boolean;
	declare: boolean;
}
export interface TSEnumMember extends Span {
	type: 'TSEnumMember';
	id: TSEnumMemberName;
	initializer: Expression | null;
}
export type TSEnumMemberName =
	| IdentifierName
	| StringLiteral
	| TemplateLiteral
	| NumericLiteral
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface TSTypeAnnotation extends Span {
	type: 'TSTypeAnnotation';
	typeAnnotation: TSType;
}
export interface TSLiteralType extends Span {
	type: 'TSLiteralType';
	literal: TSLiteral;
}
export type TSLiteral =
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| UnaryExpression;
export type TSType =
	| TSAnyKeyword
	| TSBigIntKeyword
	| TSBooleanKeyword
	| TSIntrinsicKeyword
	| TSNeverKeyword
	| TSNullKeyword
	| TSNumberKeyword
	| TSObjectKeyword
	| TSStringKeyword
	| TSSymbolKeyword
	| TSUndefinedKeyword
	| TSUnknownKeyword
	| TSVoidKeyword
	| TSArrayType
	| TSConditionalType
	| TSConstructorType
	| TSFunctionType
	| TSImportType
	| TSIndexedAccessType
	| TSInferType
	| TSIntersectionType
	| TSLiteralType
	| TSMappedType
	| TSNamedTupleMember
	| TSQualifiedName
	| TSTemplateLiteralType
	| TSThisType
	| TSTupleType
	| TSTypeLiteral
	| TSTypeOperator
	| TSTypePredicate
	| TSTypeQuery
	| TSTypeReference
	| TSUnionType
	| TSParenthesizedType
	| JSDocNullableType
	| JSDocNonNullableType
	| JSDocUnknownType;
export interface TSConditionalType extends Span {
	type: 'TSConditionalType';
	checkType: TSType;
	extendsType: TSType;
	trueType: TSType;
	falseType: TSType;
}
export interface TSUnionType extends Span {
	type: 'TSUnionType';
	types: TSType[];
}
export interface TSIntersectionType extends Span {
	type: 'TSIntersectionType';
	types: TSType[];
}
export interface TSParenthesizedType extends Span {
	type: 'TSParenthesizedType';
	typeAnnotation: TSType;
}
export interface TSTypeOperator extends Span {
	type: 'TSTypeOperator';
	operator: TSTypeOperatorOperator;
	typeAnnotation: TSType;
}
export type TSTypeOperatorOperator = 'keyof' | 'unique' | 'readonly';
export interface TSArrayType extends Span {
	type: 'TSArrayType';
	elementType: TSType;
}
export interface TSIndexedAccessType extends Span {
	type: 'TSIndexedAccessType';
	objectType: TSType;
	indexType: TSType;
}
export interface TSTupleType extends Span {
	type: 'TSTupleType';
	elementTypes: TSTupleElement[];
}
export interface TSNamedTupleMember extends Span {
	type: 'TSNamedTupleMember';
	elementType: TSTupleElement;
	label: IdentifierName;
	optional: boolean;
}
export interface TSOptionalType extends Span {
	type: 'TSOptionalType';
	typeAnnotation: TSType;
}
export interface TSRestType extends Span {
	type: 'TSRestType';
	typeAnnotation: TSType;
}
export type TSTupleElement =
	| TSOptionalType
	| TSRestType
	| TSAnyKeyword
	| TSBigIntKeyword
	| TSBooleanKeyword
	| TSIntrinsicKeyword
	| TSNeverKeyword
	| TSNullKeyword
	| TSNumberKeyword
	| TSObjectKeyword
	| TSStringKeyword
	| TSSymbolKeyword
	| TSThisType
	| TSUndefinedKeyword
	| TSUnknownKeyword
	| TSVoidKeyword
	| TSArrayType
	| TSConditionalType
	| TSConstructorType
	| TSFunctionType
	| TSImportType
	| TSIndexedAccessType
	| TSInferType
	| TSIntersectionType
	| TSLiteralType
	| TSMappedType
	| TSNamedTupleMember
	| TSQualifiedName
	| TSTemplateLiteralType
	| TSTupleType
	| TSTypeLiteral
	| TSTypeOperator
	| TSTypePredicate
	| TSTypeQuery
	| TSTypeReference
	| TSUnionType
	| TSParenthesizedType
	| JSDocNullableType
	| JSDocNonNullableType
	| JSDocUnknownType;
export interface TSAnyKeyword extends Span {
	type: 'TSAnyKeyword';
}
export interface TSStringKeyword extends Span {
	type: 'TSStringKeyword';
}
export interface TSBooleanKeyword extends Span {
	type: 'TSBooleanKeyword';
}
export interface TSNumberKeyword extends Span {
	type: 'TSNumberKeyword';
}
export interface TSNeverKeyword extends Span {
	type: 'TSNeverKeyword';
}
export interface TSIntrinsicKeyword extends Span {
	type: 'TSIntrinsicKeyword';
}
export interface TSUnknownKeyword extends Span {
	type: 'TSUnknownKeyword';
}
export interface TSNullKeyword extends Span {
	type: 'TSNullKeyword';
}
export interface TSUndefinedKeyword extends Span {
	type: 'TSUndefinedKeyword';
}
export interface TSVoidKeyword extends Span {
	type: 'TSVoidKeyword';
}
export interface TSSymbolKeyword extends Span {
	type: 'TSSymbolKeyword';
}
export interface TSThisType extends Span {
	type: 'TSThisType';
}
export interface TSObjectKeyword extends Span {
	type: 'TSObjectKeyword';
}
export interface TSBigIntKeyword extends Span {
	type: 'TSBigIntKeyword';
}
export interface TSTypeReference extends Span {
	type: 'TSTypeReference';
	typeName: TSTypeName;
	typeParameters: TSTypeParameterInstantiation | null;
}
export type TSTypeName = IdentifierReference | TSQualifiedName;
export interface TSQualifiedName extends Span {
	type: 'TSQualifiedName';
	left: TSTypeName;
	right: IdentifierName;
}
export interface TSTypeParameterInstantiation extends Span {
	type: 'TSTypeParameterInstantiation';
	params: TSType[];
}
export interface TSTypeParameter extends Span {
	type: 'TSTypeParameter';
	name: BindingIdentifier;
	constraint: TSType | null;
	default: TSType | null;
	in: boolean;
	out: boolean;
	const: boolean;
}
export interface TSTypeParameterDeclaration extends Span {
	type: 'TSTypeParameterDeclaration';
	params: TSTypeParameter[];
}
export interface TSTypeAliasDeclaration extends Span {
	type: 'TSTypeAliasDeclaration';
	id: BindingIdentifier;
	typeParameters: TSTypeParameterDeclaration | null;
	typeAnnotation: TSType;
	declare: boolean;
}
export type TSAccessibility = 'private' | 'protected' | 'public';
export interface TSClassImplements extends Span {
	type: 'TSClassImplements';
	expression: TSTypeName;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TSInterfaceDeclaration extends Span {
	type: 'TSInterfaceDeclaration';
	id: BindingIdentifier;
	extends: TSInterfaceHeritage[] | null;
	typeParameters: TSTypeParameterDeclaration | null;
	body: TSInterfaceBody;
	declare: boolean;
}
export interface TSInterfaceBody extends Span {
	type: 'TSInterfaceBody';
	body: TSSignature[];
}
export interface TSPropertySignature extends Span {
	type: 'TSPropertySignature';
	computed: boolean;
	optional: boolean;
	readonly: boolean;
	key: PropertyKey;
	typeAnnotation: TSTypeAnnotation | null;
}
export type TSSignature =
	| TSIndexSignature
	| TSPropertySignature
	| TSCallSignatureDeclaration
	| TSConstructSignatureDeclaration
	| TSMethodSignature;
export interface TSIndexSignature extends Span {
	type: 'TSIndexSignature';
	parameters: TSIndexSignatureName[];
	typeAnnotation: TSTypeAnnotation;
	readonly: boolean;
}
export interface TSCallSignatureDeclaration extends Span {
	type: 'TSCallSignatureDeclaration';
	thisParam: TSThisParameter | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	typeParameters: TSTypeParameterDeclaration | null;
}
export type TSMethodSignatureKind = 'method' | 'get' | 'set';
export interface TSMethodSignature extends Span {
	type: 'TSMethodSignature';
	key: PropertyKey;
	computed: boolean;
	optional: boolean;
	kind: TSMethodSignatureKind;
	thisParam: TSThisParameter | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSConstructSignatureDeclaration extends Span {
	type: 'TSConstructSignatureDeclaration';
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSInterfaceHeritage extends Span {
	type: 'TSInterfaceHeritage';
	expression: Expression;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TSTypePredicate extends Span {
	type: 'TSTypePredicate';
	parameterName: TSTypePredicateName;
	asserts: boolean;
	typeAnnotation: TSTypeAnnotation | null;
}
export type TSTypePredicateName = IdentifierName | TSThisType;
export interface TSModuleDeclaration extends Span {
	type: 'TSModuleDeclaration';
	id: TSModuleDeclarationName;
	body: TSModuleDeclarationBody | null;
	kind: TSModuleDeclarationKind;
	declare: boolean;
}
export type TSModuleDeclarationKind = 'global' | 'module' | 'namespace';
export type TSModuleDeclarationName = IdentifierName | StringLiteral;
export type TSModuleDeclarationBody = TSModuleDeclaration | TSModuleBlock;
export interface TSModuleBlock extends Span {
	type: 'TSModuleBlock';
	body: Statement[];
}
export interface TSTypeLiteral extends Span {
	type: 'TSTypeLiteral';
	members: TSSignature[];
}
export interface TSInferType extends Span {
	type: 'TSInferType';
	typeParameter: TSTypeParameter;
}
export interface TSTypeQuery extends Span {
	type: 'TSTypeQuery';
	exprName: TSTypeQueryExprName;
	typeParameters: TSTypeParameterInstantiation | null;
}
export type TSTypeQueryExprName = TSImportType | IdentifierReference | TSQualifiedName;
export interface TSImportType extends Span {
	type: 'TSImportType';
	isTypeOf: boolean;
	parameter: TSType;
	qualifier: TSTypeName | null;
	attributes: TSImportAttributes | null;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TSImportAttributes extends Span {
	type: 'TSImportAttributes';
	attributesKeyword: IdentifierName;
	elements: TSImportAttribute[];
}
export interface TSImportAttribute extends Span {
	type: 'TSImportAttribute';
	name: TSImportAttributeName;
	value: Expression;
}
export type TSImportAttributeName = IdentifierName | StringLiteral;
export interface TSFunctionType extends Span {
	type: 'TSFunctionType';
	thisParam: TSThisParameter | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSConstructorType extends Span {
	type: 'TSConstructorType';
	abstract: boolean;
	params: FormalParameters;
	returnType: TSTypeAnnotation;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSMappedType extends Span {
	type: 'TSMappedType';
	typeParameter: TSTypeParameter;
	nameType: TSType | null;
	typeAnnotation: TSType | null;
	optional: TSMappedTypeModifierOperator;
	readonly: TSMappedTypeModifierOperator;
}
export type TSMappedTypeModifierOperator = 'true' | '+' | '-' | 'none';
export interface TSTemplateLiteralType extends Span {
	type: 'TSTemplateLiteralType';
	quasis: TemplateElement[];
	types: TSType[];
}
export interface TSAsExpression extends Span {
	type: 'TSAsExpression';
	expression: Expression;
	typeAnnotation: TSType;
}
export interface TSSatisfiesExpression extends Span {
	type: 'TSSatisfiesExpression';
	expression: Expression;
	typeAnnotation: TSType;
}
export interface TSTypeAssertion extends Span {
	type: 'TSTypeAssertion';
	expression: Expression;
	typeAnnotation: TSType;
}
export interface TSImportEqualsDeclaration extends Span {
	type: 'TSImportEqualsDeclaration';
	id: BindingIdentifier;
	moduleReference: TSModuleReference;
	importKind: ImportOrExportKind;
}
export type TSModuleReference = TSExternalModuleReference | IdentifierReference | TSQualifiedName;
export interface TSExternalModuleReference extends Span {
	type: 'TSExternalModuleReference';
	expression: StringLiteral;
}
export interface TSNonNullExpression extends Span {
	type: 'TSNonNullExpression';
	expression: Expression;
}
export interface Decorator extends Span {
	type: 'Decorator';
	expression: Expression;
}
export interface TSExportAssignment extends Span {
	type: 'TSExportAssignment';
	expression: Expression;
}
export interface TSNamespaceExportDeclaration extends Span {
	type: 'TSNamespaceExportDeclaration';
	id: IdentifierName;
}
export interface TSInstantiationExpression extends Span {
	type: 'TSInstantiationExpression';
	expression: Expression;
	typeParameters: TSTypeParameterInstantiation;
}
export type ImportOrExportKind = 'value' | 'type';
export interface JSDocNullableType extends Span {
	type: 'JSDocNullableType';
	typeAnnotation: TSType;
	postfix: boolean;
}
export interface JSDocNonNullableType extends Span {
	type: 'JSDocNonNullableType';
	typeAnnotation: TSType;
	postfix: boolean;
}
export interface JSDocUnknownType extends Span {
	type: 'JSDocUnknownType';
}
export interface JSXElement extends Span {
	type: 'JSXElement';
	openingElement: JSXOpeningElement;
	closingElement: JSXClosingElement | null;
	children: JSXChild[];
}
export interface JSXOpeningElement extends Span {
	type: 'JSXOpeningElement';
	selfClosing: boolean;
	name: JSXElementName;
	attributes: JSXAttributeItem[];
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface JSXClosingElement extends Span {
	type: 'JSXClosingElement';
	name: JSXElementName;
}
export interface JSXFragment extends Span {
	type: 'JSXFragment';
	openingFragment: JSXOpeningFragment;
	closingFragment: JSXClosingFragment;
	children: JSXChild[];
}
export interface JSXOpeningFragment extends Span {
	type: 'JSXOpeningFragment';
}
export interface JSXClosingFragment extends Span {
	type: 'JSXClosingFragment';
}
export interface JSXNamespacedName extends Span {
	type: 'JSXNamespacedName';
	namespace: JSXIdentifier;
	property: JSXIdentifier;
}
export interface JSXMemberExpression extends Span {
	type: 'JSXMemberExpression';
	object: JSXMemberExpressionObject;
	property: JSXIdentifier;
}
export interface JSXExpressionContainer extends Span {
	type: 'JSXExpressionContainer';
	expression: JSXExpression;
}
export type JSXExpression =
	| JSXEmptyExpression
	| BooleanLiteral
	| NullLiteral
	| NumericLiteral
	| BigIntLiteral
	| RegExpLiteral
	| StringLiteral
	| TemplateLiteral
	| IdentifierReference
	| MetaProperty
	| Super
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| CallExpression
	| ChainExpression
	| Class
	| ConditionalExpression
	| Function
	| ImportExpression
	| LogicalExpression
	| NewExpression
	| ObjectExpression
	| ParenthesizedExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| ThisExpression
	| UnaryExpression
	| UpdateExpression
	| YieldExpression
	| PrivateInExpression
	| JSXElement
	| JSXFragment
	| TSAsExpression
	| TSSatisfiesExpression
	| TSTypeAssertion
	| TSNonNullExpression
	| TSInstantiationExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface JSXEmptyExpression extends Span {
	type: 'JSXEmptyExpression';
}
export type JSXAttributeItem = JSXAttribute | JSXSpreadAttribute;
export interface JSXAttribute extends Span {
	type: 'JSXAttribute';
	name: JSXAttributeName;
	value: JSXAttributeValue | null;
}
export interface JSXSpreadAttribute extends Span {
	type: 'JSXSpreadAttribute';
	argument: Expression;
}
export type JSXAttributeName = JSXIdentifier | JSXNamespacedName;
export type JSXAttributeValue = StringLiteral | JSXExpressionContainer | JSXElement | JSXFragment;
export interface JSXIdentifier extends Span {
	type: 'JSXIdentifier';
	name: Atom;
}
export type JSXChild = JSXText | JSXElement | JSXFragment | JSXExpressionContainer | JSXSpreadChild;
export interface JSXSpreadChild extends Span {
	type: 'JSXSpreadChild';
	expression: Expression;
}
export interface JSXText extends Span {
	type: 'JSXText';
	value: Atom;
}
export type AssignmentOperator =
	| '='
	| '+='
	| '-='
	| '*='
	| '/='
	| '%='
	| '<<='
	| '>>='
	| '>>>='
	| '|='
	| '^='
	| '&='
	| '&&='
	| '||='
	| '??='
	| '**=';
export type BinaryOperator =
	| '=='
	| '!='
	| '==='
	| '!=='
	| '<'
	| '<='
	| '>'
	| '>='
	| '<<'
	| '>>'
	| '>>>'
	| '+'
	| '-'
	| '*'
	| '/'
	| '%'
	| '|'
	| '^'
	| '&'
	| 'in'
	| 'instanceof'
	| '**';
export type LogicalOperator = '||' | '&&' | '??';
export type UnaryOperator = '-' | '+' | '!' | '~' | 'typeof' | 'void' | 'delete';
export type UpdateOperator = '++' | '--';
export interface Span {
	start: number;
	end: number;
}
export interface SourceType {
	language: Language;
	moduleKind: ModuleKind;
	variant: LanguageVariant;
}
export type Language = 'javascript' | 'typescript' | 'typescriptDefinition';
export type ModuleKind = 'script' | 'module' | 'unambiguous';
export type LanguageVariant = 'standard' | 'jsx';
export interface Pattern {
	span: Span;
	body: Disjunction;
}
export interface Disjunction {
	span: Span;
	body: Alternative[];
}
export interface Alternative {
	span: Span;
	body: Term[];
}
export type Term =
	| { BoundaryAssertion: BoundaryAssertion }
	| { LookAroundAssertion: LookAroundAssertion }
	| { Quantifier: Quantifier }
	| { Character: Character }
	| { Dot: Dot }
	| { CharacterClassEscape: CharacterClassEscape }
	| { UnicodePropertyEscape: UnicodePropertyEscape }
	| { CharacterClass: CharacterClass }
	| { CapturingGroup: CapturingGroup }
	| { IgnoreGroup: IgnoreGroup }
	| { IndexedReference: IndexedReference }
	| { NamedReference: NamedReference };
export interface BoundaryAssertion {
	span: Span;
	kind: BoundaryAssertionKind;
}
export type BoundaryAssertionKind = 'Start' | 'End' | 'Boundary' | 'NegativeBoundary';
export interface LookAroundAssertion {
	span: Span;
	kind: LookAroundAssertionKind;
	body: Disjunction;
}
export type LookAroundAssertionKind =
	| 'Lookahead'
	| 'NegativeLookahead'
	| 'Lookbehind'
	| 'NegativeLookbehind';
export interface Quantifier {
	span: Span;
	min: number;
	max: number | null;
	greedy: boolean;
	body: Term;
}
export interface Character {
	span: Span;
	kind: CharacterKind;
	value: number;
}
export type CharacterKind =
	| 'ControlLetter'
	| 'HexadecimalEscape'
	| 'Identifier'
	| 'Null'
	| 'Octal1'
	| 'Octal2'
	| 'Octal3'
	| 'SingleEscape'
	| 'Symbol'
	| 'UnicodeEscape';
export interface CharacterClassEscape {
	span: Span;
	kind: CharacterClassEscapeKind;
}
export type CharacterClassEscapeKind = 'D' | 'NegativeD' | 'S' | 'NegativeS' | 'W' | 'NegativeW';
export interface UnicodePropertyEscape {
	span: Span;
	negative: boolean;
	strings: boolean;
	name: Atom;
	value: Atom | null;
}
export interface Dot {
	span: Span;
}
export interface CharacterClass {
	span: Span;
	negative: boolean;
	strings: boolean;
	kind: CharacterClassContentsKind;
	body: CharacterClassContents[];
}
export type CharacterClassContentsKind = 'Union' | 'Intersection' | 'Subtraction';
export type CharacterClassContents =
	| { CharacterClassRange: CharacterClassRange }
	| { CharacterClassEscape: CharacterClassEscape }
	| { UnicodePropertyEscape: UnicodePropertyEscape }
	| { Character: Character }
	| { NestedCharacterClass: CharacterClass }
	| { ClassStringDisjunction: ClassStringDisjunction };
export interface CharacterClassRange {
	span: Span;
	min: Character;
	max: Character;
}
export interface ClassStringDisjunction {
	span: Span;
	strings: boolean;
	body: ClassString[];
}
export interface ClassString {
	span: Span;
	strings: boolean;
	body: Character[];
}
export interface CapturingGroup {
	span: Span;
	name: Atom | null;
	body: Disjunction;
}
export interface IgnoreGroup {
	span: Span;
	enabling_modifiers: ModifierFlags | null;
	disabling_modifiers: ModifierFlags | null;
	body: Disjunction;
}
export interface ModifierFlags {
	ignore_case: boolean;
	sticky: boolean;
	multiline: boolean;
}
export interface IndexedReference {
	span: Span;
	index: number;
}
export interface NamedReference {
	span: Span;
	name: Atom;
}
