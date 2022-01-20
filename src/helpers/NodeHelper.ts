import { ILayer, ILink, INode, INodeComputed } from "../types";
import { deepCopyObject } from "./ObjectHelper";

const findAllRoots = (nodes: INodeComputed[]): INodeComputed[] => {
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

const findChildrenNodes = (nodes: INodeComputed[], node: INodeComputed, links: ILink[], visitedNodeIds?: string[]): INodeComputed[] => {
    let childrenArr = new Array<INodeComputed>(0);

    let childrensId = getChildrensIds(links, node.id);
    
    childrensId.filter((id: string) => {
        if (!visitedNodeIds)
            return true;
        
        let wasVisited = visitedNodeIds.find(i => i == id);
        return !wasVisited;
    }).forEach((id: string) => {
        let child = nodes.find(n => n.id == id);
        if (child && !child.isRoot) {
            child.parents++;
            childrenArr.push(child);
        }
    })

    return childrenArr;
}

const setNodesVisited = (nodesToBeAdded: INode[], destinationNodes: string[]) => {
    destinationNodes.push(...nodesToBeAdded.map((node: INode) => node.id));
}

const makeNodeComputed = (node: INode): INodeComputed => {
    let computed = node as INodeComputed;
        computed.children = 0;
        computed.parents = 0;

        return computed;
}

const findParentsInUpperLayer = (upperLayer: ILayer, links: ILink[], node: INodeComputed) => {
    const parentsCount = links.filter((link: ILink) => filterNodeLinks(link, node.id))
        .filter((link: ILink) => upperLayer.nodes.find((n: INodeComputed) => filterNodeLinks(link, n.id)))
        .length;
    
    node.parents = parentsCount;
}

const addParentsForNodes = (layers: ILayer[], links: ILink[], allowMoreParents?: boolean) => {
    layers.forEach((layer: ILayer, idx: number) => {
        if (idx == 0)
            return;
        layer.nodes.forEach((node: INodeComputed) => {
            findParentsInUpperLayer(layers[idx - 1], links, node);
            if (node.parents > 1 && !allowMoreParents)
                throw new Error(`Some nodes have at least 2 parents, childId: ${node.id}`)
        });
    })
}

/** Creates a list of layers based on the input */
export const createLayers = (givenNodes: INode[], links: ILink[], allowMoreParents?: boolean):ILayer[] => {
    let arrLayers = new Array<ILayer>(0);
    if (!givenNodes || givenNodes.length < 2)
        return arrLayers;
    //Algorithm: travel through graph BF
    
    const nodes = givenNodes.map(makeNodeComputed);
    const nodeCount = nodes.length;
    let count = 0;
    let layer = 0;
    let currentNodeQueue = new Array<INodeComputed>(0);
    let visitedNodeIds = new Array<string>(0);

    currentNodeQueue = findAllRoots(nodes);
    setNodesVisited(currentNodeQueue, visitedNodeIds);
    count += currentNodeQueue.length;
    const noRootNodes = count == 0;

    if (noRootNodes)
        throw new Error("Input doesn't contain any root nodes");

    while (count < nodeCount) {
        let newNodeQueue = new Array<INodeComputed>(0);

        currentNodeQueue.forEach((node: INodeComputed) => {
            let children = findChildrenNodes(nodes, node, links, visitedNodeIds);
            count += children.length;
            node.children=children.length
            newNodeQueue.push(...children);
            setNodesVisited (children, visitedNodeIds);
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

        currentNodeQueue = newNodeQueue;
        layer++;
    }
    
    let newLayer = <ILayer>{
        nodes: currentNodeQueue,
        level: layer,
        nodesCount: currentNodeQueue.length,
    }
    arrLayers.push(newLayer); 

    addParentsForNodes(arrLayers, links, allowMoreParents)
    
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