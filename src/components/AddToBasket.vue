
<template>
  <div class="card">
    <p v-if="!gift.contribution">
      Thank you for the gift!
    </p>
    <div v-else>
      <p class="description">Help contribute to {{ gift.name }}</p>
      <div class="pledge">
        <label for="pledge-input">Your contribution:</label>
        <div class="form-group">
          <span class="currency">£</span>
          <input
            id="pledge-input"
            type="text"
            pattern="[0-9]*"
            v-model.number="contribution"
            class="pledge-input"
          />
        </div>
      </div>
      <p v-if="gift.amount > 0" class="target">Target: £{{ gift.amount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Gift } from '../types'

const { gift } = defineProps<{
  gift: Gift
}>()

const emit = defineEmits<{
  (e: 'contributionChange', newContribution: number): void
}>()

const contribution = ref<number>(0)
watch(contribution, (newContribution) => {
  const value = Math.max(0, parseInt(newContribution as unknown as string, 10))
  emit('contributionChange', isNaN(value) ? 0 : value)
})
</script>
<style lang="less" scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  min-width: 0;
  width: 100%;
  .description {
    font-size: 1rem;
    font-weight: bold;
    overflow-wrap: break-word;
  }
  .target {
    font-size: 0.9rem;
    color: var(--text);
    font-style: italic;
  }
  .pledge {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    .currency {
      font-size: 1rem;
      font-weight: bold;
      pointer-events: none;
      cursor: default;
    }
    .pledge-input {
      width: 100px;
      max-width: 100%;
      min-width: 0;
      flex: 1 1 60px;
      font-size: max(1rem, 16px);
      border: none;
      &:focus {
        outline: none;
      }
    }
  }
}
.form-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  max-width: 100%;
}
</style>