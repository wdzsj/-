<template>
  <el-table :data="usersData" style="width: 100%" :stripe="true">
    <el-table-column prop="name" label="姓名"></el-table-column>
    <el-table-column prop="account" label="教工号"></el-table-column>
    <el-table-column prop="phone" label="电话号"></el-table-column>
    <el-table-column prop="buildingName" label="宿舍楼名称"></el-table-column>
    <el-table-column prop="floorLayer" label="宿舍楼层"></el-table-column>
    <el-table-column prop="roomNumber" label="房间号"></el-table-column>
    <el-table-column label="入住时间">
      <template slot-scope="scope">
        <i class="el-icon-time"></i>
        <span style="margin-left: 10px">{{
          scope.row.checkTime | formatDate('YYYY-MM-DD')
        }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {}
  },
  props: {
    usersData: {
      type: Array,
      require: true
    }
  }
}
</script>

<style lang="scss" scoped></style>
