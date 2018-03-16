import Node from './shared/Node';
import Attribute from './Attribute';
import AwaitBlock from './AwaitBlock';
import Binding from './Binding';
import CatchBlock from './CatchBlock';
import Comment from './Comment';
import Component from './Component';
import EachBlock from './EachBlock';
import Element from './Element';
import ElseBlock from './ElseBlock';
import EventHandler from './EventHandler';
import Fragment from './Fragment';
import Head from './Head';
import IfBlock from './IfBlock';
import MustacheTag from './MustacheTag';
import PendingBlock from './PendingBlock';
import RawMustacheTag from './RawMustacheTag';
import Ref from './Ref';
import Slot from './Slot';
import Spread from './Spread';
import Text from './Text';
import ThenBlock from './ThenBlock';
import Title from './Title';
import Transition from './Transition';
import Window from './Window';

const nodes: Record<string, any> = {
	Attribute,
	AwaitBlock,
	Binding,
	CatchBlock,
	Comment,
	Component,
	EachBlock,
	Element,
	ElseBlock,
	EventHandler,
	Fragment,
	Head,
	IfBlock,
	MustacheTag,
	PendingBlock,
	RawMustacheTag,
	Ref,
	Slot,
	Spread,
	Text,
	ThenBlock,
	Title,
	Transition,
	Window
};

export default nodes;
