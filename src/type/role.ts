// 角色接口
export interface IRole{
    role: number,  // 角色id
    roleName: string  // 角色名称
}

// 有权限的角色接口
export interface IRoleWithAuth{
    roleName: string,
    roleId: number,
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
    roleName: string
}

// 角色编辑接口
export interface IRoleEdit {
    roleName: string,
    roleId: number,
    authority: []
}

// 展示角色数据
export class RolePages{
    selected_data: IQueryRole = {
        roleName: "",
        current_page: 1,
        data_count: 0,
        single_page_size: 10
    }
    
    role_list: IRoleWithAuth[] = []
    
    // 编辑角色时用到的对象
    editRole: IRoleEdit = {
        roleId: 0,
        roleName: "",
        authority: []
    }
}