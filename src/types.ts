import { ReactElement } from "react";

export interface INode{
    id: string;
    isRoot?: boolean,
    text?: string;
    component?: ReactElement;
}

export interface ILink{
    id: string;
    nodeA: string;
    nodeB: string;
}

export enum ITreeType{
    radial = "radial",
    toLeft = "toLeft",
    toRight = "toRight",
    toTop = 'toTop',
    toBottom = 'toBottom',
}

export interface ILayer{
    nodes: INode[];
    level: number;
}