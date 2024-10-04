export type JSXElementName = JSXIdentifier | JSXNamespacedName | JSXMemberExpression;
export type JSXMemberExpressionObject = JSXIdentifier | JSXMemberExpression;
export type Atom = string;

export type Comment = {
	type: 'Line' | 'Block';
	start: number;
	end: number;
};

export interface Node {
	type: string;
	leading_comments?: Comment[];
	trailing_comments?: Comment[];
}

export interface TSIndexSignatureName extends Node {
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
export interface BindingIdentifier extends Node {
	type: 'Identifier';
	name: Atom;
}
export interface IdentifierReference extends Node {
	type: 'Identifier';
	name: Atom;
}
export interface IdentifierName extends Node {
	type: 'Identifier';
	name: Atom;
}
export interface LabelIdentifier extends Node {
	type: 'Identifier';
	name: Atom;
}
export interface AssignmentTargetRest extends Node {
	type: 'RestElement';
	argument: AssignmentTarget;
}
export interface BindingRestElement extends Node {
	type: 'RestElement';
	argument: BindingPattern;
}
export interface FormalParameterRest extends Node {
	type: 'RestElement';
	argument: BindingPatternKind;
	typeAnnotation?: TSTypeAnnotation;
	optional: boolean;
}
export interface BooleanLiteral extends Node {
	type: 'BooleanLiteral';
	value: boolean;
}
export interface NullLiteral extends Node {
	type: 'NullLiteral';
}
export interface NumericLiteral extends Node {
	type: 'NumericLiteral';
	value: number;
	raw: string;
}
export interface BigIntLiteral extends Node {
	type: 'BigIntLiteral';
	raw: Atom;
}
export interface RegExpLiteral extends Node {
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
export interface StringLiteral extends Node {
	type: 'StringLiteral';
	value: Atom;
}
export interface Program extends Node {
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
export interface ThisExpression extends Node {
	type: 'ThisExpression';
}
export interface ArrayExpression extends Node {
	type: 'ArrayExpression';
	elements: Array<SpreadElement | Expression | null>;
}
export interface ObjectExpression extends Node {
	type: 'ObjectExpression';
	properties: ObjectPropertyKind[];
}
export type ObjectPropertyKind = ObjectProperty | SpreadElement;
export interface ObjectProperty extends Node {
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
export interface TemplateLiteral extends Node {
	type: 'TemplateLiteral';
	quasis: TemplateElement[];
	expressions: Expression[];
}
export interface TaggedTemplateExpression extends Node {
	type: 'TaggedTemplateExpression';
	tag: Expression;
	quasi: TemplateLiteral;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TemplateElement extends Node {
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
export interface ComputedMemberExpression extends Node {
	type: 'ComputedMemberExpression';
	object: Expression;
	expression: Expression;
	optional: boolean;
}
export interface StaticMemberExpression extends Node {
	type: 'StaticMemberExpression';
	object: Expression;
	property: IdentifierName;
	optional: boolean;
}
export interface PrivateFieldExpression extends Node {
	type: 'PrivateFieldExpression';
	object: Expression;
	field: PrivateIdentifier;
	optional: boolean;
}
export interface CallExpression extends Node {
	type: 'CallExpression';
	callee: Expression;
	typeParameters: TSTypeParameterInstantiation | null;
	arguments: Argument[];
	optional: boolean;
}
export interface NewExpression extends Node {
	type: 'NewExpression';
	callee: Expression;
	arguments: Argument[];
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface MetaProperty extends Node {
	type: 'MetaProperty';
	meta: IdentifierName;
	property: IdentifierName;
}
export interface SpreadElement extends Node {
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
export interface UpdateExpression extends Node {
	type: 'UpdateExpression';
	operator: UpdateOperator;
	prefix: boolean;
	argument: SimpleAssignmentTarget;
}
export interface UnaryExpression extends Node {
	type: 'UnaryExpression';
	operator: UnaryOperator;
	argument: Expression;
}
export interface BinaryExpression extends Node {
	type: 'BinaryExpression';
	left: Expression;
	operator: BinaryOperator;
	right: Expression;
}
export interface PrivateInExpression extends Node {
	type: 'PrivateInExpression';
	left: PrivateIdentifier;
	operator: BinaryOperator;
	right: Expression;
}
export interface LogicalExpression extends Node {
	type: 'LogicalExpression';
	left: Expression;
	operator: LogicalOperator;
	right: Expression;
}
export interface ConditionalExpression extends Node {
	type: 'ConditionalExpression';
	test: Expression;
	consequent: Expression;
	alternate: Expression;
}
export interface AssignmentExpression extends Node {
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
export interface ArrayAssignmentTarget extends Node {
	type: 'ArrayAssignmentTarget';
	elements: Array<AssignmentTargetMaybeDefault | AssignmentTargetRest | null>;
}
export interface ObjectAssignmentTarget extends Node {
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
export interface AssignmentTargetWithDefault extends Node {
	type: 'AssignmentTargetWithDefault';
	binding: AssignmentTarget;
	init: Expression;
}
export type AssignmentTargetProperty =
	| AssignmentTargetPropertyIdentifier
	| AssignmentTargetPropertyProperty;
export interface AssignmentTargetPropertyIdentifier extends Node {
	type: 'AssignmentTargetPropertyIdentifier';
	binding: IdentifierReference;
	init: Expression | null;
}
export interface AssignmentTargetPropertyProperty extends Node {
	type: 'AssignmentTargetPropertyProperty';
	name: PropertyKey;
	binding: AssignmentTargetMaybeDefault;
}
export interface SequenceExpression extends Node {
	type: 'SequenceExpression';
	expressions: Expression[];
}
export interface Super extends Node {
	type: 'Super';
}
export interface AwaitExpression extends Node {
	type: 'AwaitExpression';
	argument: Expression;
}
export interface ChainExpression extends Node {
	type: 'ChainExpression';
	expression: ChainElement;
}
export type ChainElement =
	| CallExpression
	| ComputedMemberExpression
	| StaticMemberExpression
	| PrivateFieldExpression;
export interface ParenthesizedExpression extends Node {
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
export interface Directive extends Node {
	type: 'Directive';
	expression: StringLiteral;
	directive: Atom;
}
export interface Hashbang extends Node {
	type: 'Hashbang';
	value: Atom;
}
export interface BlockStatement extends Node {
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
export interface VariableDeclaration extends Node {
	type: 'VariableDeclaration';
	kind: VariableDeclarationKind;
	declarations: VariableDeclarator[];
	declare: boolean;
}
export type VariableDeclarationKind = 'var' | 'const' | 'let' | 'using' | 'await using';
export interface VariableDeclarator extends Node {
	type: 'VariableDeclarator';
	id: BindingPattern;
	init: Expression | null;
	definite: boolean;
}
export interface EmptyStatement extends Node {
	type: 'EmptyStatement';
}
export interface ExpressionStatement extends Node {
	type: 'ExpressionStatement';
	expression: Expression;
}
export interface IfStatement extends Node {
	type: 'IfStatement';
	test: Expression;
	consequent: Statement;
	alternate: Statement | null;
}
export interface DoWhileStatement extends Node {
	type: 'DoWhileStatement';
	body: Statement;
	test: Expression;
}
export interface WhileStatement extends Node {
	type: 'WhileStatement';
	test: Expression;
	body: Statement;
}
export interface ForStatement extends Node {
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
export interface ForInStatement extends Node {
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
export interface ForOfStatement extends Node {
	type: 'ForOfStatement';
	await: boolean;
	left: ForStatementLeft;
	right: Expression;
	body: Statement;
}
export interface ContinueStatement extends Node {
	type: 'ContinueStatement';
	label: LabelIdentifier | null;
}
export interface BreakStatement extends Node {
	type: 'BreakStatement';
	label: LabelIdentifier | null;
}
export interface ReturnStatement extends Node {
	type: 'ReturnStatement';
	argument: Expression | null;
}
export interface WithStatement extends Node {
	type: 'WithStatement';
	object: Expression;
	body: Statement;
}
export interface SwitchStatement extends Node {
	type: 'SwitchStatement';
	discriminant: Expression;
	cases: SwitchCase[];
}
export interface SwitchCase extends Node {
	type: 'SwitchCase';
	test: Expression | null;
	consequent: Statement[];
}
export interface LabeledStatement extends Node {
	type: 'LabeledStatement';
	label: LabelIdentifier;
	body: Statement;
}
export interface ThrowStatement extends Node {
	type: 'ThrowStatement';
	argument: Expression;
}
export interface TryStatement extends Node {
	type: 'TryStatement';
	block: BlockStatement;
	handler: CatchClause | null;
	finalizer: BlockStatement | null;
}
export interface CatchClause extends Node {
	type: 'CatchClause';
	param: CatchParameter | null;
	body: BlockStatement;
}
export interface CatchParameter extends Node {
	type: 'CatchParameter';
	pattern: BindingPattern;
}
export interface DebuggerStatement extends Node {
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
export interface AssignmentPattern extends Node {
	type: 'AssignmentPattern';
	left: BindingPattern;
	right: Expression;
}
export interface ObjectPattern extends Node {
	type: 'ObjectPattern';
	properties: Array<BindingProperty | BindingRestElement>;
}
export interface BindingProperty extends Node {
	type: 'BindingProperty';
	key: PropertyKey;
	value: BindingPattern;
	shorthand: boolean;
	computed: boolean;
}
export interface ArrayPattern extends Node {
	type: 'ArrayPattern';
	elements: Array<BindingPattern | BindingRestElement | null>;
}
export interface Function extends Node {
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
export interface FormalParameters extends Node {
	type: 'FormalParameters';
	kind: FormalParameterKind;
	items: Array<FormalParameter | FormalParameterRest>;
}
export interface FormalParameter extends Node {
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
export interface FunctionBody extends Node {
	type: 'FunctionBody';
	directives: Directive[];
	statements: Statement[];
}
export interface ArrowFunctionExpression extends Node {
	type: 'ArrowFunctionExpression';
	expression: boolean;
	async: boolean;
	typeParameters: TSTypeParameterDeclaration | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	body: FunctionBody;
}
export interface YieldExpression extends Node {
	type: 'YieldExpression';
	delegate: boolean;
	argument: Expression | null;
}
export interface Class extends Node {
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
export interface ClassBody extends Node {
	type: 'ClassBody';
	body: ClassElement[];
}
export type ClassElement =
	| StaticBlock
	| MethodDefinition
	| PropertyDefinition
	| AccessorProperty
	| TSIndexSignature;
export interface MethodDefinition extends Node {
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
export interface PropertyDefinition extends Node {
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
export interface PrivateIdentifier extends Node {
	type: 'PrivateIdentifier';
	name: Atom;
}
export interface StaticBlock extends Node {
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
export interface AccessorProperty extends Node {
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
export interface ImportExpression extends Node {
	type: 'ImportExpression';
	source: Expression;
	arguments: Expression[];
}
export interface ImportDeclaration extends Node {
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
export interface ImportSpecifier extends Node {
	type: 'ImportSpecifier';
	imported: ModuleExportName;
	local: BindingIdentifier;
	importKind: ImportOrExportKind;
}
export interface ImportDefaultSpecifier extends Node {
	type: 'ImportDefaultSpecifier';
	local: BindingIdentifier;
}
export interface ImportNamespaceSpecifier extends Node {
	type: 'ImportNamespaceSpecifier';
	local: BindingIdentifier;
}
export interface WithClause extends Node {
	type: 'WithClause';
	attributesKeyword: IdentifierName;
	withEntries: ImportAttribute[];
}
export interface ImportAttribute extends Node {
	type: 'ImportAttribute';
	key: ImportAttributeKey;
	value: StringLiteral;
}
export type ImportAttributeKey = IdentifierName | StringLiteral;
export interface ExportNamedDeclaration extends Node {
	type: 'ExportNamedDeclaration';
	declaration: Declaration | null;
	specifiers: ExportSpecifier[];
	source: StringLiteral | null;
	exportKind: ImportOrExportKind;
	withClause: WithClause | null;
}
export interface ExportDefaultDeclaration extends Node {
	type: 'ExportDefaultDeclaration';
	declaration: ExportDefaultDeclarationKind;
	exported: ModuleExportName;
}
export interface ExportAllDeclaration extends Node {
	type: 'ExportAllDeclaration';
	exported: ModuleExportName | null;
	source: StringLiteral;
	withClause: WithClause | null;
	exportKind: ImportOrExportKind;
}
export interface ExportSpecifier extends Node {
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
export interface TSThisParameter extends Node {
	type: 'TSThisParameter';
	thisSpan: Node;
	typeAnnotation: TSTypeAnnotation | null;
}
export interface TSEnumDeclaration extends Node {
	type: 'TSEnumDeclaration';
	id: BindingIdentifier;
	members: TSEnumMember[];
	const: boolean;
	declare: boolean;
}
export interface TSEnumMember extends Node {
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
export interface TSTypeAnnotation extends Node {
	type: 'TSTypeAnnotation';
	typeAnnotation: TSType;
}
export interface TSLiteralType extends Node {
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
export interface TSConditionalType extends Node {
	type: 'TSConditionalType';
	checkType: TSType;
	extendsType: TSType;
	trueType: TSType;
	falseType: TSType;
}
export interface TSUnionType extends Node {
	type: 'TSUnionType';
	types: TSType[];
}
export interface TSIntersectionType extends Node {
	type: 'TSIntersectionType';
	types: TSType[];
}
export interface TSParenthesizedType extends Node {
	type: 'TSParenthesizedType';
	typeAnnotation: TSType;
}
export interface TSTypeOperator extends Node {
	type: 'TSTypeOperator';
	operator: TSTypeOperatorOperator;
	typeAnnotation: TSType;
}
export type TSTypeOperatorOperator = 'keyof' | 'unique' | 'readonly';
export interface TSArrayType extends Node {
	type: 'TSArrayType';
	elementType: TSType;
}
export interface TSIndexedAccessType extends Node {
	type: 'TSIndexedAccessType';
	objectType: TSType;
	indexType: TSType;
}
export interface TSTupleType extends Node {
	type: 'TSTupleType';
	elementTypes: TSTupleElement[];
}
export interface TSNamedTupleMember extends Node {
	type: 'TSNamedTupleMember';
	elementType: TSTupleElement;
	label: IdentifierName;
	optional: boolean;
}
export interface TSOptionalType extends Node {
	type: 'TSOptionalType';
	typeAnnotation: TSType;
}
export interface TSRestType extends Node {
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
export interface TSAnyKeyword extends Node {
	type: 'TSAnyKeyword';
}
export interface TSStringKeyword extends Node {
	type: 'TSStringKeyword';
}
export interface TSBooleanKeyword extends Node {
	type: 'TSBooleanKeyword';
}
export interface TSNumberKeyword extends Node {
	type: 'TSNumberKeyword';
}
export interface TSNeverKeyword extends Node {
	type: 'TSNeverKeyword';
}
export interface TSIntrinsicKeyword extends Node {
	type: 'TSIntrinsicKeyword';
}
export interface TSUnknownKeyword extends Node {
	type: 'TSUnknownKeyword';
}
export interface TSNullKeyword extends Node {
	type: 'TSNullKeyword';
}
export interface TSUndefinedKeyword extends Node {
	type: 'TSUndefinedKeyword';
}
export interface TSVoidKeyword extends Node {
	type: 'TSVoidKeyword';
}
export interface TSSymbolKeyword extends Node {
	type: 'TSSymbolKeyword';
}
export interface TSThisType extends Node {
	type: 'TSThisType';
}
export interface TSObjectKeyword extends Node {
	type: 'TSObjectKeyword';
}
export interface TSBigIntKeyword extends Node {
	type: 'TSBigIntKeyword';
}
export interface TSTypeReference extends Node {
	type: 'TSTypeReference';
	typeName: TSTypeName;
	typeParameters: TSTypeParameterInstantiation | null;
}
export type TSTypeName = IdentifierReference | TSQualifiedName;
export interface TSQualifiedName extends Node {
	type: 'TSQualifiedName';
	left: TSTypeName;
	right: IdentifierName;
}
export interface TSTypeParameterInstantiation extends Node {
	type: 'TSTypeParameterInstantiation';
	params: TSType[];
}
export interface TSTypeParameter extends Node {
	type: 'TSTypeParameter';
	name: BindingIdentifier;
	constraint: TSType | null;
	default: TSType | null;
	in: boolean;
	out: boolean;
	const: boolean;
}
export interface TSTypeParameterDeclaration extends Node {
	type: 'TSTypeParameterDeclaration';
	params: TSTypeParameter[];
}
export interface TSTypeAliasDeclaration extends Node {
	type: 'TSTypeAliasDeclaration';
	id: BindingIdentifier;
	typeParameters: TSTypeParameterDeclaration | null;
	typeAnnotation: TSType;
	declare: boolean;
}
export type TSAccessibility = 'private' | 'protected' | 'public';
export interface TSClassImplements extends Node {
	type: 'TSClassImplements';
	expression: TSTypeName;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TSInterfaceDeclaration extends Node {
	type: 'TSInterfaceDeclaration';
	id: BindingIdentifier;
	extends: TSInterfaceHeritage[] | null;
	typeParameters: TSTypeParameterDeclaration | null;
	body: TSInterfaceBody;
	declare: boolean;
}
export interface TSInterfaceBody extends Node {
	type: 'TSInterfaceBody';
	body: TSSignature[];
}
export interface TSPropertySignature extends Node {
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
export interface TSIndexSignature extends Node {
	type: 'TSIndexSignature';
	parameters: TSIndexSignatureName[];
	typeAnnotation: TSTypeAnnotation;
	readonly: boolean;
}
export interface TSCallSignatureDeclaration extends Node {
	type: 'TSCallSignatureDeclaration';
	thisParam: TSThisParameter | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	typeParameters: TSTypeParameterDeclaration | null;
}
export type TSMethodSignatureKind = 'method' | 'get' | 'set';
export interface TSMethodSignature extends Node {
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
export interface TSConstructSignatureDeclaration extends Node {
	type: 'TSConstructSignatureDeclaration';
	params: FormalParameters;
	returnType: TSTypeAnnotation | null;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSInterfaceHeritage extends Node {
	type: 'TSInterfaceHeritage';
	expression: Expression;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TSTypePredicate extends Node {
	type: 'TSTypePredicate';
	parameterName: TSTypePredicateName;
	asserts: boolean;
	typeAnnotation: TSTypeAnnotation | null;
}
export type TSTypePredicateName = IdentifierName | TSThisType;
export interface TSModuleDeclaration extends Node {
	type: 'TSModuleDeclaration';
	id: TSModuleDeclarationName;
	body: TSModuleDeclarationBody | null;
	kind: TSModuleDeclarationKind;
	declare: boolean;
}
export type TSModuleDeclarationKind = 'global' | 'module' | 'namespace';
export type TSModuleDeclarationName = IdentifierName | StringLiteral;
export type TSModuleDeclarationBody = TSModuleDeclaration | TSModuleBlock;
export interface TSModuleBlock extends Node {
	type: 'TSModuleBlock';
	body: Statement[];
}
export interface TSTypeLiteral extends Node {
	type: 'TSTypeLiteral';
	members: TSSignature[];
}
export interface TSInferType extends Node {
	type: 'TSInferType';
	typeParameter: TSTypeParameter;
}
export interface TSTypeQuery extends Node {
	type: 'TSTypeQuery';
	exprName: TSTypeQueryExprName;
	typeParameters: TSTypeParameterInstantiation | null;
}
export type TSTypeQueryExprName = TSImportType | IdentifierReference | TSQualifiedName;
export interface TSImportType extends Node {
	type: 'TSImportType';
	isTypeOf: boolean;
	parameter: TSType;
	qualifier: TSTypeName | null;
	attributes: TSImportAttributes | null;
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface TSImportAttributes extends Node {
	type: 'TSImportAttributes';
	attributesKeyword: IdentifierName;
	elements: TSImportAttribute[];
}
export interface TSImportAttribute extends Node {
	type: 'TSImportAttribute';
	name: TSImportAttributeName;
	value: Expression;
}
export type TSImportAttributeName = IdentifierName | StringLiteral;
export interface TSFunctionType extends Node {
	type: 'TSFunctionType';
	thisParam: TSThisParameter | null;
	params: FormalParameters;
	returnType: TSTypeAnnotation;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSConstructorType extends Node {
	type: 'TSConstructorType';
	abstract: boolean;
	params: FormalParameters;
	returnType: TSTypeAnnotation;
	typeParameters: TSTypeParameterDeclaration | null;
}
export interface TSMappedType extends Node {
	type: 'TSMappedType';
	typeParameter: TSTypeParameter;
	nameType: TSType | null;
	typeAnnotation: TSType | null;
	optional: TSMappedTypeModifierOperator;
	readonly: TSMappedTypeModifierOperator;
}
export type TSMappedTypeModifierOperator = 'true' | '+' | '-' | 'none';
export interface TSTemplateLiteralType extends Node {
	type: 'TSTemplateLiteralType';
	quasis: TemplateElement[];
	types: TSType[];
}
export interface TSAsExpression extends Node {
	type: 'TSAsExpression';
	expression: Expression;
	typeAnnotation: TSType;
}
export interface TSSatisfiesExpression extends Node {
	type: 'TSSatisfiesExpression';
	expression: Expression;
	typeAnnotation: TSType;
}
export interface TSTypeAssertion extends Node {
	type: 'TSTypeAssertion';
	expression: Expression;
	typeAnnotation: TSType;
}
export interface TSImportEqualsDeclaration extends Node {
	type: 'TSImportEqualsDeclaration';
	id: BindingIdentifier;
	moduleReference: TSModuleReference;
	importKind: ImportOrExportKind;
}
export type TSModuleReference = TSExternalModuleReference | IdentifierReference | TSQualifiedName;
export interface TSExternalModuleReference extends Node {
	type: 'TSExternalModuleReference';
	expression: StringLiteral;
}
export interface TSNonNullExpression extends Node {
	type: 'TSNonNullExpression';
	expression: Expression;
}
export interface Decorator extends Node {
	type: 'Decorator';
	expression: Expression;
}
export interface TSExportAssignment extends Node {
	type: 'TSExportAssignment';
	expression: Expression;
}
export interface TSNamespaceExportDeclaration extends Node {
	type: 'TSNamespaceExportDeclaration';
	id: IdentifierName;
}
export interface TSInstantiationExpression extends Node {
	type: 'TSInstantiationExpression';
	expression: Expression;
	typeParameters: TSTypeParameterInstantiation;
}
export type ImportOrExportKind = 'value' | 'type';
export interface JSDocNullableType extends Node {
	type: 'JSDocNullableType';
	typeAnnotation: TSType;
	postfix: boolean;
}
export interface JSDocNonNullableType extends Node {
	type: 'JSDocNonNullableType';
	typeAnnotation: TSType;
	postfix: boolean;
}
export interface JSDocUnknownType extends Node {
	type: 'JSDocUnknownType';
}
export interface JSXElement extends Node {
	type: 'JSXElement';
	openingElement: JSXOpeningElement;
	closingElement: JSXClosingElement | null;
	children: JSXChild[];
}
export interface JSXOpeningElement extends Node {
	type: 'JSXOpeningElement';
	selfClosing: boolean;
	name: JSXElementName;
	attributes: JSXAttributeItem[];
	typeParameters: TSTypeParameterInstantiation | null;
}
export interface JSXClosingElement extends Node {
	type: 'JSXClosingElement';
	name: JSXElementName;
}
export interface JSXFragment extends Node {
	type: 'JSXFragment';
	openingFragment: JSXOpeningFragment;
	closingFragment: JSXClosingFragment;
	children: JSXChild[];
}
export interface JSXOpeningFragment extends Node {
	type: 'JSXOpeningFragment';
}
export interface JSXClosingFragment extends Node {
	type: 'JSXClosingFragment';
}
export interface JSXNamespacedName extends Node {
	type: 'JSXNamespacedName';
	namespace: JSXIdentifier;
	property: JSXIdentifier;
}
export interface JSXMemberExpression extends Node {
	type: 'JSXMemberExpression';
	object: JSXMemberExpressionObject;
	property: JSXIdentifier;
}
export interface JSXExpressionContainer extends Node {
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
export interface JSXEmptyExpression extends Node {
	type: 'JSXEmptyExpression';
}
export type JSXAttributeItem = JSXAttribute | JSXSpreadAttribute;
export interface JSXAttribute extends Node {
	type: 'JSXAttribute';
	name: JSXAttributeName;
	value: JSXAttributeValue | null;
}
export interface JSXSpreadAttribute extends Node {
	type: 'JSXSpreadAttribute';
	argument: Expression;
}
export type JSXAttributeName = JSXIdentifier | JSXNamespacedName;
export type JSXAttributeValue = StringLiteral | JSXExpressionContainer | JSXElement | JSXFragment;
export interface JSXIdentifier extends Node {
	type: 'JSXIdentifier';
	name: Atom;
}
export type JSXChild = JSXText | JSXElement | JSXFragment | JSXExpressionContainer | JSXSpreadChild;
export interface JSXSpreadChild extends Node {
	type: 'JSXSpreadChild';
	expression: Expression;
}
export interface JSXText extends Node {
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
export interface SourceType {
	language: Language;
	moduleKind: ModuleKind;
	variant: LanguageVariant;
}
export type Language = 'javascript' | 'typescript' | 'typescriptDefinition';
export type ModuleKind = 'script' | 'module' | 'unambiguous';
export type LanguageVariant = 'standard' | 'jsx';
export interface Pattern {
	span: Node;
	body: Disjunction;
}
export interface Disjunction {
	span: Node;
	body: Alternative[];
}
export interface Alternative {
	span: Node;
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
	span: Node;
	kind: BoundaryAssertionKind;
}
export type BoundaryAssertionKind = 'Start' | 'End' | 'Boundary' | 'NegativeBoundary';
export interface LookAroundAssertion {
	span: Node;
	kind: LookAroundAssertionKind;
	body: Disjunction;
}
export type LookAroundAssertionKind =
	| 'Lookahead'
	| 'NegativeLookahead'
	| 'Lookbehind'
	| 'NegativeLookbehind';
export interface Quantifier {
	span: Node;
	min: number;
	max: number | null;
	greedy: boolean;
	body: Term;
}
export interface Character {
	span: Node;
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
	span: Node;
	kind: CharacterClassEscapeKind;
}
export type CharacterClassEscapeKind = 'D' | 'NegativeD' | 'S' | 'NegativeS' | 'W' | 'NegativeW';
export interface UnicodePropertyEscape {
	span: Node;
	negative: boolean;
	strings: boolean;
	name: Atom;
	value: Atom | null;
}
export interface Dot {
	span: Node;
}
export interface CharacterClass {
	span: Node;
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
	span: Node;
	min: Character;
	max: Character;
}
export interface ClassStringDisjunction {
	span: Node;
	strings: boolean;
	body: ClassString[];
}
export interface ClassString {
	span: Node;
	strings: boolean;
	body: Character[];
}
export interface CapturingGroup {
	span: Node;
	name: Atom | null;
	body: Disjunction;
}
export interface IgnoreGroup {
	span: Node;
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
	span: Node;
	index: number;
}
export interface NamedReference {
	span: Node;
	name: Atom;
}
