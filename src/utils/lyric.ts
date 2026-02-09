import type { Lyric, LyricLine } from "@/types/entities/track";

/**
 * 解析 LRC 格式歌词
 *
 * LRC 格式示例：
 * [00:12.00]歌词第一行
 * [00:17.20]歌词第二行
 *
 * @param lrcString - LRC 格式字符串
 * @returns 解析后的歌词对象
 */
const parseLyric = (lrcString: string): Lyric => {
    const lines: LyricLine[] = [];

    // 按行分割
    const lrcLines = lrcString.split("\n");

    // 时间标签正则：[mm:ss.xx]
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    for (const line of lrcLines) {
        // 提取所有时间标签
        const times: number[] = [];
        let match;

        while ((match = timeRegex.exec(line)) !== null) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, "0"));

            // 转换为总秒数
            const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
            times.push(totalSeconds);
        }

        // 提取歌词文本（去除时间标签）
        const text = line.replace(/\[.*?\]/g, "").trim();

        // 如果有文本，为每个时间标签创建一行歌词
        if (text && times.length > 0) {
            for (const time of times) {
                lines.push({ time, text });
            }
        }
    }

    // 按时间排序
    lines.sort((a, b) => a.time - b.time);

    return { lines };
}

/**
 * 获取当前应该显示的歌词索引
 * 使用二分查找优化性能 O(log n)
 *
 * @param lines - 歌词行数组
 * @param currentTime - 当前播放时间（秒）
 * @returns 当前歌词的索引
 */

const getCurrentLyricIndex = (lines: LyricLine[], currentTime: number): number => {
    if (lines.length == 0) return -1;

    // 二分查找
    let left = 0;
    let right = lines.length - 1;
    let result = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (lines[mid]!.time <= currentTime) {
            result = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;

}

export { parseLyric, getCurrentLyricIndex }