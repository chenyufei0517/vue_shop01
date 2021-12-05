<template>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图-->
  <el-card>
    <!-- 添加角色按钮 -->
    <el-row>
      <el-col>
        <el-button type="primary">添加角色</el-button>
      </el-col>
    </el-row>
    <el-table :data="RolesList" style="width: 100%" stripe :border="true">
      <!-- 展开列代码实现 -->
      <el-table-column type="expand">
        <template v-slot="scope">
          <el-row
            :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            v-for="(item1, i1) in scope.row.children"
            :key="item1.id"
          >
            <!-- 一级菜单 -->
            <el-col :span="5">
              <el-tag closable>{{ item1.authName }}</el-tag>
              <el-icon><caret-right /></el-icon>
            </el-col>
            <!-- 二级菜单 -->
            <el-col :span="19">
              <!-- 通过for循环遍历二级权限 -->
              <el-row
                :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                v-for="(item2, i2) in item1.children"
                :key="item2.id"
              >
                <el-col :span="6">
                  <el-tag type="success" closable>{{ item2.authName }}</el-tag>
                  <el-icon><caret-right /></el-icon>
                </el-col>
                <el-col :span="18">
                  <el-tag
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    closable
                    @close="removeRolesByid(scope.row, item3.id)"
                  >
                    {{ item3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#" />
      <el-table-column prop="roleName" label="权限名称" />
      <el-table-column prop="roleDesc" label="角色描述" />
      <el-table-column p label="操作" width="300px">
        <template v-slot="scope">
          <el-button type="primary" :icon="Edit" size="mini">编辑</el-button>
          <el-button type="danger" :icon="Edit" size="mini">删除</el-button>
          <el-button
            type="warning"
            :icon="Edit"
            size="mini"
            @click="showSetRightDialog(scope.row)"
            >分配权限</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <!-- 分配权限的弹出框 -->
  <el-dialog v-model="setRightDialogVisible" title="分配权限" width="50%" @close="setRightDialogClosed">
    <el-tree
      :data="rightslist"
      :props="treeProps"
      show-checkbox
      default-expand-all
      node-key="id"
      :default-checked-keys="defKeys"
      ref="treeRef"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="allotRights"
          >确认</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      ArrowRight,
      Edit,
      RolesList: [],
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      treeProps: {
        label: "authName",
        children: "children",
      },

      //默认选择节点的默认id
      defKeys: [],
      //当前即将分配角色的id
      roleId: '',
    };
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("角色列表获取失败");
      }
      this.RolesList = res.data;
      console.log(res.data);
    },
    //删除三级角色id
    async removeRolesByid(role, rightId) {
      //提示用户是否删除用户
      const confirmResult = await this.$confirm(
        "删除当前标签，是否继续",
        "提示框",
        {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }
      ).catch((error) => error);
      console.log(confirm);
      if (confirmResult !== "confirm") {
        this.$message.info("您已取消删除");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }
      role.children = res.data;
    },
    // 分配权限列表
    async showSetRightDialog(role) {
        this.roleId=role.id
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightslist = res.data;
      console.log(this.rightslist);
      //获取递归函数
    this.getLeafKeys(role,this.defKeys);

    this.setRightDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
        //如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

    node.children.forEach((item) => this.getLeafKeys(item, arr));
    },
    setRightDialogClosed(){
        this.defKeys=[]
        
    },
   async allotRights(){
       const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
        const idStr=keys.join(",")
       const {data: res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr})
       if(res.meta.status !==200){
           return this.$message.error("更新数据失败")
           
       }
       this.$message.success("分配权限成功")
       this.getRolesList()
       this.setRightDialogVisible=false

    }
  },
  created() {
    this.getRolesList();
  },
  components: {
    CaretRight,
  },
};
import { ArrowRight, Edit, CaretRight } from "@element-plus/icons";
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
    