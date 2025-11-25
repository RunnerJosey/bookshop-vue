<template>
  <div>
    <el-form :inline="true" :model="selected_data" class="search-form">
      <el-form-item label="角色名称">
        <el-input v-model="selected_data.roleName" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearchRole">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onAddRole">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="showedDataList.compDataList" border style="width: 100%">
      <el-table-column prop="serialNumber" label="编号" width="180" />
      <el-table-column prop="roleName" label="角色名称" width="180" />
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onEditRole(scope.row)" style="margin-right: 5px;">修改</el-button>
          <el-button type="danger" size="small" @click="onDeleteRole(scope.row.roleId)">删除</el-button>
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

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="editRole" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRole.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs, ref, computed} from 'vue';
import {addRole, deleteRole, getRoleList, updateRole} from "@/request/api";
import {IRoleWithAuth, RolePages} from "@/type/role";
import {ElMessage, ElMessageBox, FormInstance} from "element-plus";
import {useRouter} from "vue-router";

export default defineComponent({
  setup () {
    const role_data = reactive(new RolePages())
    const router = useRouter()
    const roleFormRef = ref<FormInstance>();
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const dialogTitle = computed(() => isEditMode.value ? '编辑角色' : '新增角色');

    // 表单验证规则
    const roleRules = {
      roleName: [
        { required: true, message: '请输入角色名称', trigger: 'blur' }
      ]
    };

    onMounted(() => {
      p_getRoleList();
    })

    // 获取全部角色数据
    const p_getRoleList = () => {
      getRoleList({
        current: role_data.selected_data.current_page,
        size: role_data.selected_data.single_page_size
      }).then((res: any) => {
        // 适配新的数据结构 {code: 200, data: {records: [...], ...}, message: "success"}
        if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
          role_data.role_list = res.data.records;
          role_data.selected_data.data_count = res.data.total;
        } else {
          console.error("API 数据格式不正确:", res);
          role_data.role_list = [];
          role_data.selected_data.data_count = 0;
          ElMessage.error('获取角色数据失败');
        }
      }).catch(error => {
        console.error('获取角色列表失败:', error);
        role_data.role_list = [];
        role_data.selected_data.data_count = 0;
        ElMessage.error('获取角色数据失败');
      });
    }

    // 计算属性, 切割出实际上需要展示的数据，并添加序号
    const showedDataList = reactive({
      compDataList: computed(() => {
        return role_data.role_list.map((item, index) => {
          return {
            ...item,
            serialNumber: (role_data.selected_data.current_page - 1) * role_data.selected_data.single_page_size + index + 1
          };
        });
      })
    });

    // 分页相关方法
    const currentChange = (page: number) => {
      role_data.selected_data.current_page = page;
      p_getRoleList();
    };

    const sizeChange = (page_size: number) => {
      role_data.selected_data.single_page_size = page_size;
      role_data.selected_data.current_page = 1;
      p_getRoleList();
    };

    // 查询角色
    const onSearchRole = () => {
      // 重置到第一页
      role_data.selected_data.current_page = 1;
      p_getRoleList();
    };

    // 新增角色
    const onAddRole = () => {
      isEditMode.value = false;
      // 重置表单数据
      role_data.editRole = {
        roleId: 0,
        roleName: "",
        authority: []
      };
      dialogVisible.value = true;
    };

    // 编辑角色
    const onEditRole = (row: IRoleWithAuth) => {
      isEditMode.value = true;
      role_data.editRole = {
        roleId: row.roleId,
        roleName: row.roleName,
        authority: row.authority
      };
      dialogVisible.value = true;
    };

    // 删除角色
    const onDeleteRole = (id: number) => {
      ElMessageBox.confirm(
        '确定要删除这个角色吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await deleteRole([id]);
          ElMessage.success('删除成功');
          p_getRoleList(); // 重新加载角色列表
        } catch (error: any) {
          console.error('删除角色失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 提交角色表单
    const submitRoleForm = async () => {
      if (!roleFormRef.value) return;
      await roleFormRef.value.validate(async (valid) => {
        if (valid) {
          if (isEditMode.value) {
            // 编辑模式
            try {
              await updateRole(role_data.editRole);
              ElMessage.success('角色更新成功');
              p_getRoleList(); // 重新加载角色列表
            } catch (error: any) {
              console.error('更新角色失败:', error);
              ElMessage.error('更新角色失败: ' + (error.message || '未知错误'));
            }
          } else {
            // 新增模式
            try {
              await addRole(role_data.editRole);
              ElMessage.success('角色添加成功');
              p_getRoleList(); // 重新加载角色列表
            } catch (error: any) {
              console.error('添加角色失败:', error);
              ElMessage.error('添加角色失败: ' + (error.message || '未知错误'));
            }
          }
          
          dialogVisible.value = false;
          ElMessage.success(isEditMode.value ? '更新成功' : '新增成功');
        } else {
          ElMessage.warning('请填写必填项');
        }
      });
    };

    // 处理弹窗关闭
    const handleDialogClose = () => {
      if (roleFormRef.value) {
        roleFormRef.value.resetFields();
      }
    };

    // 修改权限
    const onChangeRole = (row: IRoleWithAuth) => {
      console.log(row)
      router.push({
        name: "AuthorityView",
        params: {
          id: row.roleId,
          authority: row.authority
        }
      })
    }

    return {
      ...toRefs(role_data),
      roleRules,
      roleFormRef,
      dialogVisible,
      isEditMode,
      dialogTitle,
      showedDataList,
      onSearchRole,
      onAddRole,
      onEditRole,
      onDeleteRole,
      submitRoleForm,
      handleDialogClose,
      onChangeRole,
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