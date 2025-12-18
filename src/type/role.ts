// 角色接口
export interface IRole{
    id: string,      // 角色id (后端实际字段)
    roleId?: string, // 角色id (前端可能使用的字段)
    roleName: string  // 角色名称
    description : string //角色描述
}

// 有权限的角色接口
export interface IRoleWithAuth{
    id: string,          // 后端返回的实际字段名
    roleId?: string,      // 前端可能使用的字段名（可选）
    roleName: string,
    description: string,
    authority: []
}

// 分页接口
export interface IPage {
    current_page: number;
    data_count: number;
    single_page_size: number;
}

// 角色查询接口
export interface IQueryRole extends IPage {
    id: string,  // 更改为id
    roleName: string,
    description: string
}

// 角色编辑接口
export interface IRoleEdit {
    id?: string,         // 后端实际使用的字段
    roleId?: string,     // 前端可能使用的字段
    roleName: string,
    description: string,
    authority: []
}

// 展示角色数据
export class RolePages{
    selected_data: IQueryRole = {
        id: "",  // 更改为id
        roleName: "",
        description: "",
        current_page: 1,
        data_count: 0,
        single_page_size: 10
    }
    
    role_list: IRoleWithAuth[] = []
    
    // 编辑角色时用到的对象
    editRole: IRoleEdit = {
        id: "",
        roleName: "",
        description: "",
        authority: []
    }
}