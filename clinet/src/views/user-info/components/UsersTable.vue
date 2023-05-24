<template>
  <div class="table-wrapper">
    <div class="tag">
      <el-tag @click="searchReletUser">{{ relet ? '续租' : '*' }} </el-tag>
    </div>
    <div style="float: right">
      <FileImport :data="tableData" type="user" :headers="headers" />
      <span class="export-button" @click="exportContract">导出合同</span>
      <el-tooltip content="添加" placement="top">
        <el-button
          icon="el-icon-plus"
          style="width: 50px"
          type="primary"
          @click="add"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="刷新" placement="">
        <el-button
          icon="el-icon-refresh-left"
          type="primary"
          @click="refresh"
        ></el-button>
      </el-tooltip>
    </div>
    <el-table
      ref="table"
      :data="tableData"
      style="width: 100%"
      :stripe="true"
      v-if="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection"></el-table-column>
      <!-- Add checkbox column -->
      <el-table-column label="账号">
        <template slot-scope="scope">
          <a @click="gotoUserDetail(scope.row)">{{ scope.row.account }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>

      <el-table-column prop="buildingName" label="公寓楼"></el-table-column>
      <el-table-column prop="roomNumber" label="房间号"></el-table-column>
      <el-table-column prop="phone" label="手机号码"></el-table-column>
      <el-table-column
        prop="expireDate"
        label="到期"
        sortable
      ></el-table-column>
      <el-table-column label="租期/月" prop="term" sortable></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="编辑">
            <el-button
              icon="el-icon-edit"
              type="primary"
              @click="handleEdit(scope.row)"
              v-if="role === 'superAdmin'"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="续租">
            <el-button
              icon="el-icon-sell"
              type="primary"
              @click="handleAddTerm(scope.row)"
              v-if="role === 'admin'"
            >
            </el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" content="删除">
            <el-button
              type="danger"
              @click="handleDelete(scope.row)"
              v-if="role === 'superAdmin'"
              icon="el-icon-delete"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="退租">
            <el-button
              type="danger"
              @click="handleRemoveCheckUser(scope.row.id)"
              v-if="role === 'admin'"
              icon="el-icon-sold-out"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="修改密码">
            <el-button
              type="warning"
              @click="handlePassword(scope.row)"
              v-if="role === 'admin'"
              icon="el-icon-brush"
            >
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 增加租期对话框 -->
    <el-dialog
      title="续租"
      :visible="dialogVisible"
      @close="cleanSelected"
      width="700px"
    >
      <div>
        <h3>所选租客</h3>
        <el-table
          :data="currentRowArr"
          style="width:100%"
          @selection-change="handleSelectionChangeB"
          :stripe="true"
          show-checkbox
          :selectable="row => row.term > 0"
        >
          <el-table-column type="selection" property="id"></el-table-column>
          <el-table-column
            property="account"
            label="账号"
            width="150"
          ></el-table-column>
          <el-table-column
            property="name"
            label="姓名"
            width="150"
          ></el-table-column>
          <el-table-column
            property="term"
            label="租期"
            width="100"
          ></el-table-column>
          <el-table-column property="expireDate" label="到期"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <el-button
                type="danger"
                v-if="relet && row.relet"
                @click="handleReletUser"
                >同意续租</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <h3>添加租期</h3>

        <el-form
          :model="addTermForm"
          v-if="addForm && dialogVisible"
          :inline="true"
        >
          <el-form-item label="租期">
            <el-input v-model="addTermForm.term"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="addTerm(addTermForm.term)"
              >添 加</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="cleanSelected">取消</el-button>
      </div>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      title="修改租客信息"
      :visible="editDialogVisible"
      @close="cleanSelected"
      width="550px"
    >
      <div class="dialog-body">
        <el-form :model="currentRow" :inline="true" label-position="top">
          <el-form-item label="账号" style="width: 150px;">
            <el-input v-model="currentRow.account"></el-input>
          </el-form-item>
          <el-form-item label="密码" style="width: 150px;">
            <el-input
              v-model="currentRow.password"
              placeholder="默认不修改"
            ></el-input>
          </el-form-item>
          <el-form-item label="性别" style="width: 60px;">
            <el-input v-model="currentRow.sex" placeholder="空"></el-input>
          </el-form-item>
          <el-form-item label="年龄" style="width: 60px;">
            <el-input v-model="currentRow.age" placeholder="空"></el-input>
          </el-form-item>
          <el-form-item label="租期" style="width: 60px;">
            <el-input v-model="currentRow.term" placeholder="空"></el-input>
          </el-form-item>
          <el-form-item label="手机号" style="width: 200px;">
            <el-input v-model="currentRow.phone" placeholder="空"></el-input>
          </el-form-item>
          <el-form-item label="身份证" style="width: 350px;">
            <el-input
              v-model="currentRow.identify"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="cleanSelected">取消</el-button>
        <el-button type="primary" @click="handleSave(currentRow)"
          >保存</el-button
        >
      </div>
    </el-dialog>
    <!-- 添加对话框 -->
    <el-dialog
      title="创建用户"
      :visible="addDialogVisible"
      @close="cleanSelected"
      width="600px"
      v-if="addDialogVisible"
    >
      <div v-if="role === 'admin'">
        <el-form
          :model="addForm"
          :inline="true"
          ref="addForm"
          label-position="top"
          style="max-width: 540px;"
          v-if="addDialogVisible"
        >
          <el-form-item label="姓名" required prop="name" style="width: 100px;">
            <el-input v-model="addForm.name" placeholder="真实姓名"></el-input>
          </el-form-item>

          <el-form-item
            label="账号"
            required
            prop="account"
            style="width: 150px;"
          >
            <el-input
              v-model="addForm.account"
              placeholder="请输入6~12位"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="密码"
            required
            prop="password"
            style="width: 150px;"
          >
            <el-input
              v-model="addForm.password"
              placeholder="请输入6~12位"
            ></el-input>
          </el-form-item>

          <el-form-item label="性别" required prop="sex" style="width: 60px;">
            <el-input
              v-model="addForm.sex"
              placeholder="男/女"
              style="font-size: 6px;"
            ></el-input>
          </el-form-item>

          <el-form-item label="年龄" required prop="age" style="width: 60px;">
            <el-input
              v-model="addForm.age"
              placeholder="数字"
              style="font-size: 4px;"
            ></el-input>
          </el-form-item>

          <el-form-item label="租期" required prop="term" style="width: 60px;">
            <el-input
              v-model="addForm.term"
              placeholder="数字"
              style="font-size: 4px;"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="房间ID"
            required
            prop="roomId"
            style="width: 60px;"
          >
            <el-input
              v-model="addForm.roomId"
              placeholder="数字"
              style="font-size: 7px;"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="手机号"
            required
            prop="phone"
            style="width: 150px;"
          >
            <el-input v-model="addForm.phone" placeholder="请输入"></el-input>
          </el-form-item>

          <el-form-item
            label="身份证"
            required
            prop="identify"
            style="width: 250px;"
          >
            <el-input
              v-model="addForm.identify"
              placeholder="请输入"
            ></el-input>
          </el-form-item>

          <el-form-item
            label="入住日期"
            required
            prop="checkTime"
            style="width: 150px;"
          >
            <el-date-picker
              v-model="addForm.checkTime"
              type="date"
              placeholder="请选择日期"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <h3 v-if="newUsers.length">
          已添加租户数{{ newUsers.length ? newUsers.length : '' }}
        </h3>
        <el-table
          :data="newUsers"
          style="width:100%"
          max-height="200px"
          v-if="newUsers.length"
        >
          <el-table-column
            property="account"
            label="账号"
            width="150"
          ></el-table-column>
          <el-table-column
            property="name"
            label="姓名"
            width="150"
          ></el-table-column>
          <el-table-column
            property="phone"
            label="手机号码"
            width="150"
          ></el-table-column>
          <el-table-column
            property="term"
            label="租期"
            width="100"
          ></el-table-column>
        </el-table>
        <div class="form-wrapper" style="display: flex; flex-wrap: wrap;">
          <div>
            <!-- 其他盒子的代码 -->
            <h3>填写信息</h3>

            <div
              class="selector-item"
              style="margin-top: 20px;margin-bottom: 20px;display: flex;; justify-content: space-between; gap: 10px;"
            >
              <GroupSelector v-model="newUserOptionFrom" />
              <div class="roomTypeBox">
                <span class="label">房间类型</span>
                <el-select
                  v-model="newUserOptionFrom.peopleNum"
                  placeholder="人数"
                  clearable
                  style="max-width: 100px;"
                >
                  <el-option
                    v-for="item in roomTypeData"
                    :key="item.peopleNum"
                    :label="item.peopleNum"
                    :value="item.peopleNum"
                  >
                  </el-option>
                </el-select>
                <span>可创建用户数量:{{ accountCount }}</span>
              </div>
            </div>
          </div>
          <div>
            <el-form
              ref="newUserOptionFrom"
              :inline="true"
              :model="newUserOptionFrom"
            >
              <!-- el-form 表单的代码 -->
              <el-form
                ref="newUserOptionFrom"
                :inline="true"
                :model="newUserOptionFrom"
              >
                <el-form-item label="租期" prop="term">
                  <el-input
                    v-model="newUserOptionFrom.term"
                    placeholder="请输入"
                    style="width: 60px;"
                  ></el-input>
                </el-form-item>

                <el-form-item label="账号数量" prop="n">
                  <el-input
                    v-model="newUserOptionFrom.n"
                    placeholder="请输入"
                    style="width: 60px;"
                  ></el-input>
                </el-form-item>

                <el-form-item label="入住时间" prop="checkTime">
                  <el-date-picker
                    v-model="newUserOptionFrom.checkTime"
                    type="date"
                    placeholder="请选择日期"
                    style="width: 150px;"
                  ></el-date-picker>
                </el-form-item>
              </el-form>
            </el-form>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="cleanSelected">取消</el-button>
        <el-button type="primary" @click="handleAdd()" v-if="role === 'admin'"
          >添加</el-button
        >
        <el-button type="primary" @click="handleBatchAdd()" v-else
          >批量添加</el-button
        >
      </div>
    </el-dialog>
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      :visible.sync="passwordDialogVisible"
      width="700px"
      class="cleaner-dialog"
    >
      <div>
        <h3>当前账户</h3>
        <el-table :data="currentRowArr" style="width:100%">
          <el-table-column
            property="account"
            label="账号"
            width="150"
          ></el-table-column>
          <el-table-column
            property="name"
            label="姓名"
            width="150"
          ></el-table-column>
          <el-table-column
            property="term"
            label="租期"
            width="100"
          ></el-table-column>
          <el-table-column property="expireDate" label="到期"></el-table-column>
        </el-table>
        <h3>修改密码</h3>
        <el-form
          ref="passwordForm"
          :inline="true"
          :model="passwordForm"
          v-if="passwordDialogVisible"
        >
          <el-form-item label="密码" required prop="password">
            <el-input
              v-model="passwordForm.password"
              placeholder="请输入6~12位"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpPassword">修改</el-button>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <el-button @click="cleanSelected">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  addTerm,
  removeUser,
  updateUserInfo,
  createUser,
  removeCheckUser
} from '@/api/user'
import { getRoomType } from '@/api/room'
import FileImport from '@/components/Xlsx'
import GroupSelector from '@/components/GroupSelector'
import { handleRelet, exportTemplate,getInfo } from '@/api/user'
export default {
  name: 'UsersTable',
  components: {
    GroupSelector,
    FileImport
  },
  data() {
    return {
      dialogVisible: false, // 编辑框的可见性状态
      currentRow: {}, // 当前编辑的数据行
      currentRowArr: [],
      currentRowArrB: [],
      addForm: {
        name: '',
        account: '',
        password: '',
        sex: '',
        age: '',
        identify: '',
        phone: '',
        term: null,
        roomId: null,
        checkTime: null
      },
      passwordForm: {
        id: '',
        password: ''
      },
      cleanerDialogVisible: false,
      editDialogVisible: false,
      addDialogVisible: false,
      passwordDialogVisible: false,
      newUserOptionFrom: {
        term: '',
        checkTime: '',
        n: '',
        peopleNum: null,
        buildingId: null
      },
      newUsers: [],
      selectedIds: [],
      againSelectedIds: [],
      roomTypeData: [],
      accountCount: '',
      headers: ['账号', '姓名', '房间号', '手机号码', '租期'],
      relet: false,
      addTermForm: {
        term: 12
      }
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    UserInfo: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    'newUserOptionFrom.buildingId': function(newVal) {
      let data = {}
      data.buildingId = this.newUserOptionFrom.buildingId
      getRoomType(data).then(res => {
        this.roomTypeData = res.data.rooms.filter((obj, index, array) => {
          // 找到第一个符合条件的元素，后续的相同元素将被过滤掉
          const firstIndex = array.findIndex(o => o.peopleNum === obj.peopleNum)
          // 如果当前元素是第一个符合条件的元素，则保留
          return index === firstIndex
        })
      })
    },
    'newUserOptionFrom.peopleNum': function(newVal) {
      let data = {}
      data.buildingId = this.newUserOptionFrom.buildingId
      data.peopleNum = this.newUserOptionFrom.peopleNum
      getRoomType(data).then(res => {
        this.accountCount = res.data.emptyCount
      })
    }
  },
  computed: {
    query() {
      return this.$route.query.account
    },

    role() {
      return this.$store.getters.allUserInfo.role
    }
  },
  methods: {
    async exportContract() {
      const res = (await exportTemplate()).data.url
      window.location.href = res
    },
    gotoUserDetail(row) {
      this.$emit('gotoDetail', row)
    },
    handleSelectionChange(selectedRows) {
      this.selectedIds = selectedRows.map(row => row.id)
      this.currentRowArr = selectedRows
    },
    handleSelectionChangeB(selectedRows) {
      this.againSelectedIds = selectedRows.map(row => row.id)
    },
    handleAddTerm(row) {
      if (!this.selectedIds.length) {
        this.$refs.table.toggleRowSelection(row)
      }
      if (
        !this.currentRowArr.every(
          obj => obj.term >0
        )
      ) {
       
       this.$message.success('所选数据含未在租，不可续租！')
       return false
      }

      this.dialogVisible = true
    },

    handleEdit(row) {
      this.currentRow = { password: null, ...row }
      this.editDialogVisible = true
    },
    handleSave(currentRow) {
      // console.log(currentRow)
      updateUserInfo(currentRow).then(() => {
        this.$emit('getUserInfo')
        this.$message.success('修改成功')
      })
    },
    handleDelete(row) {
      if (!this.selectedIds.length) {
        this.$refs.table.toggleRowSelection(row)
      }

      this.$confirm(`确认要删除吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeUser(this.selectedIds).then(() => {
          this.$emit('getUserInfo')
          this.$message.success('删除成功')
        })
      })
    },
    add() {
      this.addDialogVisible = true
    },
    handleAdd() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          createUser(this.addForm).then(() => {
            this.$message.success('添加成功')
            this.$emit('getUserInfo')
          })
        } else {
          this.$message.error('请填写完整信息')
        }
      })
    },
    refresh() {
      this.relet = false
      this.$emit('refresh')
    },
    addTerm(term) {
      addTerm(this.selectedIds, term * 1).then(() => {
        this.currentRowArr.forEach(obj => {
          if (this.selectedIds.includes(obj.id)) {
            obj.term += term
          }
          return obj
        })

        this.$message.success('添加成功')
      })
    },

    cleanSelected() {
      // this.selectedAdminAccount = ''
      this.addForm = {}

      this.currentRow = {}

      this.dialogVisible = false
      this.editDialogVisible = false
      this.addDialogVisible = false
      this.passwordDialogVisible = false
      this.$emit('getUserInfo')
    },
    handlePassword(row) {
      this.currentRow = { ...row }
      this.currentRowArr = [{ ...this.currentRow }]
      this.passwordDialogVisible = true
    },
    handleUpPassword() {
      this.passwordForm.id = this.currentRow.id
      console.log(this.passwordForm)
      updateUserInfo(this.passwordForm).then(() => {
        this.$emit('getUserInfo')
        this.$message.success('修改成功')
      })
    },
    handleRemoveCheckUser(id) {
      this.$confirm(`确认要退租吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeCheckUser(id).then(() => {
          this.$emit('getUserInfo')
          this.$message.success('退租成功')
        })
      })
    },
    handleBatchAdd() {
      if (
        this.newUserOptionFrom.n > this.accountCount ||
        this.newUserOptionFrom.n <= 0
      ) {
        this.$confirm(`账号数量超过可住人数，不可创建`, '提示', {
          confirmButtonText: '确定',
          type: 'warning'
        })
        return false
      }
      let obj1 = {}
      let obj2 = {}
      obj1.term = this.newUserOptionFrom.term
      obj1.checkTime = this.newUserOptionFrom.checkTime
      obj2.n = this.newUserOptionFrom.n
      obj2.peopleNum = this.newUserOptionFrom.peopleNum
      obj2.buildingId = this.newUserOptionFrom.buildingId

      createUser(obj1, obj2).then(res => {
        this.newUsers = res.data.users
        getInfo().then(()=>{})
        this.$emit('getUserInfo')
      })
    },
    searchReletUser() {
      this.relet = !this.relet
      this.$emit('searchReletUser', this.relet)
    },
    async handleReletUser() {
      const ids = this.againSelectedIds
      const res = (await handleRelet(this.againSelectedIds)).data
      if (res[0] > 0) {
        this.currentRowArr.forEach(obj => {
          if (ids.includes(obj.id)) {
            obj.relet = null
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.export-button {
  color: #409eff; /* 改变字体颜色 */
  margin-left: 10px; /* 设置左边距 */
  margin-right: 10px; /* 设置右边距 */
  cursor: pointer; /* 设置鼠标为手形 */
}

.export-button:hover {
  color: #e6a23c; /* 鼠标悬停时改变字体颜色 */
  text-decoration: underline; /* 鼠标悬停时添加下划线 */
}

.tag {
  float: left;
  cursor: pointer;
}
a {
  color: $color-primary;
}
.el-form-item {
  // margin-bottom: 20px;
  margin: 0 10px 20px;
}
.el-button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

.el-button-group .el-button {
  display: inline-block;
  white-space: nowrap;
  flex: 0 0 auto;
}
.item {
  font-size: 14px;
}
.dialog-body {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
}
</style>
