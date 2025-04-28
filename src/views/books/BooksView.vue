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
      <el-table-column prop="id" label="编号" width="180" />
      <el-table-column prop="bookName" label="书名" width="180" />
      <el-table-column prop="introduce" label="详情" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="creater" label="创建者" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="updater" label="更新者" />
      <el-table-column prop="updateTime" label="更新时间" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
        <el-button type="primary" size="small" @click="onEditBook(scope.row.id)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background
                   layout="prev, pager, next"
                   :total="selected_data.data_count"
                   :page-size="selected_data.single_page_size"
                   @current-change="currentChange"
                   @size-change="sizeChange"
    />
  </div>
</template>

<script lang="ts">
import { getGoodsList } from '@/request/api';
import { computed, defineComponent, onMounted, reactive, toRefs, watch } from 'vue';
import { GoodsPages, IGoods, IQueryGoods } from "@/type/goods";
import { throttle } from 'lodash';
import { useRouter } from 'vue-router';
import { getBookById } from '@/request/api' // 你的API路径
import { ElForm } from 'element-plus';

export default defineComponent({
  setup() {
    const goods_data = reactive(new GoodsPages());

    // 获取全部商品数据, 因为多个地方使用,所以封装为方法
    const p_getGoodsList = () => {
      getGoodsList().then(res => {
        console.log('API Response:', res); // 添加日志 res 就是返回response
        console.log('API Response:(res.data)', res.data); // 添加日志
        if (res && res.data && Array.isArray(res.data.records)) {
          goods_data.goods_list = res.data.records.map((record: IGoods) => ({
            ...record,

          }));
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

    onMounted(() => {
      const throttledGetGoodsList = throttle(p_getGoodsList, 300);
      throttledGetGoodsList();
    });

    // 点击修改或者新增按钮时触发


    const router = useRouter()

  function onEditBook(id: number) {
    router.push({ name: 'EditBook', params: { id } })
  }

    // 点击修改或者新增按钮时触发
    const onInsertBook = () => {
      let search_res: IGoods[] = [];  // 接受查询商品的结果

      if (!Array.isArray(goods_data.goods_list)) {
        console.warn("商品列表未正确初始化");
        goods_data.goods_list = [];
      }

      if (goods_data.selected_data.title || goods_data.selected_data.introduce) {
        if (goods_data.selected_data.title) {
          search_res = goods_data.goods_list.filter((value) => {
            return value.title?.indexOf(goods_data.selected_data.title) !== -1;
          });
        } else if (goods_data.selected_data.introduce) {
          search_res = goods_data.goods_list.filter((value) => {
            return value.introduce?.indexOf(goods_data.selected_data.introduce) !== -1;
          });
        }
      } else {
        search_res = goods_data.goods_list;
      }

      goods_data.goods_list = search_res;
      goods_data.selected_data.data_count = goods_data.goods_list.length;
    };

    // 点击查询商品按钮时触发
    const onSearchGoods = () => {
      let search_res: IGoods[] = [];  // 接受查询商品的结果

      if (!Array.isArray(goods_data.goods_list)) {
        console.warn("商品列表未正确初始化");
        goods_data.goods_list = [];
      }

      if (goods_data.selected_data.title || goods_data.selected_data.introduce) {
        if (goods_data.selected_data.title) {
          search_res = goods_data.goods_list.filter((value) => {
            return value.title?.indexOf(goods_data.selected_data.title) !== -1;
          });
        } else if (goods_data.selected_data.introduce) {
          search_res = goods_data.goods_list.filter((value) => {
            return value.introduce?.indexOf(goods_data.selected_data.introduce) !== -1;
          });
        }
      } else {
        search_res = goods_data.goods_list;
      }

      goods_data.goods_list = search_res;
      goods_data.selected_data.data_count = goods_data.goods_list.length;
    };

    // 计算属性, 切割出实际上需要展示的数据
    const showedDataList = reactive({
      compDataList: computed(() => {
        if (!Array.isArray(goods_data.goods_list)) return [];
        return goods_data.goods_list.slice(
            (goods_data.selected_data.current_page - 1) * goods_data.selected_data.single_page_size,
            goods_data.selected_data.current_page * goods_data.selected_data.single_page_size
        );
      })
    });

    // 当前页改变时触发
    const currentChange = (page: number) => {
      goods_data.selected_data.current_page = page;
    };

    // 当单页数量改变时触发
    const sizeChange = (page_size: number) => {
      goods_data.selected_data.single_page_size = page_size;
    };

    // watch 监听
    watch([() => goods_data.selected_data.title, () => goods_data.selected_data.introduce], () => {
      if (goods_data.selected_data.title === "" && goods_data.selected_data.introduce === "") {
        p_getGoodsList();
      }
    });

    return {
      ...toRefs(goods_data),
      onInsertBook,
      onEditBook,
      onSearchGoods,
      currentChange,
      sizeChange,
      showedDataList
    };
  }
});
</script>

<style scoped>
.search-form {
  padding: 10px 0 0 10px;
}
</style>
