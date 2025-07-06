import crypto from 'crypto';
import CryptoJS from 'crypto-js';
const buildQueryString = (params) => {
    if (!params) return '';
    return Object.entries(params).map(stringifyKeyValuePair).join('&');
}
const stringifyKeyValuePair = ([key, value]) => {
    const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value;
    return `${key}=${encodeURIComponent(valueString)}`;
}
export const getTimestamp = () => {
    return Date.now();
}
/**
 * 对传入的对象按 key 字母排序并返回排序后的对象
 * @param {Object} obj - 待排序的对象
 * @returns {Object} - 排序后的对象
 */
function sortObjectByKey(obj) {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = obj[key];
    });
    return sortedObj;
}

export function get_signed_param(secretKey, param) {
    let timestamp = getTimestamp()
    param["timestamp"] = timestamp
    param["recvWindow"] = 60000
    // 对 param 按 key 字母排序
    const sortedParam = sortObjectByKey(typeof param === 'string' ? JSON.parse(param) : param);
    let signature = '';

    const params = buildQueryString(sortedParam);
    // Replace crypto module with crypto-js
    const hmac = CryptoJS.HmacSHA256(params, secretKey);
    signature = hmac.toString(CryptoJS.enc.Hex);
    sortedParam['signature'] = signature;
    return sortedParam
}

export function getWalletBalanceParam(secretKey) {
    let param = {}
    return get_signed_param(secretKey, param)
}

export function getBuySymbolParam(secretKey,symbol,quantity) {
    let param = {
        'symbol': symbol,
        'side': 'BUY',
        'type': 'MARKET',
        'quoteOrderQty': quantity,
        "newOrderRespType":"ACK"
    }
    return get_signed_param(secretKey, param)
}


