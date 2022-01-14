import React from "react";
import { ILayer, ILink, INode } from "./interfaces";

const isObjectArray = (obj: any): boolean => {
    try {
        obj.entries();
        return true;
    } catch {
        return false;
    }
}

const copyArray = (arr: any) => {
    const newArr = new Array(0);
    arr.forEach((obj: any) => {
        newArr.push(copyObject(obj));
    })
    return newArr;
}

/** Copies any type of object/array of objects */
export const copyObject = (obj: any) => {
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

/** Creates a list of layers based on the input */
export const createLayers = (nodes: INode[], links: ILink[]):ILayer[] => {
    let arr = new Array<ILayer>(0);
    return arr;
}

