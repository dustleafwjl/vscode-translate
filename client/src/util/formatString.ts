
export function toLittleHump(text: string): string {
    return text.split(" ").map((ele, index)=> {
        let temp
        if(index !== 0) {
            temp = ele.replace(ele[0], ele[0].toUpperCase())    
        }else {
            temp = ele.replace(ele[0], ele[0].toLowerCase())
        }
        return temp
    }).join("")
}