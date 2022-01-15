import { ILayer, ILink, INode } from "./types";

const isObjectArray = (obj: any): boolean => {
    try {
        obj.entries();
        return true;
    } catch {
        return false;
    }
}

function copyArray(arr: any) {
    const newArr = new Array(0);
    arr.forEach((obj: any) => {
        newArr.push(copyObject(obj));
    })
    return newArr;
}

/** Copies any type of object/array of objects */
export function copyObject(obj: any) {
    if (obj == undefined)
        return;
    if (typeof obj !== 'object')
        return obj;
    
    const isArray = isObjectArray(obj);
    if (isArray)
        return copyArray(obj);
    const newObject = <typeof obj>{};
    
    const keys = Object.keys(obj);
    keys.forEach((key: keyof (typeof obj)) => {
        newObject[key] = copyObject(obj[key]);
    })
    
    return newObject
}

function findAllRoots(nodes: INode[]): INode[] {
    let arr = new Array<INode>(0);
    for (let idx = 0; idx < nodes.length; idx++) {
        const isRoot = nodes[idx].isRoot;
        if (isRoot) {
            arr.push(nodes[idx]);
        }
    }
    return arr;
}

/** Creates a list of layers based on the input */
export const createLayers = (nodes: INode[], links: ILink[]):ILayer[] => {
    let arrLayers = new Array<ILayer>(0);
    if (!nodes || nodes.length < 2)
        return arrLayers;
    //Algorithm: travel through graph BF
    
    const nodeCount = nodes.length;
    let count = 0;
    let layer = 0;
    let currentNodeQueue = new Array<INode>(0);
    let visitedNodes = new Array<INode>(0);

    currentNodeQueue = findAllRoots(nodes);
    setNodesVisited(currentNodeQueue, visitedNodes);
    count += currentNodeQueue.length;
    const noRootNodes = count == 0;

    if (noRootNodes)
        throw new Error("Input doesn't contain any root nodes");

    const firstLayer = <ILayer>{
        nodes: currentNodeQueue,
        level: layer,
    }
    arrLayers.push(firstLayer)

    while (count < nodeCount) {
        layer++;
        let newNodeQueue = new Array<INode>(0);

        currentNodeQueue.forEach((node: INode) => {
            let children = findChildrenNodes(nodes, node, links, visitedNodes);
            count += children.length;
            newNodeQueue.push(...children);
        })
        
        const invalidNodePosition = count < nodeCount && newNodeQueue.length == 0;
        if (invalidNodePosition)
            throw new Error('There exists nodes which are neither connected nor are Root Nodes');
        
        currentNodeQueue = newNodeQueue;
        let newLayer = <ILayer>{
            nodes: newNodeQueue,
            level: layer,
        }
        arrLayers.push(newLayer);        
    }
    return copyObject(arrLayers);
}

function findChildrenNodes(nodes: INode[], node: INode, links: ILink[], visitedNodes: INode[]): INode[] {
    let childrenArr = new Array<INode>(0);
    const nodeId = node.id;

    let childrensId = links.filter((link: ILink) => link.nodeA == nodeId || link.nodeB == nodeId)
        .map((link: ILink) => {
            if (link.nodeA == node.id)
                return link.nodeB;
            return link.nodeA;
        })
    
    childrensId.filter((id: string) => {
        let wasVisited = visitedNodes.find(n => n.id == id);
        return !wasVisited;
    }).forEach((id: string) => {
        let child = nodes.find(n => n.id == id) as INode;
        childrenArr.push(child);
    })

    return childrenArr;
}

function setNodesVisited(newNodes: INode[], destinationNodes: INode[]) {
    destinationNodes.push(...newNodes);
}