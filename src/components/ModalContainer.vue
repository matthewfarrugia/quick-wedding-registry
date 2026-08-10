
<template>
  <ModalRoot class="modal-root">
    <ModalContent class="modal-container">
      <ModalTitle class="modal-title">{{ title }}</ModalTitle>
      <ModalDescription class="modal-description">{{ description }}</ModalDescription>
      <div class="modal-body">
        <slot />
      </div>
      <div class="actions">
        <button class="btn-default" @click="close()">{{ contribution <= 0 ? 'Cancel' : 'Add another gift' }}</button>
        <button :disabled="contribution <= 0" class="btn-primary" @click="confirm()">Proceed to PayPal</button>
      </div>
    </ModalContent>
  </ModalRoot>
</template>

<script setup lang="ts">
import { ModalRoot, ModalContent, ModalTitle, ModalDescription, useModalContext } from '@kolirt/vue-modal'
import { inject, type Ref } from 'vue'
defineProps<{ title: string; description: string }>()
const { close, confirm } = useModalContext<void>()
const contribution = inject<Ref<number>>('contribution')!
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
  flex-wrap: wrap;
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
}
</style>
