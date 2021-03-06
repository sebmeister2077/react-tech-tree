import { ReactElement } from "react";

export interface INode{
    id: string;
    isRoot?: boolean,
    text?: string;
    component?: ReactElement;
}

/** Internal use */
export interface INodeComputed extends INode{
    children: number;
    parents: number;
    layer: number;
}

export interface ILink{
    id?: string;
    nodeA: string;
    nodeB: string;
}

export enum TreeType{
    radial = "radial",
    toLeft = "toLeft",
    toRight = "toRight",
    toTop = 'toTop',
    toBottom = 'toBottom',
}

/** Internal use */
export interface ILayer{
    nodes: INodeComputed[];
    level: number;
    nodesCount: number;
}