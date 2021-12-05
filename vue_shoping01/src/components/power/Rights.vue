<template>
    <!-- 面包屑导航区域 -->
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>权限列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
       <el-table :data="RightList" style="width: 100%" stripe :border="true">
    <el-table-column type="index" label="#" />
    <el-table-column prop="authName" label="权限名称" width="180" />
    <el-table-column prop="path" label="路经" width="180" />

  
    <el-table-column prop="level" label="权限等级" >
        <template v-slot="scope">
 <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
      
    </el-table-column>
  </el-table>
  </el-card>
</template>

<script>
export default {
data() {
    return {
        ArrowRight,
RightList:[]
    }

},
//方法区
methods: {
   async getRightList(){
       const {data: res}=await this.$http.get("rights/list")
       if(res.meta.status !==200){
         return this.$message.error("获取权限列表失败");
       }
       console.log(res.data);

       this.RightList=res.data
    }
},
created(){
    this.getRightList()
}
}
import { ArrowRight } from '@element-plus/icons'
</script>
<style lang="less" scoped>

</style>