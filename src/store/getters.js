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
  }
}
