<template>
  <div class="record-table">
    <div class="table-title" v-if="title">
      <i v-if="icon" class="icon" :class="icon"></i> {{ title }}
    </div>
    <div class="table-wrapper">
      <div style="float: right">
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
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        ref="table"
      >
        <el-table-column type="selection"></el-table-column>
        <!-- Add checkbox column -->
        <el-table-column label="用户ID">
          <template slot-scope="scope">
            <a @click="gotoStudentInfo(scope.row.userId)">{{
              scope.row.userName
            }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="roomId" label="房间ID">
          <template slot-scope="scope">
            <a @click="gotoRoomInfo(scope.row.roomId)">{{
              scope.row.roomId?scope.row.roomId:'公共设施'
            }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="repairType" label="标题"> </el-table-column>
        <el-table-column prop="content" label="内容">
          <template slot-scope="{ row }">
            <div @click="toggleFullContent(row)" class="content">
              {{
                isFullContent[row.id]
                  ? row.content
                  : row.content.slice(0, 6) + '...'
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="报修时间"
          :formatter="formatCreatedAt"
          show-overflow-tooltip
        >
        </el-table-column>

        <el-table-column
          align="center"
          label="是否处理"
          width="100px"
          v-if="type !== 'clean'"
        >
          <template slot-scope="scope">
            <div class="bdge-wrapp">
              <div
                class="early-bdge"
                :class="{
                  'early-bdge-green':
                    scope.row.createdAt !== scope.row.updatedAt
                }"
              ></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作">
          <template slot-scope="{ row }">
            <a
              @click="handleStateA(row.id)"
              class="span"
              :disabled="row.createdAt == row.updatedAt"
              >处理</a
            >
            <a
              @click="handleDelete(row.id)"
              class="span"
              :disabled="row.createdAt == row.updatedAt"
              >删除</a
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--      弹窗-->
    <div>
      <el-dialog
        :visible="dialogVisible"
        title="操作"
        width="50%"
        @close="dialogVisible = false"
      >
        <el-form ref="form" :model="currentRow" label-width="120px">
         <el-form-item
  class="el-icon-thumb"
  prop="number"
  style="margin-bottom: 27px; cursor: pointer; color: primary"
>
  <a
   v-if="isPublicFacility"
    href="javascript:;"
    @click="isPublicFacility = !isPublicFacility"
  >
    公共设施
  </a>
  <a
   v-if="!isPublicFacility"
    href="javascript:;"
    @click="isPublicFacility = isPublicFacility = !isPublicFacility"
  >
    房间号
  </a>
  <el-input
    v-if="!isPublicFacility"
    v-model="currentRow.number"
    clearable
    style="width: 80px"
  ></el-input>
</el-form-item>

          <el-form-item
            label="报修类型"
            prop="title"
            style="margin-bottom: 27px"
          >
            <el-input
              v-model="currentRow.repairType"
              clearable
              style="width: 50%"
            ></el-input>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input type="textarea" v-model="currentRow.content"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRepair">提交</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordTable',
  data() {
    return {
      isFullContent: {},
      selectedIds: [],
      dialogVisible: false,
      currentRow: {
        number: ''
      },
      isPublicFacility: true
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => [
        {
          id: 0,
          account: '测试',
          role: 'student',
          name: '测试',
          phone: '123456789011',
          checkTime: '2020-02-15T14:34:55.000Z',
          createdAt: '2020-02-19T14:12:22.000Z',
          updatedAt: '2020-02-19T22:12:54.000Z',
          roomId: 1,
          roomNumber: 101,
          floorId: 1,
          floorLayer: 1,
          buildingId: 1,
          buildingName: '通天苑',
          getupProb: '0.0000',
          backProb: '0.1667',
          cleanProb: '0.1667',
          deletedAt: null,
          userId: 4,
          time: '22:12',
          date: '2020-02-19',
          early: null
        }
      ]
    },
    title: {
      type: String
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      required: true
    },
    icon: {
      type: String
    }
  },
  computed: {},
  methods: {
    gotoStudentInfo(userId) {
      this.$router.push({ name: 'userInfo', query: { userId } })
    },
    handleSelectionChange(selectedRows) {
      this.selectedIds = selectedRows.map(row => row.id)
    },
    gotoRoomInfo(roomId) {
      if(roomId){
      this.$router.push({ name: 'roomManage', query: { roomId } })
      }
    },
    formatCreatedAt(row) {
      return this.$moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss')
    },
    toggleFullContent(row) {
      this.$set(this.isFullContent, row.id, !this.isFullContent[row.id])
    },
    handleStateA(id) {
      if (!this.selectedIds.length) {
        this.selectedIds.push(id)
      }
      this.$emit('handleState', this.selectedIds)
      this.selectedIds = []
    },
    refresh() {
      this.$emit('refresh')
    },
    handleDelete(id) {
      if (!this.selectedIds.length) {
        this.selectedIds.push(id)
      }
      this.$emit('handleDelete', this.selectedIds)
      this.selectedIds = []
    },
    handleSave() {
      const { updatedAt, id, ...row } = this.currentRow
      this.$emit('add', id, row)
    },
    add() {
      this.dialogVisible = true
    },
    // 点击更新
    addRepair() {
      const { updatedAt, id, ...row } = this.currentRow
      this.$emit('add', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.span {
  cursor: pointer;
  color: #409eff;
  padding: 0 3px;
  font-size: 10px;
}
.table-title {
  background-color: #fff;
  padding: 20px;
  padding-bottom: 0px;
  font-size: 18px;
  font-weight: bold;
  color: rgba($color: #000000, $alpha: 0.5);
  display: flex;
  align-items: center;
  .icon {
    font-size: 24px;
    margin-right: 10px;
  }
}
.table-wrapper {
  padding: 20px;
  background-color: #fff;
  .bdge-wrapp {
    display: flex;
    justify-content: center;
    .early-bdge {
      height: 10px;
      width: 10px;
      border-radius: 50%;
      background-color: $color-danger;
    }
    .early-bdge-green {
      background-color: $color-success;
    }
  }
  .content {
    cursor: pointer;
  }
}
a {
  color: $color-primary;
  &:hover {
    text-decoration: underline;
  }
}
</style>
