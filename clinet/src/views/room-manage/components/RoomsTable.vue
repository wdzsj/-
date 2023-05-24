<template>
  <div class="UserTable">
    <div style="float: right">
      <FileImport :data="tableData" type="room" :headers="headers" />
      <el-tooltip content="添加" placement="top">
        <el-button
          icon="el-icon-plus"
          style="width: 50px"
          type="primary"
          @click="add"
        ></el-button>
      </el-tooltip>
      <el-tooltip content="刷新" placement="top">
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection"></el-table-column>
      <!-- Add checkbox column -->
      <el-table-column label="房间号" sortable prop="number">
        <template slot-scope="scope">
          <a @click="gotoUserDetail(scope.row.id)">{{ scope.row.number }}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="buildingName"
        label="公寓楼"
        sortable
      ></el-table-column>

      <el-table-column
        label="可住人数"
        prop="peopleNum"
        sortable
      ></el-table-column>
      <el-table-column
        prop="currentPeopleNum"
        label="已住人数"
        sortable
      ></el-table-column>
      <el-table-column prop="rent" label="租金" sortable></el-table-column>
      <el-table-column prop="status" label="状态" sortable>
        <template slot-scope="scope">
          <div class="bdge-wrapp">
            <div
              :class="[
                'status-bdge-green',
                {
                  'status-bdge':
                    scope.row.peopleNum === scope.row.currentPeopleNum
                },
                { 'status-bdge-stop': scope.row.status === 0 }
              ]"
            ></div>
          </div>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="编辑">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              v-if="role === 'superAdmin'"
            >
            </el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" content="删除">
            <el-button
              icon="el-icon-delete"
              type="danger"
              @click="handleDelete(scope.row.id, scope.row.currentPeopleNum)"
              v-if="role === 'superAdmin'"
            ></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="租客管理">
            <el-button
              type="primary"
              icon="el-icon-edit-outline"
              @click="addUser(scope.row)"
              v-if="role === 'admin'"
            ></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="修改状态">
            <el-button
              type="danger"
              icon="el-icon-thumb"
              @click="updateState(scope.row)"
              v-if="role === 'admin'"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑房间"
      :visible="dialogVisible"
      @close="dialogVisible = false"
      width="400px"
    >
      <div class="dialog-body">
        <el-form
          :model="currentRow"
          v-if="currentRow && dialogVisible"
          :inline="true"
          ref="roomForm"
          label-position="top"
        >
          <el-form-item
            label="房间号"
            class="form-item-margin-bottom"
            style="width: 70px;"
          >
            <el-input v-model="currentRow.number" disabled></el-input>
          </el-form-item>

          <el-form-item
            label="状态"
            class="form-item-margin-bottom"
            style="width: 70px;"
          >
            <el-input v-model="currentRow.status"></el-input>
          </el-form-item>
          <el-form-item
            label="可住人数"
            class="form-item-margin-bottom"
            style="width: 70px;"
          >
            <el-input v-model="currentRow.peopleNum"></el-input>
          </el-form-item>

          <el-form-item
            label="租金"
            class="form-item-margin-bottom"
            style="width: 150px;"
          >
            <el-input v-model="currentRow.rent"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave(currentRow)"
          >保存</el-button
        >
      </div>
    </el-dialog>
    <!-- 创建房间对话框 -->
    <el-dialog
      title="创建房间"
      :visible="addDialogVisible"
      @close="cleanSelected"
      width="600px"
    >
      <h3 v-if="newRooms.length">新房间数{{ newRooms.length }}</h3>
      <el-table
        :data="newRooms"
        style="width:100%"
        v-if="newRooms.length"
        max-height="200px"
      >
        <el-table-column property="number" label="房间号"></el-table-column>
        <el-table-column
          property="buildingName"
          label="公寓楼"
        ></el-table-column>
        <el-table-column property="rent" label="租金"></el-table-column>
      </el-table>
      <h3>填写信息</h3>
      <div class="dialog-body">
        <GroupSelector v-model="selectorData" />
        <el-form
          :model="selectorData"
          :inline="true"
          ref="roomForm"
          style="margin-top:20px"
          v-if="addDialogVisible"
        >
          <el-form-item label="可住人数" prop="peopleNum">
            <el-input
              v-model="selectorData.peopleNum"
              placeholder="请输入"
            ></el-input>
          </el-form-item>

          <el-form-item label="租金" prop="rent">
            <el-input
              v-model="selectorData.rent"
              placeholder="请输入"
            ></el-input>
          </el-form-item>

          <el-form-item label="数量" required prop="roomCount">
            <el-input-number
              v-model="selectorData.roomCount"
              :min="1"
              :max="10"
              size="small"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="cleanSelected">取消</el-button>
        <el-button
          type="primary"
          @click="handleAddRoom()"
          :disabled="selectorData.floorId === null"
          >创建</el-button
        >
      </div>
    </el-dialog>
    <!-- 添加租客 -->
    <el-dialog
      title="添加租客"
      :visible.sync="addUserDialogVisible"
      width="700px"
      class="cleaner-dialog"
    >
      <div>
        <h3>当前房间</h3>
        <el-table :data="users" style="width:100%">
          <el-table-column
            property="account"
            label="账号"
            width="100"
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
          <el-table-column
            property="phone"
            label="电话号码"
            width="150"
          ></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="danger"
                size="small"
                @click="handleRemoveUserCheck(scope.row.id)"
              >
                退租</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <h3>添加租客</h3>
        <el-form
          ref="userForm"
          :inline="true"
          :model="userForm"
          v-if="addUserDialogVisible"
        >
          <el-form-item label="账号" required prop="account">
            <el-input
              v-model="userForm.account"
              placeholder="请输入6~12位"
              style="width:142px"
            ></el-input>
          </el-form-item>
          <el-form-item label="租期" required prop="term">
            <el-input
              v-model="userForm.term"
              placeholder="月"
              style="width:60px"
            ></el-input>
          </el-form-item>
          <el-form-item label="入住时间" prop="checkeTime">
            <el-date-picker
              v-model="userForm.checkeTime"
              type="datetime"
              placeholder="选择时间"
              style="width:140px"
            ></el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleAddRoomUser"
              >添加</el-button
            >
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
  delRoomTableData,
  setRoomTableData,
  addRoomUser,
  getRoomInfo,
  addRoom
} from '@/api/room'
import { removeCheckUser, getUserInfoByIdOrAccount } from '@/api/user'
import FileImport from '@/components/Xlsx'

