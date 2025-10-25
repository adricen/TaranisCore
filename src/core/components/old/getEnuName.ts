
function getEnumName(enumObj: { [key: string]: number }, value: number): string | undefined {
    for (const key in enumObj) {
        if (enumObj[key] === value) {
            return enumObj.constructor.name; // This will return "Object" in most cases
        }
    }
    return undefined;
}

export { getEnumName };