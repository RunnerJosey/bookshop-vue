<template>
  <div>
    <el-form :inline="true" :model="selected_data" class="search-form">
      <el-form-item label="书名">
        <el-input v-model="selected_data.bookName" placeholder="请输入书名" />
      </el-form-item>
      <el-form-item label="书详情">
        <el-input v-model="selected_data.introduce" placeholder="请输入书籍详情" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearchGoods">查询</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onInsertBook">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="showedDataList.compDataList" border style="width: 100%">
      <el-table-column prop="serialNumber" label="编号" width="60" />
      <el-table-column prop="bookName" label="书名" width="180" />
      <el-table-column prop="introduce" label="详情" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="creater" label="创建者" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="updater" label="更新者" />
      <el-table-column prop="updateTime" label="更新时间" />
      <el-table-column label="操作" width="140">
        <template #default="scope">
        <el-button type="primary" size="small" @click="onEditBook(scope.row.id)" style="margin-right: 5px;">修改</el-button>
          <el-button type="danger" size="small" @click="onDeleteBook(scope.row.id)">删除</el-button>
          <el-button type="warning" size="small" @click="onAddToCart(scope.row)">加入购物车</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 优化分页组件 -->
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

    <!-- 新增/编辑书籍弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <BookEdit 
        ref="bookEditRef" 
        :is-dialog-mode="true" 
        :edit-mode="editMode"
        :book-id="currentBookId"
        @submit-success="handleBookSubmitSuccess" 
      />
    </el-dialog>

    <!-- 加入购物车弹窗 -->
    <el-dialog v-model="cartDialogVisible" title="加入购物车" width="500px">
      <el-form
          :model="cartFormData"
          :rules="cartItemRules"
          ref="cartItemFormRef"
          label-width="100px">
        <el-form-item label="书籍名称">
          <el-input v-model="cartFormData.bookName" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="书籍详情">
          <el-input v-model="cartFormData.introduce" disabled type="textarea"></el-input>
        </el-form-item>

        <!-- 隐藏式表单 -->
        <el-form-item label="用户ID" prop="userId"  v-show="false" >
          <el-input
              v-model.number="cartFormData.userId"
              placeholder="请输入用户ID">
          </el-input>
        </el-form-item>

        <el-form-item label="书籍SKU ID" prop="bookId"  v-show="false" >
          <el-input
              v-model="cartFormData.bookId"
              placeholder="请输入书籍SKU ID"
              disabled>
          </el-input>
        </el-form-item>

        <el-form-item label="数量" prop="quantity">
          <el-input-number
              v-model="cartFormData.quantity"
              :min="1"
              controls-position="right"
              style="width: 100%">
          </el-input-number>
        </el-form-item>

        <el-form-item label="是否选中" prop="selected"  v-show="false">
          <el-switch
              v-model="cartFormData.selected"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否">
          </el-switch>
        </el-form-item>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cartDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCartItemForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts">
import { getGoodsList, addCartItem } from '@/request/api';
import { computed, defineComponent, onMounted, reactive, toRefs, watch, ref } from 'vue';
import { GoodsPages, IGoods, IQueryGoods } from "@/type/books";
import { throttle } from 'lodash';
import { useRouter } from 'vue-router';
import { getBookById } from '@/request/api' // 你的API路径
import { ElForm, ElMessageBox, ElMessage } from 'element-plus';
import { deleteBook } from '@/request/api';
import BookEdit from './BookEdit.vue';

