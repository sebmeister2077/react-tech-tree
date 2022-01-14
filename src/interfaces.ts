import { ReactElement } from "react";

export interface INode{
    id: string;
    isRoot?: boolean,
    text?: string;
    component?: ReactElement;
    //you can have multiple roots
}

export interface ILink{
    id: string;
    from: string;
    to: string;
}

export enum ITreeType{
    radial = "radial",
    vertical = "vertical",
    horizontal = "horizontal",
}