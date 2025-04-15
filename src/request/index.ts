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
    if (token) {
        config.headers.token = token;
    }
    return config;
});

// 响应拦截
service.interceptors.response.use((response) => {
    const data = response.data;
    const code: number = data.code;
    if (code !== 200) {
        return Promise.reject(data);
    }
    return data;
}, (err) => {
    console.log(err);
    return Promise.reject(err);
});

export default service