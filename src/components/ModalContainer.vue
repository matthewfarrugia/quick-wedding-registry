
<template>
  <ModalRoot class="modal-root">
    <ModalContent class="modal-container">
      <ModalTitle class="modal-title">{{ title }}</ModalTitle>
      <ModalDescription class="modal-description">{{ description }}</ModalDescription>
      <div class="modal-body">
        <slot />
      </div>
      <div class="actions">
        <p v-if="contribution > 250" class="actions__message">
          Thank you for your very generous contribution, we can only accept contributions up to £250. <br>Please chat to us directly for Bacs transfer details
        </p>
        <template v-else>
          <button v-if="monzoPaymentIsPossible && contribution < 500" :disabled="contribution <= 0" class="btn-primary" @click="confirm('monzo')">Send Via Apple/Google Pay (Monzo)</button>
          <button :disabled="contribution <= 0" class="btn-primary" @click="confirm('paypal')">Send Via PayPal</button>
          <p class="actions__message small">Please select "friends/family" when contributing via PayPal</p>
          <button class="btn-default" @click="close()">{{ contribution <= 0 ? 'Cancel' : 'Add another gift' }}</button>
        </template>
      </div>
    </ModalContent>
  </ModalRoot>
</template>

<script setup lang="ts">
import { ModalRoot, ModalContent, ModalTitle, ModalDescription, useModalContext } from '@kolirt/vue-modal'
import { inject, type ComputedRef, type Ref } from 'vue'
defineProps<{ title: string; description: string }>()
const { close, confirm } = useModalContext<'monzo' | 'paypal'>()
const contribution = inject<Ref<number>>('contribution')!
const monzoPaymentIsPossible = inject<ComputedRef<boolean>>('monzoPaymentIsPossible')!
</script>

<style lang="less" scoped>
.modal-root {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  width: min(420px, calc(100vw - 2rem));
  max-height: 90dvh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }
}
.modal-title {
  display: none;
}
.modal-description {
  display: none;
}

.modal-body {
  width: 100%;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
  @media (max-width: 479px) {
    flex-direction: column-reverse;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }
  &__message {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text);
    text-align: center;
    &.small {
      font-size: 0.8rem;
    }
  }
}
</style>
