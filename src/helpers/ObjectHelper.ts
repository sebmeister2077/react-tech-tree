/** Copies any type of object/array of objects 
 * @param obj The object to be copied
 * @param customKeys A list of keys that are to be excluded from deepCopy
*/
export function deepCopyObject(obj: any, customKeys?: Array<string|number|symbol>) {
    if (obj == undefined)
        return;
    if (typeof obj !== 'object')
        return obj;
    if (typeof obj === 'function')
        return obj;
        
    const isArray = obj.length > -1;
    if (isArray)
        return copyArray(obj);
    
    const isObjectDate = obj instanceof Date;
    if(isObjectDate)
        return new Date(obj);
    
    const isDOM = obj.nodeType && typeof obj.cloneNode == "function";
    if (isDOM)
        return obj.cloneNode(true);
    
    const isHtmlComponent = obj.$$typeof != undefined;
    if (isHtmlComponent) {
        console.log(isHtmlComponent)
        return obj;
    }

    const newObject = <typeof obj>{};
    const keys = Object.keys(obj);
    keys.forEach((key: keyof (typeof obj)) => {
        newObject[key] = copyKeysOfTypeObject(obj, key, customKeys);
    })

    const cantAccessObjectKeys = keys.length == 0; // ex: window.navigator
    if (cantAccessObjectKeys)
        return obj;
    
    return newObject
}

function copyArray(arr: any) {
    const newArr = new Array(0);
    arr.forEach((obj: any) => {
        newArr.push(deepCopyObject(obj));
    })
    return newArr;
}

function copyKeysOfTypeObject(obj: any, key: string | number | symbol, customKeys?: Array<string | number | symbol>) {
    if (!key)
        return;
    if (customKeys && customKeys.includes(key))
        return obj[key];
    return deepCopyObject(obj[key]);
}