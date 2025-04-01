import { FieldError } from "./customErrors";

export type TCheckFieldObject = {
    name: string,
    value: string | number | undefined,
    minLength?: number,
    maxLength?: number,
    regex?: RegExp,
}
function checkFields(entityName: string, checkObjects: TCheckFieldObject[]): void {
    let errorMessage = "";
    for (const checkObject of checkObjects) {
        if (!checkObject.value) {
            errorMessage += `${checkObject.name} darf nicht null sein!`
        } else {
            if (checkObject.minLength) {
                if (checkObject.value.toString().length < checkObject.minLength) {
                    errorMessage += `${errorMessage.length > 0 && ", "} ${checkObject.name} muss mindestens ${checkObject.minLength} Zeichen lang sein\n VALUE: ${checkObject.value}`;
                }
            }
            if (checkObject.maxLength) {
                if (checkObject.value.toString().length > checkObject.maxLength) {
                    errorMessage += `${errorMessage.length > 0 && ", "} ${checkObject.name} darf hochstens ${checkObject.maxLength} Zeichen lang sein\n VALUE: ${checkObject.value}`;
                }
            }
            if (checkObject.regex) {
                if (!checkObject.regex.test(checkObject.value.toString())) {
                    errorMessage += `${errorMessage.length > 0 && ", "} Das Wert '${checkObject.value}' fur Feld: '${checkObject.name}' nicht passt.`;
                }
            }
        }
        
    }
    if (errorMessage.length > 0) {
        throw new FieldError(entityName, errorMessage);
    } else return;
};

function dateToString(date: Date): string {
    return date.toLocaleString('en-us', { year: 'numeric', month: '2-digit', day: '2-digit'});
};
export { checkFields, dateToString };