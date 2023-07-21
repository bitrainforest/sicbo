export function tryParseJSON(input: string): string | object {
  try {
    return JSON.parse(input);
  } catch (error) {
    return input;
  }
}
export const isNum = (val: string | number, isInt?: boolean) => {
  if (val === "") {
    return false;
  }
  const n = Number(val);
  if (isNaN(n)) {
    return false;
  }
  if (isInt && parseInt(String(val), 10) != n) {
    return false;
  }
  return true;
};
export const timestampToTime = (timestamp: string | number, format = 'YYYY-MM-DD hh:mm:ss') => {
  if (!timestamp) {
    return ''
  }
  let ret = format
  const date = new Date(timestamp)
  const Y = date.getFullYear()
  ret = ret.replace('YYYY', String(Y))
  const M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  ret = ret.replace('MM', String(M))
  const D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  ret = ret.replace('DD', String(D))
  const h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  ret = ret.replace('hh', String(h))
  const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  ret = ret.replace('mm', String(m))
  const s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  ret = ret.replace('ss', String(s))
  // 处理只有YY的情况
  ret = ret.replace('YY', String(Y).substr(2, 2))
  return ret
}