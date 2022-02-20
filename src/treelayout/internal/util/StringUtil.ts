export class StringUtil {
    /**
     * Returns a quoted version of a given string, i.e. as a Java String
     * Literal.
     * 
     * @param s
     *            [nullable] the string to quote
     * @param nullResult
     *            [default="null"] the String to be returned for null values.
     * @return the nullResult when s is null, otherwise s as a quoted string
     *         (i.e. Java String Literal)
     * 
     */
    static quote(s: string | null): string {
        if (s == null) {
            return "null";
        }

        let result: string = "";
        result.concat('"');
        let length = s.length;
        for (let i = 0; i < length; i++) {
            let c = s.charAt(i);
            switch (c) {
                case '\b': {
                    result.concat("\\b");
                    break;
                }
                case '\f': {
                    result.concat("\\f");
                    break;
                }
                case '\n': {
                    result.concat("\\n");
                    break;
                }
                case '\r': {
                    result.concat("\\r");
                    break;
                }
                case '\t': {
                    result.concat("\\t");
                    break;
                }
                case '\\': {
                    result.concat("\\\\");
                    break;
                }
                case '"': {
                    result.concat("\\\"");
                    break;
                }
                default: {
                    if (c < ' ' || c >= '\u0080') {
                        let n: string = Buffer.from(c).toString("hex");
                        result.concat("\\u");
                        result.concat("0000".substring(n.length));
                        result.concat(n);
                    } else {
                        result.concat(c);
                    }
                }
            }
        }
        result.concat('"');
        return result.toString();
    }
}
