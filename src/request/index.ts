import axios from "axios";

const mockType = 'cbzMock'  // fastMock
const baseURL = mockType === 'cbzMock' ? 'http://localhost:8083/api' : 'https://www.fastmock.site/mock/bf1fcb3c2e2945669c2c8d0ecb8009b8/api'
//创建axios实例
const service = axios.create({
    baseURL: "http://localhost:8083",
    timeout: 5000,
    headers: {
        "Content-type" : "application/json;charset=utf-8"
    }
})


// 请求拦截
service.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    const token = localStorage.getItem("token");
    // 检查 token 是否存在且有效
    if (token && token !== 'undefined' && token !== 'null' && token.length > 0) {
        // 确保 headers 存在
        if (!config.headers) {
            config.headers = {};
        }
        // 设置 Authorization 头部字段
        config.headers['Authorization'] = token;
    } else {
        // 如果 token 无效，从 localStorage 中移除
        localStorage.removeItem('token');
    }
    return config;
    },
    error => {
        return Promise.reject(error);
    });

// 响应拦截
service.interceptors.response.use((response) => {
    const data = response.data;
    const code: number = data.code;
    console.log('Response interceptor:', data); // 调试信息
    if (code !== 200) {
        return Promise.reject(data);
    }
    return data;
}, (err) => {
    console.log(err);
    return Promise.reject(err);
});

export default service