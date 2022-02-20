

/**
 * A set of methods to support some sort of "Design by Contract" programming.
 */
export class Contract {

    static checkArg(isOK:boolean, s:string): never | void {
		if (!isOK) {
			IllegalArgumentException(s);
		}
	}

    static checkState(isOK:boolean, s:string): never | void {
		if (!isOK) {
			IllegalStateException(s);
		}
	}

}

function IllegalStateException(msg: string): never{
    throw new Error("Illegal State Exception: ".concat(msg));
}

function IllegalArgumentException(msg: string):never {
    throw new Error("Illegal Argument Exception: ".concat(msg));
}

