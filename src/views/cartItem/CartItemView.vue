<template>
  <div>
    <el-form :inline="true" :model="selected_data" class="search-form">
      <el-form-item label="书籍名称">
        <el-input v-model="selected_data.bookName" placeholder="请输入书籍名称" />
      </el-form-item>
      
      <el-form-item label="书籍规格">
        <el-input v-model="selected_data.specName" placeholder="请输入书籍规格" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearchCartItem">查询</el-button>
      </el-form-item>
    </el-form>
    
    <div style="margin-bottom: 20px;">
      <el-button color="#165DFF" @click="onAddCartItem">去结算</el-button>
    </div>

    <el-table :data="showedDataList.compDataList" border style="width: 100%">
      <el-table-column prop="serialNumber" label="编号" width="60" />
      <el-table-column prop="id" label="购物车id" width="100" v-if="false" />
      <el-table-column prop="userId" label="用户ID" width="100" v-if="false" />
      <el-table-column prop="bookName" label="书籍名称" width="150" />
      <el-table-column prop="specName" label="书籍规格" width="150" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="price" label="单价" width="100" />
      <el-table-column prop="selected" label="选中状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.selected === 1 ? 'success' : 'info'">
            {{ scope.row.selected === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addTime" label="加购时间" width="180" />
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button type="primary" size="small" @click="onEditCartItem(scope.row)" style="margin-right: 5px;">修改</el-button>
          <el-button type="danger" size="small" @click="onDeleteCartItem(scope.row.id)">删除</el-button>
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

    <!-- 新增/编辑购物车弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form
        :model="formData"
        :rules="cartItemRules"
        ref="cartItemFormRef"
        label-width="100px">
        <el-form-item label="购物车ID" prop="id" v-show="false">
        </el-form-item>
        <el-form-item label="用户ID" prop="userId" v-show="false">
          <el-input
            v-model.number="formData.userId"
            placeholder="请输入用户ID" >
          </el-input>
        </el-form-item>

        <el-form-item label="书籍SKU ID" prop="bookId" v-show="false">
          <el-input
            v-model="formData.bookId"
            placeholder="请输入书籍SKU ID">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍规格ID" prop="specId" v-show="false">
          <el-input
            v-model="formData.specId"
            placeholder="请输入书籍规格ID">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍名称" prop="bookName">
          <el-input
            v-model="formData.bookName"
            placeholder="请输入书籍名称">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍规格" prop="specName">
          <el-input
            v-model="formData.specName"
            placeholder="请输入书籍规格">
          </el-input>
        </el-form-item>

        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="formData.quantity"
            :min="1"
            controls-position="right"
            style="width: 100%">
          </el-input-number>
        </el-form-item>

        <el-form-item label="单价" prop="price" v-show="false">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%">
          </el-input-number>
        </el-form-item>

        <el-form-item label="是否选中" prop="selected">
          <el-switch
            v-model="formData.selected"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否">
          </el-switch>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCartItemForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs, ref, computed, watch} from 'vue';
import {addCartItem, deleteCartItem, getCartItemList, updateCartItem} from "@/request/api";
import {ICartItem, CartItemPages, IAddCartItem, ICartItemEdit} from "@/type/cartItem";
import { ElMessageBox, ElMessage, FormInstance } from 'element-plus';

export default defineComponent({
  setup () {
    const cartItem_data = reactive(new CartItemPages())
    const cartItemFormRef = ref<FormInstance>();
    const dialogVisible = ref(false);
    const editMode = ref(false); // false为新增，true为编辑
    const dialogTitle = computed(() => editMode.value ? '编辑购物车' : '新增购物车');
    
    // 表单数据（解决v-model不能使用三元表达式的问题）
    const formData = reactive({
      id: "",  // 添加id字段
      userId: 0,
      bookId: "",
      specId: "",
      bookName: "",
      specName: "",
      quantity: 1,
      price: 0,
      selected: 0
    });

    // 表单验证规则
    const cartItemRules = {

      bookName: [
        { required: true, message: '请输入书籍名称', trigger: 'blur' }
      ],
      specName: [
        { required: true, message: '请输入书籍规格', trigger: 'blur' }
      ]

    };

    // 添加分页相关字段到selected_data
    cartItem_data.selected_data.current_page = 1;
    cartItem_data.selected_data.data_count = 0;
    cartItem_data.selected_data.single_page_size = 10;

    onMounted(() => {
      p_getCartItemList()  // 获取全部购物车数据
    })

    // 获取全部购物车数据
    const p_getCartItemList = () => {
      getCartItemList({
        current: cartItem_data.selected_data.current_page,
        size: cartItem_data.selected_data.single_page_size,
        bookName: cartItem_data.selected_data.bookName,
        specName: cartItem_data.selected_data.specName
      }).then((res: any) => {
        // 适配新的数据结构 {code: 200, data: {records: [...], ...}, message: "success"}
        if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
          // 将ID转换为字符串以避免精度问题
          const processedRecords = res.data.records.map((record: any) => ({
            ...record,
            id: record.id.toString() // 转换为字符串
          }));
          
          cartItem_data.cartItem_list = processedRecords;
          cartItem_data.selected_data.data_count = res.data.total;
        } else {
          console.error("API 数据格式不正确:", res);
          cartItem_data.cartItem_list = [];
          cartItem_data.selected_data.data_count = 0;
          ElMessage.error('获取购物车数据失败');
        }
      }).catch(error => {
        console.error('获取购物车列表失败:', error);
        cartItem_data.cartItem_list = [];
        cartItem_data.selected_data.data_count = 0;
        ElMessage.error('获取购物车数据失败');
      });
    }

    // 计算属性, 切割出实际上需要展示的数据，并添加序号
    const showedDataList = reactive({
      compDataList: computed(() => {
        return cartItem_data.cartItem_list.map((item, index) => {
          return {
            ...item,
            serialNumber: (cartItem_data.selected_data.current_page - 1) * cartItem_data.selected_data.single_page_size + index + 1
          };
        });
      })
    });

    // 分页相关方法
    const currentChange = (page: number) => {
      cartItem_data.selected_data.current_page = page;
      p_getCartItemList();
    };

    const sizeChange = (page_size: number) => {
      cartItem_data.selected_data.single_page_size = page_size;
      cartItem_data.selected_data.current_page = 1;
      p_getCartItemList();
    };

    // 查询购物车
    const onSearchCartItem = () => {
      cartItem_data.selected_data.current_page = 1;
      p_getCartItemList();
    };

    // 新增购物车
    const onAddCartItem = () => {
      editMode.value = false;
      // 重置表单数据
      Object.assign(formData, {
        id: "",  // 重置id字段
        userId: 0,
        bookId: "",
        specId: "",
        bookName: "",
        specName: "",
        quantity: 1,
        price: 0,
        selected: 0
      });
      dialogVisible.value = true;
    };

    // 编辑购物车
    const onEditCartItem = (row: ICartItem) => {
      editMode.value = true;
      // 填充表单数据
      Object.assign(formData, {
        id: row.id,  // 添加id字段
        userId: row.userId,
        bookId: row.bookId,
        specId: row.specId,
        bookName: row.bookName,
        specName: row.specName,
        quantity: row.quantity,
        price: row.price,
        selected: row.selected
      });
      dialogVisible.value = true;
    };

    // 删除购物车
    const onDeleteCartItem = (id: string) => {
      ElMessageBox.confirm(
        '确定要删除这个购物车记录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await deleteCartItem([id]);
          ElMessage.success('删除成功');
          p_getCartItemList(); // 重新加载购物车列表
        } catch (error: any) {
          console.error('删除购物车失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 提交购物车表单
    const submitCartItemForm = async () => {
      if (!cartItemFormRef.value) return;
      await cartItemFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (editMode.value) {
              // 编辑模式
              const editData: ICartItemEdit = {
                id: formData.id,  // 确保传递id字段
                userId: formData.userId,
                bookId: formData.bookId,
                specId: formData.specId,
                bookName: formData.bookName,
                specName: formData.specName,
                quantity: formData.quantity,
                price: formData.price,
                selected: formData.selected
              };
              await updateCartItem(editData);
              ElMessage.success('购物车更新成功');
            } else {
              // 新增模式
              const addData: IAddCartItem = { 
                userId: formData.userId,
                bookId: formData.bookId,
                specId: formData.specId,
                bookName: formData.bookName,
                specName: formData.specName,
                quantity: formData.quantity,
                price: formData.price,
                selected: formData.selected
              };
              await addCartItem(addData);
              ElMessage.success('购物车添加成功');
            }
            p_getCartItemList(); // 重新加载购物车列表
            dialogVisible.value = false;
          } catch (error: any) {
            console.error('操作购物车失败:', error);
            ElMessage.error('操作失败: ' + (error.message || '未知错误'));
          }
        } else {
          ElMessage.warning('请填写必填项');
        }
      });
    };

    // 处理弹窗关闭
    const handleDialogClose = () => {
      if (cartItemFormRef.value) {
        cartItemFormRef.value.resetFields();
      }
    };

    // 监听查询条件变化
    watch(
      [() => cartItem_data.selected_data.bookName, () => cartItem_data.selected_data.specName],
      ([newBookName, newSpecName]) => {
        if (!newBookName && !newSpecName) {
          p_getCartItemList();
        }
      }
    );

    return {
      cartItem_data,
      ...toRefs(cartItem_data),
      formData,
      cartItemRules,
      cartItemFormRef,
      dialogVisible,
      editMode,
      dialogTitle,
      showedDataList,
      onSearchCartItem,
      onAddCartItem,
      onEditCartItem,
      onDeleteCartItem,
      submitCartItemForm,
      handleDialogClose,
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
::v-deep(.el-pagination) {
  padding: 0;
  font-weight: normal;
}

::v-deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
}

::v-deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

::v-deep(.el-pagination .btn-prev),
::v-deep(.el-pagination .btn-next) {
  background: #f4f4f5;
  border-radius: 4px;
}

::v-deep(.el-pagination .el-pager li) {
  background: #f4f4f5;
  border-radius: 4px;
}

::v-deep(.el-pagination .el-pager li.active) {
  background-color: #409eff;
  color: #fff;
}
</style>