import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgressFiber } from './fiber';
import { HostRoot } from './workTags';

// dfs 遍历结构树
// 如果有子节点遍历子节点
// 如果没有则遍历兄弟节点

let workInProgress: FiberNode | null = null;

// 初始化
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgressFiber(root.current, {});
}

export function scheduleUpdateOnFinber(fiber: FiberNode) {
	const root = markUpdateFromFiberToRoot(fiber);
	renderNode(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;

	if (parent !== null) {
		node = parent;
		parent = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function renderNode(root: FiberRootNode) {
	prepareFreshStack(root);

	do {
		try {
			// 递归
			workLoop();
			break;
		} catch (error) {
			console.error('workloop error', error);
		}
	} while (true);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber); // 子节点或 null
	fiber.memorizedProps = fiber.pendingProps;

	// 无子节点执行 ‘归’ 阶段
	if (next === null) {
		compeleUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function compeleUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;

		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}

		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
