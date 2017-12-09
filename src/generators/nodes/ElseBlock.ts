import Node from './shared/Node';
import Block from '../dom/Block';

export default class ElseBlock extends Node {
	type: 'ElseBlock';
	children: Node[];
	block: Block;
}