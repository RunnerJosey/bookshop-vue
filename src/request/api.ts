import service from "@/request/index";
import {ILoginData} from "@/type/login";
import { IGoods } from '@/type/books';
import { IRoleEdit } from '@/type/role';
import { IUserEdit } from '@/type/user';
import { ICartItemEdit } from '@/type/cartItem';

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

// 新增用户，用户注册
export function addUser(data: any) {
    return service({
        url: "/user/register",
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
    // 只传递需要更新的字段，不包含ID
    const requestData = {
        id: data.id,
        roleName: data.roleName,
        description: data.description,
        authority: data.authority
    };
    
    // 确保ID是数字类型用于URL
    const roleId = typeof data.id === 'string' ? parseInt(data.id, 10) : data.id;
    
    return service({
        url: `/role/update`,  // 在URL中包含角色ID
        method: "PUT",
        data: requestData
    }).then(res => res.data);//只返回后端数据
}

// 删除角色
export function deleteRole(idList: (number | string)[]) {
    // 确保所有ID都是数字类型
    const numericIdList = idList.map(id => 
        typeof id === 'string' ? parseInt(id, 10) : id
    );
    
    return service({
        url: "/role/delete",
        method: "DELETE",
        params: {
            idList: numericIdList.join(',')  // 将数组转换为逗号分隔的字符串
        }
    }).then(res => res.data);
}

// 购物车列表接口
export function getCartItemList(params?: { current?: number; size?: number; bookName?: string; specName?: string }) {
    return service({
        url: "/cartItem/selectPage",
        method: "GET",
        params
    })
}

// 根据id获取购物车
export function getCartItemById(id: number | string){
    return service({
        url: "/cartItem/getById",
        method: "GET",
        params: { id }
    })
}

// 新增购物车
export function addCartItem(data: any) {
    return service({
        url: "/cartItem/add",
        method: "POST",
        data
    }).then(res => res.data); // 返回后端完整对象
}

// 修改购物车
export function updateCartItem(data: ICartItemEdit ){
    return service({
        url: "/cartItem/update",
        method: "PUT",
        data
    }).then(res => res.data);//只返回后端数据
}

// 删除购物车
export function deleteCartItem(idList: (number | string)[]) {
    return service({
        url: "/cartItem/delete",
        method: "DELETE",
        params: {
            idList: idList.join(',')  // 将数组转换为逗号分隔的字符串
        }
    }).then(res => res.data);
}

// 清空购物车
export function deleteAllCartItem(idList: (number | string)[]) {
    return service({
        url: "/cartItem/deleteAll",
        method: "DELETE",
        params: {
            idList: idList.join(',')  // 将数组转换为逗号分隔的字符串
        }
    }).then(res => res.data);
}

// 订单列表接口
export function getOrderList(params?: { current?: number; size?: number; bookName?: string; orderStatus?: number }) {
    return service({
        url: "/bookOrder/selectPage",
        method: "GET",
        params
    })
}

// 根据id获取订单
export function getOrderById(id: number | string){
    return service({
        url: "/bookOrder/getById",
        method: "GET",
        params: { id }
    })
}


// 批量新增订单
export function addOrders(data: any[]) {
    return service({
        url: "/bookOrder/add",
        method: "POST",
        data
    }).then(res => res.data); // 返回后端完整对象
}

// 修改订单
export function updateOrder(data: ICartItemEdit ){
    return service({
        url: "/bookOrder/update",
        method: "PUT",
        data
    }).then(res => res.data);//只返回后端数据
}

// 删除订单
export function deleteOrder(idList: (number | string)[]) {
    return service({
        url: "/bookOrder/delete",
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

// 地址列表接口
export function getAddressList() {
    return service({
        url: "/address/list",
        method: "GET"
    })
}

// 新增收货地址
export function addAddress(data: any) {
    return service({
        url: "/address/add",
        method: "POST",
        data
    }).then(res => res.data);
}

// 修改收货地址
export function updateAddress(data: any) {
    return service({
        url: "/address/update",
        method: "PUT",
        data
    }).then(res => res.data);
}

// 删除收货地址
export function deleteAddress(id: string) {
    return service({
        url: "/address/delete",
        method: "DELETE",
        params: { id }
    }).then(res => res.data);
}
