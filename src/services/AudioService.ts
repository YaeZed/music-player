import { Howl, Howler } from "howler"

export class AudioService {
    private howler: Howl | null = null;

    /**
     * html5: true 非常关键，它让音乐以流媒体方式加载，而不是全部下完才播，适合大文件。
     * @param url 
     */
    async play(url: string): Promise<void> {
        // 清空上一次的播放资源
        this.unload();

        // 实例化播放引擎
        this.howler = new Howl({
            src: [url],
            html5: true,
            format: ["mp3", "flac"],
        });

        this.howler.play();
    }
    // 暂停
    pause(): void {
        this.howler?.pause();
    }
    // 继续播放
    resume(): void {
        this.howler?.play();
    }
    // 跳转进度
    seek(time: number): void {
        this.howler?.seek(time);
    }
    // 获取当前进度
    // 实时获取歌曲播到第几秒了，通常用于同步播放栏的进度条。
    getSeek(): number {
        // ?? 0空值合并，如果左侧的结果是 null 或 undefined（因为 howler 不存在），它就会取右侧的默认值 0
        return this.howler?.seek() ?? 0;
    }
    // 销毁
    unload(): void {
        if (this.howler) {
            this.howler.stop();
            this.howler.off(); // 移除所有事件监听，防止内存泄漏
            this.howler.unload(); // 这一步会释放 HTML5 Audio 对象
            this.howler = null;
        }
    }
}

// 单例导出
export const audioService = new AudioService()