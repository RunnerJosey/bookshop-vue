<template>
  <div>
    <el-form :inline="true" :model="selected_data" class="search-form">
      <el-form-item label="用户昵称">
        <el-input v-model="selected_data.nickName" placeholder="请输入用户昵称" />
      </el-form-item>

      <el-form-item label="用户角色">
        <el-select v-model="selected_data.role" class="m-2" size="large">
          <el-option
              :key="0"
              label="全部"
              :value="0"
          />
          <el-option
              v-for="item in role_with_auth_list"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearchUser()">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onAddUser">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="showedDataList.compDataList" border style="width: 100%">
      <el-table-column prop="serialNumber" label="编号" width="60" />
      <el-table-column prop="userName" label="用户名" width="180" />
      <el-table-column prop="nickName" label="用户昵称" width="180" />
      <el-table-column prop="phone" label="手机" width="180" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="birthday" label="生日" width="180" />
      <el-table-column prop="roles" label="用户角色" >
        <template #default="scope">
          <span v-for="(role, index) in scope.row.roles" :key="index" style="margin-right: 5px;">
            {{ role }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onEditUser(scope.row)" style="margin-right: 5px;">修改</el-button>
          <el-button type="danger" size="small" @click="onDeleteUser(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="selected_data.current_page"
          v-model:page-size="selected_data.single_page_size"
          :page-sizes="[10, 20, 30, 50]"
          :total="selected_data.data_count"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="sizeChange"
          @current-change="currentChange"
      />
    </div>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <!-- 编辑用户表单 -->
      <el-form v-if="isEditMode" :model="editUser" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="nickName">
          <el-input v-model="editUser.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="editUser.nickName" placeholder="请输入用户昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="nickName">
          <el-input v-model="editUser.phone" placeholder="请输入手机"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="nickName">
          <el-input v-model="editUser.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker
              v-model="user_data.addUser.birthday"
              type="date"
              placeholder="请选择生日"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%">
          </el-date-picker>
        </el-form-item>


        <el-form-item label="用户角色">
          <el-tag
            v-for="(role, index) in editUser.roles"
            :key="index"
            closable
            @close="handleRoleClose(index)"
            style="margin-right: 10px;"
          >
            {{ role }}
          </el-tag>
          
          <!-- 角色选择下拉框 -->
          <el-select 
            v-model="selectedRole" 
            placeholder="请选择角色" 
            style="width: 200px; margin-top: 10px;"
            @change="addRole"
          >
            <el-option
              v-for="item in availableRoles"
              :key="item.roleName"
              :label="item.roleName"
              :value="item.roleName">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <!-- 新增用户表单 -->
      <el-form v-else :model="user_data.addUser" :rules="addUserRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="user_data.addUser.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="user_data.addUser.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="user_data.addUser.nickName" placeholder="请输入昵称"></el-input>
        </el-form-item>
        
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="user_data.addUser.sex">
            <el-radio label="1">男</el-radio>
            <el-radio label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="user_data.addUser.phone" placeholder="请输入电话号码"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user_data.addUser.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        
        <el-form-item label="生日" prop="birthday">
          <el-date-picker 
            v-model="user_data.addUser.birthday" 
            type="date" 
            placeholder="请选择生日" 
            format="YYYY-MM-DD" 
            value-format="YYYY-MM-DD"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs, watch, ref, computed} from 'vue';
import {addUser, deleteUser, getRoleList, getUserList} from "@/request/api";
import {updateUser} from "@/request/api";
import {IUser, UserPages, IUserEdit, IAddUser} from "@/type/user";
import { ElMessageBox, ElMessage, FormInstance } from 'element-plus';

