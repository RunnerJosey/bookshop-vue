// 收货地址接口
export interface IAddress {
    id: string;           // 地址ID
    consigneeName: string; // 收件人
    consigneePhone: string; // 手机号
    address: string;      // 收货地址
    isDefault: number;    // 是否默认地址（1=是，0=否）
    tag: string;          // 地址标签
    createTime: string;   // 创建时间
    updateTime: string;   // 更新时间
}

// 收货地址查询接口
export interface IQueryAddress {
    consigneeName?: string; // 收件人查询条件
    consigneePhone?: string; // 手机号查询条件
}

// 收货地址编辑接口
export interface IAddressEdit {
    id?: string;          // 地址ID（编辑时使用）
    consigneeName: string; // 收件人
    consigneePhone: string; // 手机号
    address: string;      // 收货地址
    isDefault: number;    // 是否默认地址（1=是，0=否）
    tag: string;          // 地址标签
}

// 收货地址新增接口
export interface IAddressAdd {
    consigneeName: string; // 收件人
    consigneePhone: string; // 手机号
    address: string;      // 收货地址
    isDefault: number;    // 是否默认地址（1=是，0=否）
    tag: string;          // 地址标签
}