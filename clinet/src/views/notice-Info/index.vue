<template>
  <div id="notice-card">
    <h1 class="main-title">公告栏</h1>
    <div class="wrapper">
      <span class="dot"></span>
      <span class="dot dot1"></span>
      <span class="dot dot2"></span>
      <el-carousel :interval="3000" arrow="none" class="carousel-wrapper">
        <el-carousel-item
          v-for="(notice, index) in notices.slice(0, 5)"
          :key="index"
          class="notice"
        >
          <el-card class="notice-card">
            <div slot="header" class="notice-header">
              <h2 class="notice-title">{{ notice.title }}</h2>
            </div>
            <div class="notice-content">
              <h3>{{ notice.content }}</h3>
            </div>
            <p class="notice-userName">发布者：{{ notice.userName }}</p>
            <p class="notice-date">
              发布日期：{{
                notice.createdAt | formatDate('YYYY年MM月DD日 HH:mm')
              }}
            </p>
          </el-card>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 分割 -->
    <div class="top-wrapper" style="position: relative;">
      <el-skeleton :rows="6" animated />
      <div
        class="wrapper"
        style="position: absolute; top: 0; right: 0;width: 500px;height:400px;"
      >
        <el-button
          @click="showCalendar = !showCalendar"
          type="primary"
          style="float:right"
        >
          {{ showCalendar ? '收起' : '日历' }}
        </el-button>
        <el-calendar v-if="showCalendar" v-model="value"></el-calendar>
      </div>
    </div>

    <!-- 历史公告 -->
    <h1 class="main-title">历史公告</h1>
    <div class="botttom-wrapper ">
      <el-collapse v-model="activeName" accordion :value="false">
        <template v-for="(notice, index) in notices.slice(5)">
          <el-collapse-item
            :title="notice.title"
            :name="notice.id"
            :key="index"
          >
            <div class="past-notices">
              <el-card>
                <div class="notice-header">
                  <h2 class="notice-title">{{ notice.title }}</h2>
                  <p class="notice-userName">发布者：{{ notice.userName }}</p>
                  <p class="notice-date">
                    发布日期：{{
                      notice.createdAt | formatDate('YYYY年MM月DD日 HH:mm')
                    }}
                  </p>
                </div>
                <div class="notice-content">
                  <p>{{ notice.content }}</p>
                </div>
              </el-card>
            </div>
          </el-collapse-item>
        </template>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import NoticeInfoCard from './component/NoticeInfoCard.vue'

import Table from './component/Table'
import { getNotices } from '@/api/notice'

export default {
  name: 'noticeInfo',
  components: {
    Table,
    NoticeInfoCard
  },
  data() {
    return {
      selectorData: {
        buildingId: 1
      },
      floorsData: [],
      cleanersData: [],
      roomCleanRecords: [],
      activeName: ['1'],
      showCalendar: true,
      notices: [
        {
          id: 1,
          title: '关于劳动节放假的通知',
          userName: '教师公寓管理办公室',
          createdAt: '2023年4月20日',
          content: [
            '尊敬的教师们：',
            '根据国家规定，2023年劳动节放假时间为5月1日至5月3日，共计3天。现将相关事宜通知如下：',
            '1. 放假期间，请注意安全，注意休息，避免过度疲劳。',
            '2. 放假前，请及时完成本职工作，如有特殊情况，请提前与上级领导联系并请假。',
            '3. 放假结束后，请按时返校，并及时参加工作。',
            '祝大家节日快乐！'
          ]
        },
        {
          id: 2,
          title: '关于体育馆开放的通知',
          userName: '教师公寓管理办公室',
          createdAt: '2023年4月19日',
          content: [
            '尊敬的教师们：',
            '根据学校相关规定，体育馆将于近期对外开放。现将相关事宜通知如下：',
            '1. 开放时间为每周二、四、六的下午6:00-8:00。',
            '2. 使用前，请提前预约并领取使用凭证。',
            '3. 使用过程中，请注意安全，遵守场馆规定。',
            '敬请配合，祝健康快乐！'
          ]
        }
      ],
      deadline2: Date.now() + 1000 * 60 * 60 * 8,
      deadline3: Date.now() + 1000 * 60 * 30,
      deadline4: Date.now() + (new Date().setHours(23, 59, 59) - Date.now()),
      stop: true,
      value: new Date()
    }
  },
  computed: {},

  watch: {
    roomCleanRecords(newVal) {
      if (
        newVal.length > 0 &&
        this.$moment(newVal[0].createdAt).format('YYYY-MM-DD') ===
          this.$moment().format('YYYY-MM-DD')
      ) {
        this.btnDisable = true
      } else {
        this.btnDisable = false
      }
    }
  },
  methods: {
    handleChange(val) {
      console.log(val)
    },
    async getNoticeData() {
      this.notices = (await getNotices()).data.notices
    },

    hilarity() {
      this.$notify({
        title: '提示',
        message: '时间已到，你可知寸金难买寸光阴？',
        duration: 0
      })
    },
    clickFn() {
      this.$refs.statistic.suspend(this.stop)
      this.stop = !this.stop
    },
    add() {
      this.deadline3 = this.deadline3 + 1000 * 10
    }
  },
  mounted() {
    this.getNoticeData()

    console.log(this.activeName)
  }
}
</script>

<style lang="scss" scoped>
#notice-card {
  padding: 50px 60px 0px;
  position: relative;
  .top-wrapper {
    margin: 40px 0;
    .left-wrapper {
      border-radius: 5px;
      padding: 30px;
    }
    .right-wrapper {
      background-color: #fff;
      margin-left: 20px;
      border-radius: 5px;
      width: 100%;
      padding: 20px;
    }
  }
  .botttom-wrapper {
    margin: 40px 0;
    background-color: #fff;
    border-radius: 5px;
    padding: 20px;
  }
}
</style>
<style scoped>
.notice {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.notice-card {
  max-width: 900px;
  width: 100%;
}

.notice-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
}

.notice-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
}

.notice-userName {
  font-size: 14px;
  margin-bottom: 5px;
}

.notice-date {
  font-size: 14px;
  margin-bottom: 15px;
}

.notice-content {
  padding: 20px;
  line-height: 24px;

}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 5px;
  border-radius: 50%;
  background-color: #e84c3d;
}
.dot1 {
  background-color: #f1c40f;
}
.dot2 {
  background-color: #2ecc71;
}
</style>
