import { state } from './mutations'

export const getters = {
  fullDate: function () {
    let date = state.year
    if (state.month !== '0') {
      date += '-' + state.month
    }
    if (state.date !== '0') {
      date += '-' + state.date
    }
    return date
  },
  cityAndGroup: function () {
    return {
      cityCode: state.city,
      leaderId: state.group
    }
  },
  menusArray: function () {
    let menus = {}
    state.menus.map(function (m) {
      menus[m.menu] = m.id
    })
    return menus
  }
}
