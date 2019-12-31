import BaseTranslate from "./translate";
import GoogleTranslate from "./GoogleTranslate";


const translatorArr = {}

translatorArr["google"] = GoogleTranslate



export default function (type: string) {
    return new translatorArr[type]
}