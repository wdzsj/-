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
        <el-table-column label="管理员">
          <template slot-scope="scope">
            <a @click="gotoUserInfo(scope.row.userId)">{{
              scope.row.userName
            }}</a>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题"> </el-table-column>
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
          label="发布时间"
          :formatter="formatCreatedAt"
          sortable
        >
        </el-table-column>

        <el-table-column align="center" label="发布状态" width="100px">
          <template slot-scope="scope">
            <div class="bdge-wrapp">
              <div
                class="early-bdge"
                :class="{
                  'early-bdge-green': scope.row.deletedAt == null
                }"
              ></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作">
          <template slot-scope="{ row }">
            <div class="action-buttons">
              <a
                class="span"
                @click="handleStateA(row)"
                :disabled="row.deletedAt === null"
                >撤销</a
              >
              <a class="span" @click="handleEdit(row)">编辑</a>
              <a
                class="span"
                @click="handleStateB(row)"
                :disabled="row.deletedAt !== null"
                >发布</a
              >
              <a class="span" @click="handleDelete(row)">删除</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!--      弹窗-->
      <div>
        <el-dialog
          :visible="dialogVisible"
          title="操作"
          width="50%"
          @close="dialogVisible = false"
        >
          <el-form ref="form" :model="currentRow" label-width="120px">
            <el-form-item label="标题" prop="title" style="margin-bottom: 27px">
              <el-input
                v-model="currentRow.title"
                clearable
                style="width: 50%"
              ></el-input>
            </el-form-item>
            <el-form-item label="内容" prop="content">
              <el-input type="textarea" v-model="currentRow.content"></el-input>
            </el-form-item>
            <el-form-item
              label="发布时间"
              prop="createdAt"
              style="margin-top: 27px"
            >
              <el-date-picker
                v-model="currentRow.createdAt"
                clearable
                placeholder="选择时间"
                type="datetime"
                format="yyyy-MM-dd HH:mm:ss"
              
              ></el-date-picker>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addNotice">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeTable',
  data() {
    return {
      isFullContent: {},
      currentRow: {},
      dialogVisible: false,
      detailDialog: null,
      selectedIds: []
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => [
        {
          id: 0,
          account: '测试',
          role: 'teacher',
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

    icon: {
      type: String
    }
  },
  computed: {},
  methods: {
    handleEdit(row) {
      this.currentRow = { ...row }
      this.dialogVisible = true
    },
    handleSelectionChange(selectedRows) {
      this.selectedIds = selectedRows.map(row => row.id)
    },
    // 点击更新
    handleSave() {
      const { updatedAt, ...row } = this.currentRow
      this.$emit('save', this.currentRow.id, row)
    },

    gotoUserInfo(userId) {
      this.$router.push({ name: 'userInfo', query: { userId } })
    },

    formatCreatedAt(row) {
      return this.$moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss')
    },
    toggleFullContent(row) {
      this.$set(this.isFullContent, row.id, !this.isFullContent[row.id])
    },
    handleStateA(row) {
      if (!this.selectedIds.length) {
        this.$refs.table.toggleRowSelection(row)
      }
      this.$emit('revocation', this.selectedIds)
    },
    handleStateB(row) {
      if (!this.selectedIds.length) {
        this.$refs.table.toggleRowSelection(row)
      }
      this.$emit('announce', this.selectedIds)
    },
    handleDelete(row) {
      if (!this.selectedIds.length) {
        this.$refs.table.toggleRowSelection(row)
      }
      this.$emit('delete', this.selectedIds)
    },
    add() {
      this.dialogVisible = true
    },
    addNotice() {
      const { updatedAt, id, ...row } = this.currentRow
      row.userId = this.$store.getters.allUserInfo.id

      this.$emit('add', row)
    },
    refresh() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  white-space: nowrap; /* 不换行 */
}
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
