
export default function isJson(str) {
    try {
        if (typeof str == "undefined")
            return false;

        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}