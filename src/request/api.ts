import service from "@/request/index";
import {ILoginData} from "@/type/login";
import { IGoods } from '@/type/goods';

// 登录接口
export function login(data: ILoginData) {
    return service({
        url: "/auth/login",
        method: "POST",
        data
    })
}

// 书籍列表接口
export function getGoodsList(){
    return service({
        url: "/book",
        method: "GET"
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