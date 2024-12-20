import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

// dfs 遍历结构树
// 如果有子节点遍历子节点
// 如果没有则遍历兄弟节点

let workInProgress: FiberNode | null = null;

// 初始化
function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}

function renderNode(root: FiberNode) {
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
