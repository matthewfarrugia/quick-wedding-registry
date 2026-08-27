import type { Ref } from 'vue'
import { logEvent } from './firebase'
import type { BasketItem, Gift } from './types'

export function useGiftAnalytics(basket: Ref<BasketItem[]>) {

  function logGiftSelected(gift: Gift) {
    logEvent('gift_selected', { gift_name: gift.name, amount: gift.amount })
  }

  function logGiftRemoved(gift: Gift) {
    const item = basket.value.find(item => item.giftname === gift.name)
    logEvent('gift_removed', { gift_name: gift.name, amount: gift.amount, contribution: item?.contribution ?? 0 })
  }

  function logContributionUpdated(gift: Gift, contribution: number) {
    logEvent('contribution_updated', { gift_name: gift.name, amount: gift.amount, contribution })
  }

  function logGiftCheckedOut(giftName: string) {
    const item = basket.value.find(item => item.giftname === giftName)
    logEvent('gift_checked_out', { gift_name: giftName, contribution: item?.contribution })
  }

  function logCheckout(method: 'monzo' | 'paypal' = 'paypal') {
    const totalContribution = basket.value.reduce((total, item) => total + item.contribution, 0)
    logEvent('checkout', { total_contribution: totalContribution, method })
  }

  return { 
    logGiftSelected,
    logGiftRemoved,
    logContributionUpdated,
    logGiftCheckedOut,
    logCheckout
  }
}