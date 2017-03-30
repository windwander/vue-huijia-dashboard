<template>
  <div class="status-box" :class="[arrowPosition, direction, clickable]" @click="handleClick()">
    <mu-flat-button v-if="icon" :icon="icon" class="status-button" icon-class="status-button-icon" :label="title" :backgroundColor="backgroundColor" :color="color"/>
    <mu-flat-button v-if="!icon" class="status-button" icon-class="status-button-icon" :label="title" :backgroundColor="backgroundColor" :color="color">
      <h3 class="head-status-number">{{number}}</h3>
    </mu-flat-button>
    <div v-if="arrowPosition" class="status-arrow"></div>
  </div>
</template>
<script>
export default {
  name: 'status-box',
  props: {
    icon: {
      type: String
    },
    title: {
      type: String
    },
    number: {
      type: Number
    },
    arrowPosition: {
      type: String
    },
    direction: {
      type: String
    // },
    // color: {
    //   type: String,
    //   default: '#333'
    // },
    // backgroundColor: {
    //   type: String,
    //   default: 'rgba(255,255,255,0.9)'
    },
    clickable: {
      type: String
    }
  },
  data () {
    return {
      color: this.icon ? '#fff' : '#333',
      backgroundColor: this.icon ? '#F05B47' : 'rgba(255,255,255,0.9)'
    }
  },
  methods: {
    handleClick (e) {
      this.$emit('click', e)
    }
  }
}
</script>
<style>
.status-box {
  position: relative;
}
.status-box.top {
  margin-top: 10px;
}
.status-box.bottom {
  margin-bottom: 10px;
}
.status-box.right {
  margin-right: 10px;
}
.status-box.left {
  margin-left: 10px;
}
.status-box .status-button {
  height: 88px;
  width: 100px;
}
.status-box .status-arrow {
  content: '';
  position: absolute;
  border: 10px solid transparent;
}
.status-box.right .status-arrow {
  top: 34px;
  right: -20px;
  border-left-color: #F05B47;
}
.status-box.left .status-arrow {
  top: 34px;
  left: -20px;
  border-right-color: #F05B47;
}
.status-box.top .status-arrow {
  top: -20px;
  left: 40px;
  border-bottom-color: #F05B47;
}
.status-box.bottom .status-arrow {
  bottom: -20px;
  left: 40px;
  border-top-color: #F05B47;
}
.status-box .status-button-icon {
  font-size: 36px;
}
.status-box .mu-flat-button-wrapper {
  flex-direction: column;
}
.status-box .mu-icon {
  margin: 0;
}
.status-box .mu-flat-button-label {
  padding: 0;
}
/*.status-box {
  width: 100px;
  height: 88px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.95);
}*/
.status-box.row {
  margin-right: 2px;
}
.status-box.column {
  margin-bottom: 2px;
}
.status-box .head-status-number {
  margin: 10px 0 0 0;
  font-size: 20px;
  line-height: 24px;
  font-weight: normal;
}
.status-box.clickable .head-status-number {
  color: #F05B47;
}
/*.head-status-title {
  margin: 0;
  font-size: 14px;
  font-weight: normal;
}*/
</style>
