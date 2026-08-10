<template>
  <ModalTarget group="default" >
    <ModalOverlay class="modal-overlay" />
  </ModalTarget>
  <div class="content">
    <p class="title">Laura &amp; Matt</p>
    <p class="heading">Gifts</p>
    <div class="description">
      <p>
        Living together for the past seven years means we have most traditional registry gifts, but we would very much welcome contributions towards our honeymoon and future adventures!
        <br><br>Thank you!
      </p>
      <div class="image">
        <img src="./assets/us.jpeg" alt="Laura &amp; Matt (in love)" loading="lazy" />
      </div>
    </div>
    <div class="contribution">
      <p class="contribution__text">
        <template v-if="totalAmount === 0">
          Select a gift to contribute!
        </template>
        <template v-else>
          Contribution: £{{ totalAmount }}
        </template>
      </p>
      <button v-if="totalAmount > 0" class="btn-primary" @click="handleCheckout()">Proceed to PayPal</button>
    </div>
    <div class="gifts">
      <Gift v-for="gift in gifts" :key="gift.name" :gift="gift" :contributed="isAddedToBasket(gift.name)" @click="handleClick(gift)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModalOverlay, ModalTarget, openModal, type DefineGroups } from '@kolirt/vue-modal'
import { computed, h, onMounted, provide, ref } from 'vue'
import AddToBasket from './components/AddToBasket.vue'
import Gift from './components/Gift.vue'
import ModalContainer from './components/ModalContainer.vue'
import { logEvent } from './firebase'
import type { BasketItem, Gift as GiftInfo } from './types'
import { useDebounce } from './useDebounce.ts'
import { useGiftAnalytics } from './useGiftAnalytics'

declare module '@kolirt/vue-modal' {
  interface ModalGroupRegistry extends DefineGroups<['default']> {}
}

const basket = ref<BasketItem[]>([])
const totalAmount = computed(() => Math.max(0, basket.value.reduce((total, item) => total + item.contribution, 0)))
const currentContribution = ref<null|string>(null)
const currentContributionAmount = computed({
  get: () => basket.value.find(item => item.giftname === currentContribution.value)?.contribution ?? 0,
  set: (newContribution: number) => {
    const item = basket.value.find(item => item.giftname === currentContribution.value)
    if (!item) throw new Error('Item not found in basket')
    item.contribution = newContribution
  }
})
provide('contribution', currentContributionAmount)

const { logGiftSelected, logGiftRemoved, logContributionUpdated, logGiftCheckedOut, logCheckout } = useGiftAnalytics(basket)
onMounted(() => {
  logEvent('screen_view', { page_title: document.title, page_location: window.location.href, page_path: window.location.pathname })
})

function isAddedToBasket(giftname: string): boolean {
  return basket.value.some(item => item.giftname === giftname)
}

function removeFromBasket(giftname: string) {
  const index = basket.value.findIndex(item => item.giftname === giftname)
  if (index !== -1) {
    basket.value.splice(index, 1)
  }
}

function handleClick(gift: GiftInfo) {
  if (isAddedToBasket(gift.name)) {
    logGiftRemoved(gift)
    removeFromBasket(gift.name)
  } else {
    logGiftSelected(gift)
    presentModal(gift)
  }
}

const debouncedContributionUpdated = useDebounce((gift: GiftInfo, newContribution: number) => {
  logContributionUpdated(gift, newContribution)
}, 500)

async function presentModal(gift: GiftInfo) {
  const contribution = gift.contribution ? 0 : gift.amount
  currentContribution.value = gift.name
  basket.value.push({ giftname: gift.name, contribution })
  openModal(
    h(ModalContainer, { title: gift.name, description: gift.description }, () => [
      h(AddToBasket, { gift, onContributionChange: (newContribution: number) => {
        debouncedContributionUpdated(gift, newContribution)
        currentContributionAmount.value = newContribution
      }})
    ]),
    { group: 'default' }
  ).then(() => {
    handleCheckout()
  }).catch(() => {
    const index = basket.value.findIndex(item => item.giftname === gift.name)
    if (index !== -1 && basket.value[index].contribution === 0) {
      logGiftRemoved(gift)
      basket.value.splice(index, 1)
    }
  })
}

