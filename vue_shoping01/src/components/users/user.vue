<template>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-row :gutter="20">
      <el-col :span="7">
        <el-input placeholder="输入查询内容" v-model="queryInfo.query">
          <template #append>
            <el-button :icon="Search" @click="getUserList"></el-button>
          </template> </el-input
      ></el-col>
      <el-col :span="4">
        <el-button type="primary" @click="addDialogVisible = true"
          >添加用户</el-button
        >
      </el-col>
    </el-row>
    <el-table :data="userList" border stripe>
      <el-table-column type="index" />
      <el-table-column prop="username" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="mobile" label="电话" />
      <el-table-column prop="role_name" label="角色" />

      <el-table-column prop="mg_state" label="状态" append>
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChange(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180">
        <template v-slot="scope">
          <!-- 修改按钮 -->
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="showEditDialog(scope.row.id)"
          ></el-button>
          <el-button
            type="danger"
            :icon="Delete"
            circle
            @click="removeUserById(scope.row.id)"
          ></el-button>
          <!-- 分配角色 -->
          <el-tooltip
            effect="dark"
            content="分配角色"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="warning"
              :icon="Setting"
              circle
              @click="setRole(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:currentPage="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </el-card>

  <!-- 添加用户对话框 -->
  <el-dialog
    v-model="addDialogVisible"
    title="提示"
    width="50%"
    :before-close="addhandleClose"
    @close="addDialogClosed"
  >
    <el-form
      :model="addForm"
      :rules="addFormRules"
      ref="addFormRef"
      label-width="70px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="addForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser()">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 添加编辑对话框 -->
  <el-dialog
    v-model="editdialogVisible"
    title="提示"
    width="50%"
    :before-close="edithandleClose"
  >
    <el-form
      :model="editForm"
      :rules="editFormRules"
      ref="editFormRef"
      label-width="70px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editdialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editdUser()">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 分配角色弹出对话框 -->
  <el-dialog v-model="setRoleDialogVisible" title="分配角色" width="50%" @close="setRoleDialogClose">
    <div>
      <p>当前的用户：{{ userinfo.username }}</p>
      <p>当前的角色：{{ userinfo.role_name }}</p>
      <p>
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script >
import { ArrowRight, Search, Edit, Delete, Setting } from "@element-plus/icons";
import LoginVue from "../Login.vue";
export default {
  data() {
    return {
      ArrowRight,
      Search,
      Edit,
      Delete,
      Setting,

      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      //添加页面验证规则
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },

      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10个字符之间",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名的长度在6~15个字符之间",
            trigger: "blur",
          },
        ],
        email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
        mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
      },

      editForm: {
        username: "",
        email: "",
        mobile: "",
      },
      editFormRules: {
        email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
        mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editdialogVisible: false,
      rolesList: [],
      setRoleDialogVisible: false,
      // 需要分配角色的用户信息
      userinfo: {},

      //所有角色数据课表
      rolesList: [],
      //所选中的id值
      selectedRoleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      // console.log(res);
      if (res.meta.status !== 200)
        return this.message.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听
    async userStateChange(userinfo) {
      console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新状态失败");
      } else {
        return this.$message.success("更新状态成功");
      }
    },
    //删除按钮功能实现
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此条用户将被永久删除，是否继续",
        "提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.info("删除已取消");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getUserList();
    },
    //监听用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //添加用户确定按钮事件
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        //可以发起用户请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserList();
      });
    },

    //修改用户_获取用户列表
    async showEditDialog(id) {
      console.log(id);
      this.editdialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户失败");
      }
      console.log(res);
      this.editForm = res.data;
      this.editdialogVisible = true;
    },
    //修改用户信息
    editdUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户信息失败");
        }
        //关闭对话框
        this.editdialogVisible = false;
        //获取用户信息
        this.getUserList();
        return this.$message.success("修改用户信息成功");
      });
    },
    //分配角色页面显示和隐藏
    async setRole(userinfo) {
      this.userinfo = userinfo;

      //在展示对话框前获取所有的角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      // console.log(res.data);
      this.rolesList = res.data;

      this.setRoleDialogVisible = true;
    },

    //修改当前用户的角色信息
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择你要修改的角色信息");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        { rid: this.selectedRoleId }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("角色信息分配失败");
      }
      this.$message.success("角色信息更新成功");
      this.getUserList();
      this.setRoleDialogVisible = false;
    },

    //分配角色关闭时重置数据
    setRoleDialogClose() {
      this.selectedRoleId = "";
      this.userinfo ={};
    },
  },
  components: {
    ArrowRight,
    Search,
    Edit,
    Delete,
    Setting,
  },
};
</script>

<style lang="less" scoped>
</style>
