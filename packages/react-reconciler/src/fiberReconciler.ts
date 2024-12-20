import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { createUpdate, createUpdateQueue, enqueueUpdate } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFinber } from './workLoop';

// 创建根节点
export const createContainer = (container: Container) => {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);

	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
};

export const updateContainer = (
	element: ReactElementType | null,
	root: FiberRootNode
) => {
	const hostRootFiber = root.current;
	const update = createUpdate(element);
	enqueueUpdate(hostRootFiber?.updateQueue as any, update);
	scheduleUpdateOnFinber(hostRootFiber);

	return element;
};
