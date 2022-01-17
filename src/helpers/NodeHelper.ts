import { ILayer, ILink, INode, INodeComputed } from "../types";
import { deepCopyObject } from "./ObjectHelper";

/** Creates a list of layers based on the input */
export const createLayers = (nodes: INode[], links: ILink[]):ILayer[] => {
    let arrLayers = new Array<ILayer>(0);
    if (!nodes || nodes.length < 2)
        return arrLayers;
    //Algorithm: travel through graph BF
    
    const nodeCount = nodes.length;
    let count = 0;
    let layer = 0;
    let currentNodeQueue = new Array<INodeComputed>(0);
    let visitedNodes = new Array<INode>(0);

    currentNodeQueue = findAllRoots(nodes);
    setNodesVisited(currentNodeQueue, visitedNodes);
    count += currentNodeQueue.length;
    const noRootNodes = count == 0;

    if (noRootNodes)
        throw new Error("Input doesn't contain any root nodes");

    while (count < nodeCount) {
        let newNodeQueue = new Array<INode>(0);

        currentNodeQueue.forEach((node: INodeComputed) => {
            let children = findChildrenNodes(nodes, node as INode, links, visitedNodes);
            count += children.length;
            node.children=children.length
            newNodeQueue.push(...children);
        })
        
        const invalidNodePosition = count < nodeCount && newNodeQueue.length == 0;
        if (invalidNodePosition) {
            throw new Error('There exists nodes which are neither connected nor are Root Nodes');
        }
        
        let newLayer = <ILayer>{
            nodes: currentNodeQueue,
            level: layer,
        }
        arrLayers.push(newLayer); 
        setNodesVisited(currentNodeQueue, visitedNodes);
        currentNodeQueue = newNodeQueue.map((item: INode):INodeComputed => {
            let nodeComputed = item as INodeComputed;
            nodeComputed.children = 0;
            return nodeComputed;
        });
        layer++;
    }
    
    let newLayer = <ILayer>{
            nodes: currentNodeQueue,
            level: layer,
    }
    arrLayers.push(newLayer); 
    
    return deepCopyObject(arrLayers);
}

export function getLayerWithMaxNodes(layers: ILayer[]): ILayer{
    let max = 0;
    let layerIndex = 0;
    layers.forEach((element, idx) => {
        if (max < element.nodes.length) {
            max = element.nodes.length;
            layerIndex = idx;
        }
    });
    
    return layers[layerIndex];
}

export const getNodeChildrenCount = (node: INode, nodes: INode[], links: ILink[], layerBefore?: ILayer ): number => {
    let children = findChildrenNodes(nodes, node, links, layerBefore ? layerBefore.nodes : undefined);
    return children.length;
}

function findAllRoots(nodes: INode[]): INodeComputed[] {
    let arr = new Array<INodeComputed>(0);
    for (let idx = 0; idx < nodes.length; idx++) {
        const isRoot = nodes[idx].isRoot;
        if (isRoot) {
            const node = nodes[idx];
            let newNode = <INodeComputed>{
                id: node.id,
                isRoot: node.isRoot,
                text: node.text,
                component: node.component,
                children: 0,
            }
            arr.push(newNode);
        }
    }
    return arr;
}

function findChildrenNodes(nodes: INode[], node: INode, links: ILink[], visitedNodes?: INode[]): INode[] {
    let childrenArr = new Array<INode>(0);
    const nodeId = node.id;

    let childrensId = links.filter((link: ILink) => link.nodeA == nodeId || link.nodeB == nodeId)
        .map((link: ILink) => {
            if (link.nodeA == node.id)
                return link.nodeB;
            return link.nodeA;
        })
    
    childrensId.filter((id: string) => {
        if (!visitedNodes)
            return true;
        
        let wasVisited = visitedNodes.find(n => n.id == id);
        return !wasVisited;
    }).forEach((id: string) => {
        let child = nodes.find(n => n.id == id) as INode;
        if(!child.isRoot)
        childrenArr.push(child);
    })

    return childrenArr;
}

function setNodesVisited(newNodes: INode[], destinationNodes: INode[]) {
    destinationNodes.push(...newNodes);
}