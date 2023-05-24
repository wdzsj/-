<template>
  <div id="UserInfo" class="page-wrapper">
    <!-- 选择器 -->
    <h1 class="main-title">租客查询</h1>
    <div class="wrapper">
      <el-tabs type="border-card">
        <el-tab-pane label="按账号搜索">
          <UserSearcher v-model="searchContent" />
          <el-button type="primary" @click="search(searchContent)"
            >搜索</el-button
          >
        </el-tab-pane>

        <el-tab-pane label="级联选择">
          <GroupSelector :selectorData="selectorData" />
          <el-button type="primary" @click="search()" round>搜索</el-button>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 选择器 -->

    <el-tabs type="main-card" ref="tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="租客基本信息">
        <div class="main-card ">
          <UsersTable
            :table-data="users"
            @refresh="refresh"
            @gotoDetail="gotoDetail"
            @getUserInfo="getUserInfo"
            @searchReletUser="searchReletUser"
          />
          <Pagination
            :total="count"
            :page="current"
            @pagination="handlePagination"
          />
        </div>
      </el-tab-pane>
      <!-- 详情信息 -->
      <el-tab-pane label="详细信息" name="detail">
        <div class=" userInfo-wrapper" v-if="UserInfo.id">
          <el-row :gutter="20" class="top stretch">
            <!-- 头部信息 -->
            <el-col :md="24">
              <div class="userInfo-card">
                <div class="title">用户信息</div>
                <hr />
                <el-row>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>姓名:</label>
                      <span>{{ UserInfo.name }}</span>
                    </div>
                  </el-col>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>教工号:</label>
                      <span>{{ UserInfo.account }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>性别:</label>
                      <span>{{ UserInfo.sex }}</span>
                    </div>
                  </el-col>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>年龄:</label>
                      <span>{{ UserInfo.age }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>手机号:</label>
                      <span>{{ UserInfo.phone }}</span>
                    </div>
                  </el-col>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>租期/月:</label>
                      <span>{{ UserInfo.term }}</span>
                    </div>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>身份证:</label>
                      <span>{{ UserInfo.identity }}</span>
                    </div>
                  </el-col>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>注册日期:</label>
                      <span>{{
                        $moment(UserInfo.createdAt).format('YYYY-MM-DD')
                      }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>租赁时间:</label>
                      <span
                        :style="{ color: isExpiring ? 'red' : 'inherit' }"
                        >{{
                          $moment(UserInfo.checkTime).format('YYYY/M/D') +
                            '~' +
                            UserInfo.expireDate
                        }}</span
                      >
                    </div>
                  </el-col>
                  <el-col :md="11">
                    <div class="info-item">
                      <label>租金:</label>
                      <span>{{ UserInfo.rent }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
            <!-- 底部信息 -->
            <el-col :md="24">
              <div class="roomInfo-card">
                <PanelGroup :userInfo="UserInfo" />
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="no-data-tips main-card wrapper" v-else>请选择用户</div>
      </el-tab-pane>
    </el-tabs>
    <!-- 编辑对话框 -->
  </div>
</template>

<script>
import GroupSelector from '@/components/GroupSelector'
import UserSearcher from './components/UserSearcher'
import PanelGroup from './components/PanelGroup'
import UsersTable from './components/UsersTable.vue'
import Pagination from '@/components/Pagination'

import _ from 'lodash'
import { getUserInfoByIdOrAccount, getUsers, getReletUser } from '@/api/user'
export default {
  name: 'userInfo',
  components: {
    GroupSelector,
    UserSearcher,
    PanelGroup,
    UsersTable,
    Pagination
  },
  data() {
    return {
      cleanerDialogVisible: false,
      cleanerForm: {},
      selectorData: {
        buildingId: null,
        floorId: null,
        roomId: null,
        userId: null
      },
      searchContent: '',
      UserInfo: {},
      users: [],
      currentPage: 1,
      pageSize: 10,
      total: 10,
      current: 1,
      count: 0,
      step: 10,
      isRelet: false
    }
  },
  computed: {
    isExpiring() {
      if (this.UserInfo.expireDate !== '-') {
        const oneMonth = 30 * 24 * 60 * 60 * 1000 // 毫秒
        const expireDate = new Date(this.UserInfo.expireDate).getTime()
        const now = new Date().getTime()
        return expireDate - now <= oneMonth
      } else {
        return false
      }
    }
  },
  watch: {
    '$route.query.userId': function(newVal) {
      if (newVal && this.$route.name === 'userInfo') {
        this.$refs.tabs.setCurrentName('detail')
        this.getUserInfo({ userId: newVal })
      }
    },
    '$route.query.roomId': function(newVal) {
      if (newVal && this.$route.name === 'userInfo') {
        this.getUserInfo({ roomId: newVal })
      }
    }
  },
  methods: {
    fetchUserInfo(value) {
      let type = 'account'
      getUserInfoByIdOrAccount({ type, value }).then(res => {
        this.UserInfo = res.data
        this.count = 1
      })
    },
    async getUserInfo(params = {}) {
      params.page = this.current
      params.limit = this.step
      this.isRelet ? (params.relet = this.isRelet) : null
      this.selectorData.userId
        ? Object.assign(params, { userId: this.selectorData.userId })
        : this.selectorData.roomId
        ? Object.assign(params, { roomId: this.selectorData.roomId })
        : this.selectorData.floorId
        ? Object.assign(params, { floorId: this.selectorData.floorId })
        : this.selectorData.buildingId
        ? Object.assign(params, { buildingId: this.selectorData.buildingId })
        : null
      // console.log(params)
      let { users, pageSize } = (await getUsers(params)).data
      this.users = _.cloneDeep(users)
      this.count = pageSize
      this.UserInfo = this.users[0] || {}
      // console.log(users);
    },
    async refresh() {
      let { users, pageSize } = (await getUsers()).data
      this.users = _.cloneDeep(users)
      this.count = pageSize
      this.UserInfo = this.users[0] || {}
    },
    handlePagination({ page, limit }) {
      this.current = page
      this.step = limit
      this.getUserInfo()
    },
    gotoDetail(row) {
      this.$refs.tabs.setCurrentName('detail')
      this.UserInfo = row
    },
    search(searchContent) {
      if (this.$refs.tabs.currentName === 'detail') {
        this.fetchUserInfo(searchContent)
        //  console.log(1);
      } else if (searchContent) {
        this.fetchUserInfo(searchContent)
        this.users = [this.UserInfo]
      } else {
        this.getUserInfo()
      }
    },
    async searchReletUser(val) {
      this.selectorData = {
        buildingId: null,
        floorId: null,
        roomId: null,
        userId: null
      }
      this.isRelet = val
      this.getUserInfo()
    }
  },
  mounted() {
    this.getUserInfo()
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin: 40px 0;
}
.el-tab-pane {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
}
>>> .el-tabs__content {
  padding: 40px 20px;
  width: 100%;
}

.userInfo-wrapper {
  .stretch {
    align-items: stretch;
  }
  .top {
    .roomInfo-card {
      background-color: #fff;
      padding: 40px;
      box-sizing: content-box;
    }
    .userInfo-card {
      background-color: #fff;
      padding: 30px;
      // height: 223px;
      box-sizing: content-box;
      .title {
        font-weight: bold;
        color: $color-primary;
        font-size: 22px;
        margin-bottom: 20px;
      }
      .info-item {
        margin: 10px 0;
      }
      :nth-child(3) {
        margin-top: 0px;
      }
    }
  }
  .bottom {
    .process-item {
      span {
        display: block;
        margin: 10px 0;
      }
    }
    :first-child span {
      margin-top: 0px;
    }
  }
}
</style>
