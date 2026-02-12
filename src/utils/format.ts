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

/**
 * 格式化播放次数
 * @param count - 播放次数
 * @returns 格式化后的字符串（如：1.2万、10.5亿）
 */
const formatPlayCount = (count: number): string => {
    if (count < 10000) {
        return count.toString();
    }

    if (count < 100000000) {
        return (count / 10000).toFixed(1) + "万";
    }

    return (count / 100000000).toFixed(1) + "亿";
}

const getAlbumType = (album: { type: string; size: number }): string => {
    if (album.type === "EP/Single") {
        return album.size === 1 ? "Single" : "EP";
    }
    if (album.type === "Single") {
        return "Single";
    }
    if (album.type === "专辑") {
        return "Album";
    }
    return album.type;
}

export { formatTime, formatDuration, formatPlayCount, getAlbumType }