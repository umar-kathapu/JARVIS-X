import { WorkflowDefinition, WorkflowNode } from '../types/workflow.types.js';

export class WorkflowCompiler {
  compile(workflow: WorkflowDefinition): WorkflowNode[] {
    const nodeMap = new Map<string, WorkflowNode>();
    workflow.nodes.forEach((n) => nodeMap.set(n.id, n));

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const order: WorkflowNode[] = [];

    const dfs = (nodeId: string) => {
      if (recStack.has(nodeId)) {
        throw new Error(`Circular dependency detected in workflow '${workflow.id}' at node '${nodeId}'`);
      }
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        recStack.add(nodeId);

        const outgoingEdges = workflow.edges.filter((e) => e.sourceNodeId === nodeId);
        outgoingEdges.forEach((e) => dfs(e.targetNodeId));

        recStack.delete(nodeId);
        const node = nodeMap.get(nodeId);
        if (node) order.unshift(node);
      }
    };

    // Find trigger/start nodes
    const startNodes = workflow.nodes.filter((n) => n.type === 'TRIGGER');
    if (startNodes.length === 0 && workflow.nodes.length > 0) {
      startNodes.push(workflow.nodes[0]!);
    }

    startNodes.forEach((n) => dfs(n.id));

    return order;
  }
}

export const workflowCompiler = new WorkflowCompiler();
