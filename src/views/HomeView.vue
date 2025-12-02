<template>
  <div class="common-layout">
    <TopNavBar/>
    <div class="main-container">
      <LeftSideBar :menu_list="need_list"/>
      <div class="content-container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TopNavBar from "@/components/TopNavBar.vue";
import LeftSideBar from "@/components/LeftSideBar.vue";
import {useRouter} from "vue-router";
export default defineComponent({
  components: {
    TopNavBar,
    LeftSideBar
  },
  setup () {
    const router = useRouter()
    const need_list = router.getRoutes().filter(v => v.meta.isShow)
    //console.log(need_list)
    return {
      need_list
    }
  }
})
</script>

<style lang="scss">
  .main-container{
    display: flex;
    margin-top: 59px;
  }
  
  .content-container {
    flex: 1;
    margin-left: 220px;
    padding: 20px;
    height: calc(100vh - 59px);
    overflow-y: auto;
  }
  
  /* 优化内容区域滚动条样式 */
  .content-container::-webkit-scrollbar {
    width: 6px;
  }

  .content-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .content-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .content-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
  }
</style>