<template>
  <mu-popup position="bottom" popupClass="modal-popup" :open="modalPopup" @close="close()">
    <mu-appbar :title="title" class="modal-popup-title">
      <mu-icon-button slot="right" icon="close" @click="close()"/>
    </mu-appbar>
    <mu-content-block class="modal-table-box">
      <OrderTable height="auto" :tableHead="tableHead" :tableData="tableData"/>
    </mu-content-block>
  </mu-popup>
</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import popup from 'muse-components/popup'
import appbar from 'muse-components/appbar'
import contentBlock from 'muse-components/contentBlock'
import iconButton from 'muse-components/iconButton'
import OrderTable from './OrderTable'

Vue.component(popup.name, popup)
Vue.component(appbar.name, appbar)
Vue.component(contentBlock.name, contentBlock)
Vue.component(iconButton.name, iconButton)
export default {
  name: 'modal',
  components: {
    OrderTable
  },
  props: {
    title: {
      type: String
    },
    showPopup: {
      type: Boolean,
      default: true
    },
    tableHead: {
      type: Array
    },
    tableData: {
      type: Array
    }
  },
  computed: {
    ...mapState([
      'modalPopup'
    ])
  },
  methods: {
    close: function () {
      this.$store.commit('hidePopup')
    }
  }
}
</script>
<style>
.modal-popup {
  max-width: 1000px;
  max-height: 800px;
  /*overflow: auto;*/
}
.modal-popup .modal-popup-title {
  color: #474a4f;
  background-color: #ffffff;
  border-bottom: 1px solid #bdbdbd;
}
.modal-popup .modal-table-box {
  padding: 0;
}
</style>