export default defineComponent({
  setup () {
    const user_data = reactive(new UserPages())
    const userFormRef = ref<FormInstance>();
    const addFormRef = ref<FormInstance>();
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const selectedRole = ref('') // 用于角色选择
    const dialogTitle = computed(() => isEditMode.value ? '编辑用户' : '新增用户');
    
    // 计算可用角色（排除已选择的角色）
    const availableRoles = computed(() => {
      return user_data.role_with_auth_list.filter(role => 
        !user_data.editUser.roles.includes(role.roleName)
      );
    });

    // 表单验证规则
    const userRules = {
      userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      nickName: [
        { required: true, message: '请输入用户昵称', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
      ]
    };
    
    // 新增用户表单验证规则
    const addUserRules = {
      userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ],
      nickName: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
      ],
      sex: [
        { required: true, message: '请选择性别', trigger: 'change' }
      ],
      phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' }
      ],
      birthday: [
        { required: true, message: '请选择生日', trigger: 'change' }
      ]
    };

    // 添加分页相关字段到selected_data
    user_data.selected_data.current_page = 1;
    user_data.selected_data.data_count = 0;
    user_data.selected_data.single_page_size = 10;

    onMounted(() => {
      p_getUserList()  // 获取全部用户数据
      p_getRoleList()  // 获取全部角色数据
    })

    // 获取全部用户数据
    const p_getUserList = () => {
      getUserList({
        current: user_data.selected_data.current_page,
        size: user_data.selected_data.single_page_size
      }).then((res: any) => {
        // 适配新的数据结构 {code: 200, data: {records: [...], ...}, message: "success"}
        if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
          // 将ID转换为字符串以避免精度问题
          const processedRecords = res.data.records.map((record: any) => ({
            ...record,
            id: record.id.toString() // 转换为字符串
          }));
          
          user_data.user_list = processedRecords;
          user_data.selected_data.data_count = res.data.total;
        } else {
          console.error("API 数据格式不正确:", res);
          user_data.user_list = [];
          user_data.selected_data.data_count = 0;
          ElMessage.error('获取用户数据失败');
        }
      }).catch(error => {
        console.error('获取用户列表失败:', error);
        user_data.user_list = [];
        user_data.selected_data.data_count = 0;
        ElMessage.error('获取用户数据失败');
      });
    }

    // 获取全部角色数据
    const p_getRoleList = () => {
      getRoleList({
        current: user_data.selected_data.current_page,
        size: user_data.selected_data.single_page_size
      }).then((res: any) => {
        // 适配新的数据结构 {code: 200, data: {records: [...], ...}, message: "success"}
        if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
          user_data.role_with_auth_list = res.data.records;
        } else {
          console.error("API 数据格式不正确:", res);
          user_data.role_with_auth_list = [];
          ElMessage.error('获取角色数据失败');
        }
      }).catch(error => {
        console.error('获取角色列表失败:', error);
        user_data.role_with_auth_list = [];
        ElMessage.error('获取角色数据失败');
      });
    }

    // 计算属性, 切割出实际上需要展示的数据，并添加序号
    const showedDataList = reactive({
      compDataList: computed(() => {
        return user_data.user_list.map((item, index) => {
          return {
            ...item,
            serialNumber: (user_data.selected_data.current_page - 1) * user_data.selected_data.single_page_size + index + 1
          };
        });
      })
    });

    // 分页相关方法
    const currentChange = (page: number) => {
      user_data.selected_data.current_page = page;
      p_getUserList();
    };

    const sizeChange = (page_size: number) => {
      user_data.selected_data.single_page_size = page_size;
      user_data.selected_data.current_page = 1;
      p_getUserList();
    };

    // 点击查询用户按钮时触发
    const onSearchUser = () => {
      // 重置到第一页
      user_data.selected_data.current_page = 1;
      p_getUserList();
    }

    // 新增用户
    const onAddUser = () => {
      isEditMode.value = false;
      // 重置表单数据
      user_data.addUser = {
        userName: "",
        password: "",
        sex: "1",
        phone: "",
        email: "",
        birthday: "",
        nickName: ""
      };
      dialogVisible.value = true;
    };

    // 处理角色标签关闭
    const handleRoleClose = (index: number) => {
      user_data.editUser.roles.splice(index, 1);
    };
    
    // 添加角色
    const addRole = (roleName: string) => {
      if (roleName && !user_data.editUser.roles.includes(roleName)) {
        user_data.editUser.roles.push(roleName);
        selectedRole.value = ''; // 清空选择
      }
    };

    // 编辑用户
    const onEditUser = (row: IUser) => {
      isEditMode.value = true;
      user_data.editUser = {
        id: row.id,
        nickName: row.nickName,
        roles: Array.isArray(row.roles) ? [...row.roles] : [], // 安全地复制角色数组
        userName: row.userName,
        sex: row.sex || "",
        phone: row.phone || "",
        email: row.email || "",
        birthday: row.birthday || ""
      };
      dialogVisible.value = true;
    };

    // 删除用户
    const onDeleteUser = (id: number) => {
      ElMessageBox.confirm(
        '确定要删除这个用户吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          // 确保ID是数字类型
          const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
          await deleteUser([numericId]);
          ElMessage.success('删除成功');
          p_getUserList(); // 重新加载用户列表
        } catch (error: any) {
          console.error('删除用户失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 提交用户表单
    const submitUserForm = async () => {
      if (isEditMode.value) {
        // 编辑模式
        if (!userFormRef.value) return;
        await userFormRef.value.validate(async (valid) => {
          if (valid) {
            try {
              // 确保ID是数字类型
              const userData = {
                ...user_data.editUser,
                id: typeof user_data.editUser.id === 'string' 
                  ? parseInt(user_data.editUser.id, 10) 
                  : user_data.editUser.id
              };
              
              await updateUser(userData);
              ElMessage.success('用户更新成功');
              p_getUserList(); // 重新加载用户列表
            } catch (error: any) {
              console.error('更新用户失败:', error);
              ElMessage.error('更新用户失败: ' + (error.message || '未知错误'));
            }
            
            dialogVisible.value = false;
            ElMessage.success('更新成功');
          } else {
            ElMessage.warning('请填写必填项');
          }
        });
      } else {
        // 新增模式
        if (!addFormRef.value) return;
        await addFormRef.value.validate(async (valid) => {
          if (valid) {
            try {
              await addUser(user_data.addUser);
              ElMessage.success('用户添加成功');
              p_getUserList(); // 重新加载用户列表
            } catch (error: any) {
              console.error('添加用户失败:', error);
              ElMessage.error('添加用户失败: ' + (error.message || '未知错误'));
            }
            
            dialogVisible.value = false;
            ElMessage.success('新增成功');
          } else {
            ElMessage.warning('请填写必填项');
          }
        });
      }
    };

    // 处理弹窗关闭
    const handleDialogClose = () => {
      if (userFormRef.value) {
        userFormRef.value.resetFields();
      }
      if (addFormRef.value) {
        addFormRef.value.resetFields();
      }
    };

    // watch 监听
    // 监听搜索条件
    watch(
        [() => user_data.selected_data.nickName, () => user_data.selected_data.role],
        ([newNickName, newRole]) => {
          if (!newNickName && !newRole) {
            p_getUserList();
          }
        }
    )

    return {
      user_data,
      selectedRole,
      availableRoles,
      ...toRefs(user_data),
      userRules,
      addUserRules,
      userFormRef,
      addFormRef,
      dialogVisible,
      isEditMode,
      dialogTitle,
      showedDataList,
      onSearchUser,
      onAddUser,
      onEditUser,
      onDeleteUser,
      submitUserForm,
      handleDialogClose,
      handleRoleClose,
      addRole,
      currentChange,
      sizeChange
    }
  }
})
</script>

<style scoped>
.search-form{
  padding: 10px 0 0 10px;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

/* 美化分页组件样式 */
:deep(.el-pagination) {
  padding: 0;
  font-weight: normal;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
}

:deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: #f4f4f5;
  border-radius: 4px;
}

:deep(.el-pagination .el-pager li) {
  background: #f4f4f5;
  border-radius: 4px;
}

:deep(.el-pagination .el-pager li.active) {
  background-color: #409eff;
  color: #fff;
}
</style>