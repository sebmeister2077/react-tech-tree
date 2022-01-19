import { ILayer, ILink, INode, INodeComputed } from "../types";
import { deepCopyObject } from "./ObjectHelper";

const findAllRoots = (nodes: INode[]): INodeComputed[] => {
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

const filterNodeLinks = (link: ILink, nodeId: string) => link.nodeA == nodeId || link.nodeB == nodeId

const getChildrensIds = (links: ILink[], nodeId: string): string[] => {
    const extractAsStrings = (link: ILink) => {
            if (link.nodeA == nodeId)
                return link.nodeB;
            return link.nodeA;
    }
    
   return links.filter((link: ILink) => filterNodeLinks(link, nodeId)).map(extractAsStrings)
}

const findChildrenNodes = (nodes: INode[], node: INode, links: ILink[], visitedNodes?: INode[]): INode[] => {
    let childrenArr = new Array<INode>(0);

    let childrensId = getChildrensIds(links, node.id);
    
    childrensId.filter((id: string) => {
        if (!visitedNodes)
            return true;
        
        let wasVisited = visitedNodes.find(n => n.id == id);
        return !wasVisited;
    }).forEach((id: string) => {
        let child = nodes.find(n => n.id == id);
        if(!child.isRoot)
        childrenArr.push(child);
    })

    return childrenArr;
}

const setNodesVisited = (nodesToBeAdded: INode[], destinationNodes: INode[]) => {
    destinationNodes.push(...nodesToBeAdded);
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
            nodesCount: currentNodeQueue.length,
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
        nodesCount: currentNodeQueue.length,
    }
    arrLayers.push(newLayer); 
    
    return deepCopyObject(arrLayers);
}

export const getLayerWithMaxNodes = (layers: ILayer[]): ILayer => {
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