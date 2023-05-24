<template>
  <div id="BackRecordManage" class="page-wrapper">
    <!-- 记录筛选器 -->

    <RecordSelector @onSubmit="handleSearch" type="repair" />

    <!-- 记录筛选器 -->

    <!-- 记录详情 -->
    <h1 class="main-title">报修详情</h1>
    <div class="main-card wrapper">
      <RecordTable
        :tableData="tableData"
        type="back"
        @handleState="updateTime"
        @refresh="fetchTableData"
        @handleDelete="handleDelete"
        @save="changeRepair"
        @add="handleAddRepair"
      />
      <Pagination
        :total="count"
        :page="current"
        @pagination="handlePagination"
        :hidden="tableData.length === 0"
      />
    </div>
    <!-- 记录详情 -->
  </div>
</template>

<script>
import RecordSelector from './components/RecordSelector'
import RecordTable from '@/components/RecordTable'
import Pagination from '@/components/Pagination'

import {
  getRepairs,
  updateRepair,
  removeRepair,
  handleRepair,
  addRepair} from '@/api/repair'

import { deepClone } from '@/utils'
export default {
  name: 'repairManage',
  components: {
    RecordSelector,
    RecordTable,
    Pagination
  },
  data() {
    return {
      searchOption: {},
      current: 1,
      count: 0,
      step: 10,
      tableData: [],
      datas: {}
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    handleSearch(datas) {
      this.datas = datas
      this.current = 1
      this.searchOption = datas
      this.fetchTableData(datas)
    },

    fetchTableData(obj = {}) {
   
      getRepairs({ page: this.current, limit: this.step, ...obj }).then(res => {
        this.tableData = res.data.repairs
        this.count = res.data.totalCount
       
      })
    },
    handlePagination({ page, limit }) {
      this.current = page
      this.step = limit
      this.fetchTableData()
    },
    updateTime(ids) {
     
      handleRepair(ids).then(res => {
        
        this.fetchTableData()
      })
    },
    handleDelete(ids) {
     
      removeRepair(ids).then(() => {
        this.fetchTableData()
      })
    },
    async changeRepair(id, repairDate) {
      const res = await updateRepair(id, repairDate)
      this.$message.success(res ? '保存成功' : '保存失败')
      this.fetchTableData()
    },
    async handleAddRepair(repairDate) {
      
      const res = await addRepair(repairDate)
      this.$message.success(res ? '提交成功' : '提交失败')
      this.fetchTableData()
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 40px 0;
}
.a {
  margin: 15px 0;
}
</style>
