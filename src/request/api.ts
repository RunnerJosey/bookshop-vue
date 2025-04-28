import service from "@/request/index";
import {ILoginData} from "@/type/login";

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