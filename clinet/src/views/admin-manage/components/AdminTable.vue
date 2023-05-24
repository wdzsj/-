<template>
  <div calss="AdminTable">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="name" label="姓名"> </el-table-column>
      <el-table-column prop="account" label="工号"> </el-table-column>
      <el-table-column prop="phone" label="手机号"> </el-table-column>
      <el-table-column label="身份">
        <template slot-scope="scope">
          <span class="admin" v-if="scope.row.role === 'admin'">{{
            scope.row.role.toUpperCase()
          }}</span>
          <span class="superAdmin" v-if="scope.row.role === 'superAdmin'">{{
            scope.row.role.toUpperCase()
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="管理宿舍楼">
        <template slot-scope="scope">
          <div class="room-wrap" v-if="scope.row.role === 'admin'">
            <span v-for="building in scope.row.buildings" :key="building.id">
              {{ building.name }}
            </span>
          </div>
          <div class="all-room" v-else>
            所有宿舍
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button icon="Edit" type="primary" @click="handleEdit(scope.row)"
            >修改</el-button
          >
          <el-button
            icon="Delete"
            type="danger"
            @click="handleDelete(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑管理员"
      :visible="dialogVisible"
      @close="dialogVisible = false"
      width="550px"
      custom-class="dialog-body-custom-padding"
    >
      <el-form
        :model="currentRow"
        v-if="currentRow && dialogVisible"
        :inline="true"
      >
        <el-form-item label="姓名" class="form-item-margin-bottom">
          <el-input v-model="currentRow.name"></el-input>
        </el-form-item>
        <el-form-item label="工号" class="form-item-margin-bottom">
          <el-input v-model="currentRow.account"></el-input>
        </el-form-item>
        <el-form-item label="手机" class="form-item-margin-bottom">
          <el-input v-model="currentRow.phone"></el-input>
        </el-form-item>
        <el-form-item label="身份" class="form-item-margin-bottom">
          <el-select v-model="currentRow.role" size='small'>
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="超级管理员" value="superAdmin"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave(currentRow)"
          >保存</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { setAdminTableData, delAdminTableData } from '../../../api/user'

export default {
  name: 'AdminTable',
  data() {
    return {
      dialogVisible: false, // 编辑框的可见性状态
      currentRow: null, // 当前编辑的数据行
      buildingsName: []
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    currentRow: {
      //监视对象
      deep: true,
      handler(currentRow) {
        let arr = []
        currentRow.buildings.forEach(item => {
          arr.push(item.name)
          this.buildingsName = arr.join(' ')
        })
      }
    }
  },
  methods: {
    handleEdit(row) {
      this.currentRow = { ...row }
      //  console.log(row);
      this.dialogVisible = true
    },
    handleSave(currentRow) {
      let obj = {}

      ;(obj.name = currentRow.name),
        (obj.id = currentRow.id),
        (obj.phone = currentRow.phone),
        (obj.role = currentRow.role)

      setAdminTableData(obj).then(() => {
        this.$parent.fetchAdminTableData().then(() => {
          this.$message.success('更改成功')
        })
      })
    },
    handleDelete(id) {
      // console.log(id);
      delAdminTableData(id).then(() => {
        this.$parent.fetchAdminTableData().then(() => {
          this.$message.success('删除成功')
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.AdminTable label {
  text-align: center;
}
.admin {
  color: $color-primary;
}
.superAdmin {
  color: $color-origin;
}
.room-wrap {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
  span {
    display: block;
    margin: 5px 10px;
  }
}
.all-room {
  color: rgba($color: #000000, $alpha: 0.3);
}
.form-item-margin-bottom {
  margin-bottom: 20px;
}
.el-form-item {
  margin-bottom: 20px;
}
.dialog-body-custom-padding {
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 15px;
  padding-right: 15px;
}
</style>