export default defineComponent({
  components: {
    BookEdit
  },
  setup() {
    const goods_data = reactive(new GoodsPages());
    const router = useRouter();
    const dialogVisible = ref(false);
    const cartDialogVisible = ref(false);
    const bookEditRef = ref<InstanceType<typeof BookEdit> | null>(null);
    const cartItemFormRef = ref<InstanceType<typeof ElForm> | null>(null);
    const editMode = ref(false); // false为新增，true为编辑
    const currentBookId = ref<number | null>(null);
    const dialogTitle = computed(() => editMode.value ? '编辑书籍' : '新增书籍');
    
    // 购物车表单数据
    const cartFormData = reactive({
      userId: 0,
      bookId: "",
      specId: "",
      bookName: "",
      introduce: "",
      bookSpec: "",
      quantity: 1,
      price: 0,
      selected: 0
    });

    // 表单验证规则
    const cartItemRules = {
      userId: [
        { required: true, message: '请输入用户ID', trigger: 'blur' },
        { type: 'number', message: '用户ID必须为数字', trigger: 'blur' }
      ],
      bookId: [
        { required: true, message: '请输入书籍SKU ID', trigger: 'blur' }
      ],
      specId: [
        { required: true, message: '请输入书籍规格ID', trigger: 'blur' }
      ],
      bookSpec: [
        { required: true, message: '请输入书籍规格', trigger: 'blur' }
      ],
      quantity: [
        { required: true, message: '请输入数量', trigger: 'blur' }
      ],
      price: [
        { required: true, message: '请输入单价', trigger: 'blur' }
      ]
    };

    onMounted(() => {
      p_getGoodsList();
    });

    // 搜索方法
    const onSearchGoods = () => {
      const { bookName, introduce } = goods_data.selected_data;

      if (!bookName && !introduce) {
        p_getGoodsList();
        return;
      }

      const search_res = goods_data.goods_list.filter((item: IGoods) => {
        const matchBookName = !bookName ||
            (item.bookName?.toLowerCase().includes(bookName.toLowerCase()) ?? false);
        const matchIntroduce = !introduce ||
            (item.introduce?.toLowerCase().includes(introduce.toLowerCase()) ?? false);

        return matchBookName && matchIntroduce;
      });

      goods_data.goods_list = search_res;
      goods_data.selected_data.data_count = search_res.length;
      goods_data.selected_data.current_page = 1;
    };

// 获取商品列表的方法也需要调整
    // 获取商品列表
    const p_getGoodsList = () => {
      getGoodsList({
        current: goods_data.selected_data.current_page,
        size: goods_data.selected_data.single_page_size
      }).then(res => {
        console.log('Received response:', res); // 调试信息
        if (res && res.data && Array.isArray(res.data.records)) {
          goods_data.goods_list = res.data.records;
          goods_data.selected_data.data_count = res.data.total;
        } else {
          console.error("API 数据格式不正确:", res);
          goods_data.goods_list = [];
          goods_data.selected_data.data_count = 0;
        }
      }).catch(error => {
        console.error("API 请求失败:", error);
        goods_data.goods_list = [];
        goods_data.selected_data.data_count = 0;
      });
    };


// 分页相关方法
    const currentChange = (page: number) => {
      goods_data.selected_data.current_page = page;
      console.log('Current page changed to:', page); // 调试信息
      p_getGoodsList();

    };

    const sizeChange = (page_size: number) => {
      goods_data.selected_data.single_page_size = page_size;
      goods_data.selected_data.current_page = 1; // 重置到第一页
      console.log('Page size changed to:', page_size); // 调试信息
      p_getGoodsList();
    };
    // 点击修改或者新增按钮时触发


  function onEditBook(id: number) {
    editMode.value = true;
    currentBookId.value = id;
    dialogVisible.value = true;
  }

    const onDeleteBook = (id: number) => {
      ElMessageBox.confirm(
          '确定要删除这本书吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(async () => {
        try {
          const res = await deleteBook([id]);
          console.log('delete book 返回：', res);
          if (res === true) {
            ElMessage.success('删除成功');
            p_getGoodsList(); // 重新获取列表
          } else {
            ElMessage.error(res.message || '删除失败');
          }
        } catch (error: any) {
          console.error('删除书籍失败:', error);
          ElMessage.error('删除失败: ' + (error.message || '未知错误'));
        }
      }).catch(() => {
        // 用户取消，无需处理
      });
    };

    // 点击新增按钮时触发
    const onInsertBook = () => {
      editMode.value = false;
      currentBookId.value = null;
      dialogVisible.value = true;
    };
    
    // 点击加入购物车按钮时触发
    const onAddToCart = (row: IGoods) => {
      // 填充表单数据
      cartFormData.userId = 0;
      cartFormData.bookId = row.id?.toString() || "";
      cartFormData.specId = "";
      cartFormData.bookName = row.bookName || "";
      cartFormData.introduce = row.introduce || "";
      cartFormData.bookSpec = "";
      cartFormData.quantity = 1;
      cartFormData.price = 0;
      cartFormData.selected = 0;
      
      cartDialogVisible.value = true;
    };
    
    // 提交购物车表单
    const submitCartItemForm = async () => {
      if (!cartItemFormRef.value) return;
      await cartItemFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 准备提交数据
            const cartData = {
              userId: cartFormData.userId,
              bookId: cartFormData.bookId,
              specId: cartFormData.specId,
              bookName: cartFormData.bookName,
              bookSpec: cartFormData.bookSpec,
              quantity: cartFormData.quantity,
              price: cartFormData.price,
              selected: cartFormData.selected
            };
            
            await addCartItem(cartData);
            ElMessage.success('已加入购物车');
            cartDialogVisible.value = false;
          } catch (error: any) {
            console.error('加入购物车失败:', error);
            ElMessage.error('加入购物车失败: ' + (error.message || '未知错误'));
          }
        } else {
          ElMessage.warning('请填写必填项');
        }
      });
    };

    // 处理弹窗关闭
    const handleDialogClose = () => {
      if (bookEditRef.value) {
        bookEditRef.value.resetForm();
      }
      // 重置状态
      editMode.value = false;
      currentBookId.value = null;
    };

    // 处理书籍提交成功
    const handleBookSubmitSuccess = () => {
      dialogVisible.value = false;
      p_getGoodsList(); // 重新获取列表
    };

    // 计算属性, 切割出实际上需要展示的数据，并添加序号
    const showedDataList = reactive({
      compDataList: computed(() => {
        return goods_data.goods_list.map((item, index) => {
          return {
            ...item,
            serialNumber: (goods_data.selected_data.current_page - 1) * goods_data.selected_data.single_page_size + index + 1 // 添加序号字段
          };
        });
      })
    });


    // 监听搜索条件
    watch(
        [() => goods_data.selected_data.bookName, () => goods_data.selected_data.introduce],
        ([newBookName, newIntroduce]) => {
          if (!newBookName && !newIntroduce) {
            p_getGoodsList();
          }
        }
    );



    return {
      ...toRefs(goods_data),
      cartFormData,
      cartItemRules,
      onInsertBook,
      onEditBook,
      onDeleteBook,
      onAddToCart,
      onSearchGoods,
      currentChange,
      sizeChange,
      showedDataList,
      dialogVisible,
      cartDialogVisible,
      bookEditRef,
      cartItemFormRef,
      editMode,
      currentBookId,
      dialogTitle,
      handleDialogClose,
      handleBookSubmitSuccess,
      submitCartItemForm
    };
  }
});
</script>

<style scoped>
.search-form {
  padding: 10px 0 0 10px;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 100;
}

/* 可选：美化分页组件样式 */
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
