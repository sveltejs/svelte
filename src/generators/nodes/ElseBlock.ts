import Node from './shared/Node';
import Block from '../dom/Block';
import State from '../dom/State';

export default class ElseBlock extends Node {
	type: 'ElseBlock';
	children: Node[];
	_block: Block;
}