function handleCheckout() {
  basket.value.forEach(item => logGiftCheckedOut(item.giftname))
  logCheckout()
  const giftAmount = totalAmount.value
  const paypalUrl = `https://paypal.me/lauramattwedding/` + (giftAmount > 0 ? giftAmount : '')
  window.open(paypalUrl, '_self')
}

const gifts: GiftInfo[] = [
  {
    name: 'Our trip to Iceland',
    description: 'Contribute to our honeymoon in Iceland!',
    image: new URL('./assets/iceland.jpeg', import.meta.url).href,
    amount: 0,
    contribution: true,
  },
  {
    name: 'Hot springs trip',
    description: '',
    image: new URL('./assets/springs.webp', import.meta.url).href,
    amount: 50,
  },
  {
    name: 'A day trip to see the waterfalls',
    description: '',
    image: new URL('./assets/waterfalls.webp', import.meta.url).href,
    amount: 70,
  },
  {
    name: 'Jónsi meet & greet',
    description: 'The man himself...',
    image: new URL('./assets/jonsi.jpg', import.meta.url).href,
    amount: 12,
  },
  {
    name: 'Lunch in Reykjavík',
    description: '',
    image: new URL('./assets/soup.jpg', import.meta.url).href,
    amount: 20,
  },
  {
    name: '2x Icelandic beers',
    description: 'They can\'t grow hops up there!',
    image: new URL('./assets/beer.webp', import.meta.url).href,
    amount: 200,
    contribution: true,
  },
  {
    name: 'Sauna, swim & beer',
    description: 'Warm up (then cool down) when we\'re back',
    image: new URL('./assets/sauna.jpg', import.meta.url).href,
    amount: 100,
  },
  {
    name: 'Dinner in Brighton',
    description: 'Lovely Jubbly',
    image: new URL('./assets/dinner.jpg', import.meta.url).href,
    amount: 50,
  },
  {
    name: 'Gift for Pancho',
    description: 'The absolute vicar!',
    image: new URL('./assets/pancho.jpeg', import.meta.url).href,
    amount: 8,
  },
  {
    name: 'Gift for Jerry',
    description: 'An independent woman!',
    image: new URL('./assets/jerry.jpeg', import.meta.url).href,
    amount: 8,
  },
  {
    name: 'Gift for both of them!',
    description: '',
    image: new URL('./assets/cats.jpeg', import.meta.url).href,
    amount: 15,
  }
];

</script>

<style lang="less" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(1.5rem, 6vw, 4rem) clamp(1rem, 8vw, 8rem);
  padding-bottom: calc(clamp(2rem, 10vw, 8rem) + env(safe-area-inset-bottom));

  @media (max-width: 400px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.title {
  color: var(--text);
  font-family: "Homemade Apple";
  font-size: clamp(1.75rem, 8vw, 3.5rem);
  font-weight: 400;
  letter-spacing: 0em;
  line-height: 1.25;
  margin: 1rem clamp(0rem, 6vw, 5rem) 2rem;
  overflow-wrap: break-word;
}

.heading {
  color: var(--text);
  font-family: "Calistoga";
  font-weight: 400;
  font-size: clamp(1.6rem, 6vw, 2.25rem);
  line-height: 1.25;
  text-transform: none;
  letter-spacing: 0em;
}

.description {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  width: 100%;
  max-width: 1000px;
  margin-bottom: clamp(2rem, 7vw, 4rem);

  color: var(--text);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.25;
  text-transform: none;
  letter-spacing: 0em;

  .image {
    max-width: 400px;
    height: auto;

    > img {
      width: 100%;
      height: auto;
    }
  }

  @media (max-width: 767px) {
    flex-direction: column;

    .image {
      max-width: min(400px, 100%);
    }
  }
}

.gifts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(130px, 100%), 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 1200px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

.contribution {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: var(--bg);
  border: 1px solid rgb(245, 137, 108);
  border-radius: 0.5rem;

  width: 100%;
  max-width: 1200px;

  position: sticky;
  top: 0.25rem;
  z-index: 10;

  &__text {
    font-weight: bold;
    font-size: 1rem;
    color: black;
    margin: 0;
    padding: 0.5rem 1rem;
  }

  @media (max-width: 479px) {
    justify-content: center;

    &__text {
      padding: 0.25rem 0.5rem;
      width: 100%;
    }

    .btn-primary {
      width: 100%;
    }
  }
}
</style>