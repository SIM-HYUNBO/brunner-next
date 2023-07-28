`use strict`

export default function isJson(str) {
    try {
        if (!str)
            return false;

        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}