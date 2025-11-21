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
      <el-table-column prop="serialNumber" label="编号" width="180" />
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
  </div>
</template>

<script lang="ts">
import { getGoodsList } from '@/request/api';
import { computed, defineComponent, onMounted, reactive, toRefs, watch, ref } from 'vue';
import { GoodsPages, IGoods, IQueryGoods } from "@/type/goods";
import { throttle } from 'lodash';
import { useRouter } from 'vue-router';
import { getBookById } from '@/request/api' // 你的API路径
import { ElForm } from 'element-plus';
import { deleteBook } from '@/request/api';
import { ElMessageBox, ElMessage } from 'element-plus';
import BookEdit from './BookEdit.vue';

export default defineComponent({
  components: {
    BookEdit
  },
  setup() {
    const goods_data = reactive(new GoodsPages());
    const router = useRouter();
    const dialogVisible = ref(false);
    const bookEditRef = ref<InstanceType<typeof BookEdit> | null>(null);
    const editMode = ref(false); // false为新增，true为编辑
    const currentBookId = ref<number | null>(null);
    const dialogTitle = computed(() => editMode.value ? '编辑书籍' : '新增书籍');

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
          console.log('delete bok 返回：', res);
          if (res === true) {
            ElMessage.success('删除成功');
            p_getGoodsList(); // 重新获取列表
          } else {
            ElMessage.error(res.message || '删除失败');
          }
        } catch (error) {
          ElMessage.error('删除失败');
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
      onInsertBook,
      onEditBook,
      onDeleteBook,
      onSearchGoods,
      currentChange,
      sizeChange,
      showedDataList,
      dialogVisible,
      bookEditRef,
      editMode,
      currentBookId,
      dialogTitle,
      handleDialogClose,
      handleBookSubmitSuccess,
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
