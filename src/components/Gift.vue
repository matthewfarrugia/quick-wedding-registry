
<template>
  <div class="gift" @click="handleClick()">
    <div class="gift__image">
      <img :src="gift.image" :alt="gift.name" loading="lazy" />
    </div>
    <div class="gift__content">
      <p class="name">{{ gift.name }}</p>
      <p class="description">{{ gift.description }}</p>
      <p v-if="gift.amount > 0" class="amount">£{{ gift.amount }}</p>
      <button :class="{'btn-primary': !contributed, 'btn-default': contributed}">
        <template v-if="contributed">
          Remove {{ gift.contribution ? 'contribution' : 'gift' }}
        </template>
        <template v-else>
          {{ gift.contribution ? 'Contribute' : 'Gift' }}
        </template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Gift } from '../types'

const { gift, contributed } = defineProps<{
  gift: Gift
  contributed: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  emit('click')
}
</script>

<style lang="less" scoped>
.gift {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;

  background-color: white;
  border-radius: 0.5rem;
  padding: clamp(0.6rem, 2.5vw, 1rem);

  min-width: 0;
  width: 100%;

  cursor: pointer;
  transition: box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      .btn-primary {
        background-color: var(--btn-hover);
      }
      .btn-default {
        background-color: var(--btn-default-hover);
      }
    }
  }

  &:active {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

  &__image {
    width: 100%;
    aspect-ratio: 1/1;
    overflow: hidden;
    border-radius: 0.5rem;

    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;
    flex: 1;

    .name {
      font-weight: bold;
      font-size: clamp(0.95rem, 3.2vw, 1.2rem);
      overflow-wrap: break-word;
    }
    .description {
      font-size: clamp(0.8rem, 2.6vw, 0.9rem);
      color: #555;
      overflow-wrap: break-word;
    }
    .amount {
      font-weight: bold;
      font-size: clamp(0.9rem, 2.8vw, 1rem);
      color: #333;
    }
    button {
      width: 100%;
      padding: 0.5rem;
    }
  }
}
</style>