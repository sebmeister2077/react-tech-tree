import { ILayer, ILink, INode, INodeComputed, TreeType } from "../types";

/** Copies any type of object/array of objects 
 * @param obj The object to be copied
 * @param customKeys A list of keys that are to be excluded from deepCopy
*/
export function copyObject(obj: any, customKeys?: Array<string|number|symbol>) {
    if (obj == undefined)
        return;
    if (typeof obj !== 'object')
        return obj;
    
    const isArray = obj.length > -1;
    if (isArray)
        return copyArray(obj);
    
    const newObject = <typeof obj>{};
    const keys = Object.keys(obj);
    keys.forEach((key: keyof (typeof obj)) => {
        newObject[key] = copyKeysOfTypeObject(obj, key, customKeys);
    })
    
    return newObject
}

function copyArray(arr: any) {
    const newArr = new Array(0);
    arr.forEach((obj: any) => {
        newArr.push(copyObject(obj));
    })
    return newArr;
}

function copyKeysOfTypeObject(obj: any, key: string | number | symbol, customKeys?: Array<string | number | symbol>) {
    if (!key)
        return;
    if (customKeys && customKeys.includes(key))
        return obj[key];
    return copyObject(obj[key]);
}