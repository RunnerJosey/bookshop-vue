import service from "@/request/index";
import {ILoginData} from "@/type/login";
import { IGoods } from '@/type/goods';

// 登录接口
export function login(data: ILoginData) {
    return service({
        url: "/user/login",
        method: "POST",
        data
    }).then(response => {
        console.log('Login response:', response); // 调试信息
        // 检查响应数据是否存在
        if (!response || !response.data) {
            throw new Error('Invalid response format');
        }

        // 注意：token 直接在 response.data 中，而不是 response.data.token
        const token = response.data;
        console.log('Token from response:', token); // 调试信息

        // 检查 token 是否存在且有效
        if (token && typeof token === 'string' && token.length > 0) {
            localStorage.setItem('token', token);
            console.log('Token saved to localStorage'); // 调试信息
        } else {
            console.warn('Token is missing or invalid:', token);
            throw new Error('Token not found in response');
        }
        return response;
    }).catch(error => {
        console.error('Login error:', error);
        throw error;
    });
}

// 书籍列表接口
export function getGoodsList(params?: { current?: number; size?: number }) {
    const { current = 1, size = 10 } = params || {};
    console.log('Sending request with params:', { current, size }); // 调试信息
    return service({
        url: "/book",
        method: "GET",
        params: { current, size }
    })
}

// 书籍列表接口
export function getBookById(id: number | string){
    return service({
        url: "/book",
        method: "GET",
        params: { id }
    })
}

// 书籍修改
export function updateBook(data: IGoods ){
    return service({
        url: "/book/update",
        method: "PUT",
        data
    }).then(res => res.data);//只返回后端数据
}

// 新增书籍
export function addBook(data: IGoods) {
    return service({
        url: "/book/add",
        method: "POST",
        data
    }).then(res => res.data); // 返回后端完整对象
}

// 删除书籍
export function deleteBook(idList: (number | string)[]) {
    return service({
        url: "/book/delete",
        method: "DELETE",
        params: {
            idList: idList.join(',')  // 将数组转换为逗号分隔的字符串
        }
    }).then(res => res.data);
}

// 用户列表接口
export function getUserList(){
    return service({
        url: "/getUserList",
        method: "GET"
    })
}

// 角色列表接口
export function getRoleList(){
    return service({
        url: "/getRoleList",
        method: "GET"
    })
}

// 权限列表接口
export function getAuthorityList(){
    return service({
        url: "/getAuthorityList",
        method: "GET"
    })
}