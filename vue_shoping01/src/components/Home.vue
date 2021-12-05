<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '60px':'200px'" >
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 菜单栏 -->
        <el-menu
          active-text-color="#5a91ea"
          background-color="#545c64"
          class="el-menu-vertical-demo"
          text-color="#fff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
           :router="true"
          :default-active="activepath"
        >
          <!-- 一级菜单 -->
          <el-sub-menu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
           
          >
            <!-- 以及菜单模版区域 -->
            <template #title>
              <!-- 图标模块 -->
             <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
             <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subietm.path + ''"
              v-for="subietm in item.children"
              :key="subietm.id"
              @click="saveNavState(subietm.path + '')"
            >
              <template #title>
                <!-- 图标模块 -->
                <el-icon><icon-menu /></el-icon>
               
                <span>{{ subietm.authName }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main><router-view></router-view></el-main>
    </el-container>
  </el-container>
</template>

<script>
import {
  Location,
  Document,
  Menu as IconMenu,
  Setting,
} from "@element-plus/icons"
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //是否折叠
      isCollapse:false,
      //当前被激活的链接
      activepath:""
    }
  },
  created() {
    this.getMenuList();
    this.activepath=window.sessionStorage.getItem("activepath")
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$http.error(res.data.msg);
      this.menulist = res.data;
      console.log(res);
    },
    toggleCollapse(){
this.isCollapse= !this.isCollapse
    },
    //链接激活状态
    saveNavState(activepath){
      window.sessionStorage.setItem("activepath",activepath)
      this.activepath=activepath
    }
  },
  components: {
    Location,
    Document,
    Setting,
    IconMenu
  },
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #393d3f;
}
.el-aside {
  background-color: #333742;
}
.el-menu{
  border-right: none;
}
.iconfont{
  margin-right: 20px;
}
.toggle-button{
   background-color: #4a5064;
   font-size: 12px;
   line-height: 24px;
   color: #fff;
   text-align: center;
   letter-spacing: 0.2em;
   cursor: pointer;
}
</style>