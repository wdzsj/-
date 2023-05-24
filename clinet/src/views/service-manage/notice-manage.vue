<template>
  <div id="CleanRecordManage" class="page-wrapper">
    <!-- 记录筛选器 -->
    <RecordSelector @onSubmit="handleSearch" type="notice" />
    <!-- 记录筛选器 -->

    <!-- 记录详情 -->
    <h1 class="main-title">公告详情</h1>
    <div class="main-card wrapper">
      <NoticeTable
        :tableData="tableData"
        @revocation="revocationNotice"
        @announce="announceNotice"
        @save="changeNotice"
        @delete="delNotice"
        @add='handleAdd'
        @refresh='fetchTableData'
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
import NoticeTable from './components/NoticeTable'
import Pagination from '@/components/Pagination'

import {
  getNotices,
  destroyNotice,
  restoreNotice,
  removeNotice,
  addNotice,
  updateNotice
} from '@/api/notice'
import { deepClone } from '@/utils'
export default {
  name: 'noticeManage',
  components: {
    RecordSelector,
    NoticeTable,
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
      // type:'notice',
    }
  },
  mounted() {
    this.fetchTableData()
  },
  methods: {
    handleSearch(datas) {
      this.datas = datas
      //  console.log(datas);
      this.current = 1
      this.searchOption = datas
      this.fetchTableData(datas)
    },
    fetchTableData() {
      const params = deepClone(this.searchOption)
      params.current = this.current
      params.limit = this.step
      getNotices(params).then(res => {
        this.tableData = res.data.notices
        this.count = res.data.totalCount
      })
    },
    handlePagination({ page, limit }) {
      this.current = page
      this.step = limit
      this.fetchTableData()
    },
    async revocationNotice(id) {
      const res = await destroyNotice(id)
    
      this.fetchTableData()
    },
    async announceNotice(id) {
      const res = await restoreNotice(id)
      this.$message.success(res ? '发布成功' : '发布失败')
      this.fetchTableData()
    },
    async changeNotice(id, noticeDate) {
      const res = await updateNotice(id, noticeDate)
      this.$message.success(res ? '保存成功' : '保存失败')
      this.fetchTableData()
    },
    async delNotice(id) {
      const res = await removeNotice(id)
      this.$message.success(res ? '删除成功' : '删除失败')

      this.fetchTableData()
    },
      async handleAdd(noticeData) {
     
      const res = await addNotice(noticeData)
     
      this.$message.success(res.data.res ? '发布成功' : '发布失败')
      this.fetchTableData()
    },
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 40px 0;
}
</style>
