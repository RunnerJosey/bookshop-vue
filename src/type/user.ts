import {IRole, IRoleWithAuth} from "@/type/role";

// 用户接口
export interface IUser {
    id: number,  // 用户id
    nickName: string,  // 用户昵称
    roles: string[],   // 用户角色, 可能有多个,所以是数组
    userName: string,  // 用户名
    sex: string, //性别
    phone: string,  // 电话
    email: string,  // 邮箱
    birthday: string
}

// 分页接口
export interface IPage {
    current_page: number;
    data_count: number;
    single_page_size: number;
}

// 用户查询接口
export interface IQueryUser extends IPage {
    nickName: string,  // 用户别名
    role: number  // 角色编号
}

// 用户编辑接口
export interface IUserEdit {
    id: number,  // 用户id
    nickName: string,  // 用户昵称
    roles: string[],   // 用户角色
    userName: string,  // 用户名
    sex: string,      // 性别
    phone: string,    // 电话
    email: string,    // 邮箱
    birthday: string // 生日
}

// 新增用户接口
export interface IAddUser {
    userName: string,  // 用户名
    password: string,  // 密码
    sex: string,      // 性别
    phone: string,    // 电话
    email: string,    // 邮箱
    birthday: string, // 生日
    nickName: string  // 昵称
}

// 用户具体展示数据
export class UserPages{
    // 没有做分页是因为,用户和角色数据往往比较少
    selected_data: IQueryUser = {
        nickName: "",
        role: 0,
        current_page: 1,
        data_count: 0,
        single_page_size: 10
    }
    user_list: IUser[] = []   // 用户列表
    role_with_auth_list: IRoleWithAuth[] = []   // 角色列表
    
    // 编辑用户时用到的对象
    editUser: IUserEdit = {
        id: 0,
        nickName: "",
        roles: [],
        userName: "",
        sex: "",
        phone: "",
        email: "",
        birthday: ""
    }
    
    // 新增用户时用到的对象
    addUser: IAddUser = {
        userName: "",
        password: "",
        sex: "1",
        phone: "",
        email: "",
        birthday: "",
        nickName: ""
    }
}