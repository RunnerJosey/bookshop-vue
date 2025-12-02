<template>
  <router-view/>
</template>

<style lang="scss">
  *{
    margin: 0;
    padding: 0;
  }
  body,html{
    margin: 0;
    padding: 0;
  }
  
  /* 优化滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>