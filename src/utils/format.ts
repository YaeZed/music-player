/**
 * 格式化秒数为 mm:ss 格式
 * @param seconds - 秒数
 * @returns 格式化的时间字符串
 */
const formatTime = (seconds: number): string => {
    // isFinite用于确定传入的值是否是一个有限数值
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "00:00"
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    // padStart(targetLength, padString) 用于在字符串的开头填充指定的字符，直到字符串达到目标长度
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 格式化毫秒为 mm:ss 格式
 * @param ms - 毫秒数
 */
const formatDuration = (ms: number): string => {
    return formatTime(ms / 1000)
}

export { formatTime, formatDuration }