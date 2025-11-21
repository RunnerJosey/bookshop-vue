/**
 * 表单数据接口
 */
export interface ILoginData{
    userName: string
    password: string
}

export class LoginData{
    ruleForm: ILoginData = {
        userName: "",
        password: ""
    }
}