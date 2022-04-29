/**
 * 防抖包装
 * @param {Function} func 被执行函数
 * @param {Number} interval 时间间隔
 * @returns 防抖处理后的函数
 */
function debounce(func, interval = 500) {
    let timer = false;
    return function() {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(()=> {
            func()
        }, interval)
    }
}