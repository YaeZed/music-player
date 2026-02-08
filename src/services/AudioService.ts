import { Howl } from "howler";

/**
 * 音频播放服务
 *
 * 职责：
 * - 封装 Howler.js，提供统一的播放接口
 * - 管理音频实例的生命周期
 * - 处理播放、暂停、进度控制
 */
export class AudioService {
    private howler: Howl | null = null;
    private currentUrl: string = "";

    /**
     * 播放音频
     * @param url - 音频 URL
     */
    async play(url: string): Promise<void> {
        // 1. 如果是相同的 URL 且实例存在，直接尝试播放
        if (this.currentUrl === url && this.howler) {
            if (this.howler.state() === 'loaded') {
                this.howler.play();
            }
            return;
        }

        // 2. 如果不是，记录目标 URL 并卸载旧实例
        this.unload();
        this.currentUrl = url;

        console.log("🎵 [AudioService] Preparing:", url);

        return new Promise((resolve, reject) => {
            // 使用局部变量 instance 锁定当前 Promise 对应的 Howl 实例
            const instance = new Howl({
                src: [url],
                html5: true,
                format: ["mp3"],

                onload: () => {
                    // 双重检查：避免音频重叠问题：如果网络慢，当用户连续点击A，B，当A加载完成时，url却是B的，此时A的onload会检测不匹配，需要主动销毁自己
                    if (this.currentUrl !== url) {
                        instance.unload();
                        return;
                    }

                    console.log("✅ [AudioService] Audio loaded successfully");
                    instance.play();
                    resolve();
                },

                onloaderror: (id, error) => {
                    // 仅当该实例仍是当前活跃实例时才报错
                    if (this.currentUrl === url) {
                        console.error("❌ [AudioService] Load error:", error);
                        reject(new Error("音频加载失败"));
                    }
                    instance.unload();
                },

                onplayerror: (id, error) => {
                    console.error("❌ [AudioService] Play error (possible Autoplay block):", error);
                    reject(new Error("音频播放失败"));
                },
            });

            // 将局部实例挂载到类成员，以便外部进行其他操作
            this.howler = instance;
        });
    }

    /**
     * 暂停播放
     */
    pause(): void {
        if (this.howler) {
            this.howler.pause();
            console.log("⏸️ [AudioService] Paused");
        }
    }

    /**
     * 恢复播放
     */
    resume(): void {
        if (this.howler) {
            this.howler.play();
            console.log("▶️ [AudioService] Resumed");
        }
    }

    /**
     * 停止播放
     */
    stop(): void {
        if (this.howler) {
            this.howler.stop();
            console.log("⏹️ [AudioService] Stopped");
        }
    }

    /**
     * 获取播放状态
     */
    isPlaying(): boolean {
        return this.howler?.playing() ?? false;
    }

    /**
     * 设置音量
     * @param volume - 音量值（0-1）
     */
    setVolume(volume: number): void {
        if (this.howler) {
            this.howler.volume(Math.max(0, Math.min(1, volume)));
        }
    }

    /**
     * 获取当前播放进度（秒）
     */
    getCurrentTime(): number {
        return this.howler?.seek() ?? 0;
    }

    /**
     * 跳转到指定时间
     * @param time - 时间（秒）
     */
    seek(time: number): void {
        if (this.howler) {
            this.howler.seek(time);
        }
    }

    /**
     * 卸载音频实例
     */
    unload(): void {
        if (this.howler) {
            this.howler.unload();
            this.howler = null;
            this.currentUrl = "";
            console.log("🗑️ [AudioService] Audio unloaded");
        }
    }
}

// 导出单例
export const audioService = new AudioService();