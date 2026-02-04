import axios from 'axios'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15000,
    withCredentials: true
})

// 请求拦截
request.interceptors.request.use((config) => {
    const token = localStorage.getItem("MUSIC_U");
    if (token) {
        config.params = {
            ...config.params,
            cookie: `MUSIC_U = ${token}`
        }
    }
    return config
})

// 响应拦截器
request.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // 统一错误处理
        return Promise.reject(error);
    },
);

export default request;