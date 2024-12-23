import {
	Container,
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags } from './fiberFlags';

// 递归中的 ‘归’ 阶段
// 构建离屏 DOM 树
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		// 构建 DOM
		// DOM 插入到 DOM 树中
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				const instance = createInstance(wip.type);
				appendAllChild(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 构建
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		default:
			// if (__DEV__) {
			console.warn('completework 未实现节点类型');
			// }
			break;
	}
};

function appendAllChild(parent: Container, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		// 已经到 root
		if (node === wip) {
			return;
		}

		// 看是否有兄弟节点
		while (node.sibling === null) {
			// 无父节点或父节点为 root
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// 在 ‘归’ 过程中，向上冒泡，将 fiberNode 的 flags 冒泡到 父 fiberNode
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subtreeFlags |= subtreeFlags;
}