import GroupSelector from '@/components/GroupSelector'

export default {
  name: 'RoomsTable',
  components: {
    GroupSelector,
    FileImport
  },
  data() {
    return {
      dialogVisible: false, // 编辑框的可见性状态
      addDialogVisible: false,
      addUserDialogVisible: false,
      currentRow: {}, // 当前编辑的数据行
      currentRowArr: [],
      newRooms: [],
      buildingName: '',
      layer: '',
      number: null,
      userForm: {
        account: '',
        term: '',
        checkTime: ''
      },
      users: [],
      rent: '',
      selectedIds: [],
      selectorData: {
        buildingId: null,
        floorId: null,
        rent: null,
        peopleNum: null,
        roomCount: null
      },
      headers: ['房间号', '公寓楼', '可住人数', '租金']
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    // console.log(this.tableData);
  },
  computed: {
    role() {
      return this.$store.getters.allUserInfo.role
    }
  },
  methods: {
    gotoUserDetail(id) {
      this.$router.push({ name: 'userInfo', query: { roomId: id } })
    },
    handleSelectionChange(selectedRows) {
      this.selectedIds = selectedRows.map(row => row.id)
    },
    handleEdit(row) {
      this.currentRow = { ...row }
      this.dialogVisible = true
    },
    // 点击更新
    handleSave(currentRow) {
      const {
        number,
        buildingId,
        status,
        peopleNum,
        rent,
        floorId
      } = currentRow
      let obj = { number, buildingId, status, peopleNum, rent, floorId }
      setRoomTableData(obj, currentRow.id).then(() => {
        this.$parent.getRoomsInfo().then(() => {
          this.$message.success('修改成功')
        })
      })
    },
    handleDelete(id, currentPeopleNum) {
      // console.log(this.selectedIds);
      if (currentPeopleNum > 0) {
        this.$message.success('ID为' + id + '的房间现住人数不为空，不可删除')
        return false
      }
      if (!this.selectedIds.length) {
        this.$refs.table.toggleRowSelection(row)
      }

      this.$confirm(`确认要删除吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delRoomTableData(this.selectedIds).then(() => {
          this.$parent.getRoomsInfo().then(() => {
            this.$message.success('删除成功')
          })
        })
      })
    },
    handleAddRoom() {
      addRoom(this.selectorData).then(res => {
        const { newRooms } = res.data
        this.newRooms = newRooms
        // this.buildingName=buildingName
        this.$parent.getRoomsInfo().then(() => {
          this.$message.success('添加成功')
        })
      })
    },
    add() {
      this.addDialogVisible = true
    },
    refresh() {
      this.$parent.getRoomsInfo()
    },
    cleanSelected() {
      this.roomForm = {}
      this.currentRow = {}
      this.dialogVisible = false
      this.addDialogVisible = false
      this.addUserDialogVisible = false
    },
    async addUser(row) {
      this.currentRow = { ...row }
      const roomInfo = (await getRoomInfo(row.id)).data
      this.users = roomInfo.users
      this.addUserDialogVisible = true
    },
    handleAddRoomUser() {
      const type = 'account'
      getUserInfoByIdOrAccount({ type, value: this.userForm.account }).then(
        res => {
          const sex = res.data.sex
          //  判断性别
          if (this.users[0].sex !== sex) {
            this.$message.error('该房间可住性别不为' + sex)
            return false
          }
        }
      )
      // 判断满员
      if (this.users.length === this.currentRow.peopleNum * 1) {
        this.$message.error('该房间已满人')
        return false
      }

      this.$refs.userForm.validate(valid => {
        if (valid) {
          addRoomUser(this.userForm, this.currentRow.id).then(res => {
            this.rent = res.data.rent
            getRoomInfo(this.currentRow.id).then(res => {
              this.users = res.data.users
            })
            this.$parent.getRoomsInfo()
            this.$message.success('添加成功')
          })
        } else {
          this.$message.error('账号和租期不可位空')
        }
      })
    },
    handleRemoveUserCheck(id) {
      removeCheckUser(id).then(() => {
        getRoomInfo(this.currentRow.id).then(res => {
          this.users = res.data.users
        })
        this.$parent.getRoomsInfo()
      })
    },
    updateState(row) {
      let status = row.status
      console.log(row.status)
      status === 0 ? (status = 1) : (status = 0)
      setRoomTableData({ status }, row.id).then(() => {
        this.$parent.getRoomsInfo()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
a {
  color: $color-primary;
}
.el-form-item {
  margin-bottom: 20px;
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
.dialog-body {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.status-bdge-green {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: $color-success;
}
.status-bdge {
  background-color: $color-danger;
}
.status-bdge-stop {
  background-color: $color-warning;
}
.el-form-item__label {
  font-weight: normal;
}
</style>
