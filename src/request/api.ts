import service from "@/request/index";
import {ILoginData} from "@/type/login";
import { IGoods } from '@/type/goods';
import { IRoleEdit, IUserEdit } from '@/type/role';

// 登录接口
export function login(data: ILoginData) {
    return service({
        url: "/user/login",
        method: "POST",
        data
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

// 根据id获取数据信息
export function getBookById(id: number | string){
    return service({
        url: "/book/getById",
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
export function getUserList(params?: { current?: number; size?: number }) {
    const { current = 1, size = 10 } = params || {};
    return service({
        url: "/user/getUserList",
        method: "GET",
        params: { current, size }
    })
}

// 根据id获取用户信息
export function getUserById(id: number | string){
    return service({
        url: "/user/getById",
        method: "GET",
        params: { id }
    })
}

// 新增用户
export function addUser(data: IUserEdit) {
    return service({
        url: "/user/add",
        method: "POST",
        data
    }).then(res => res.data); // 返回后端完整对象
}

// 修改用户
export function updateUser(data: IUserEdit ){
    return service({
        url: "/user/update",
        method: "PUT",
        data
    }).then(res => res.data);//只返回后端数据
}

// 删除用户
export function deleteUser(idList: (number | string)[]) {
    return service({
        url: "/user/delete",
        method: "DELETE",
        params: {
            idList: idList.join(',')  // 将数组转换为逗号分隔的字符串
        }
    }).then(res => res.data);
}

// 角色列表接口
export function getRoleList(params?: { current?: number; size?: number }) {
    const { current = 1, size = 10 } = params || {};
    return service({
        url: "/role/getRoleList",
        method: "GET",
        params: { current, size }
    })
}

// 根据id获取用户信息
export function getRoleById(id: number | string){
    return service({
        url: "/role/getById",
        method: "GET",
        params: { id }
    })
}

// 新增角色
export function addRole(data: IRoleEdit) {
    return service({
        url: "/role/add",
        method: "POST",
        data
    }).then(res => res.data); // 返回后端完整对象
}

// 修改角色
export function updateRole(data: IRoleEdit ){
    return service({
        url: "/role/update",
        method: "PUT",
        data
    }).then(res => res.data);//只返回后端数据
}

// 删除角色
export function deleteRole(idList: (number | string)[]) {
    return service({
        url: "/role/delete",
        method: "DELETE",
        params: {
            idList: idList.join(',')  // 将数组转换为逗号分隔的字符串
        }
    }).then(res => res.data);
}

// 权限列表接口
export function getAuthorityList(){
    return service({
        url: "/getAuthorityList",
        method: "GET"
    })
}