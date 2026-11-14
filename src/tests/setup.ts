import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

const dialogPrototype = HTMLDialogElement.prototype
const nativeShowModal = dialogPrototype.showModal
const nativeClose = dialogPrototype.close

dialogPrototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute('open', '')
  try {
    nativeShowModal?.call(this)
  } catch {
    // jsdom does not fully implement the top-layer dialog.
  }
}

dialogPrototype.close = function close(this: HTMLDialogElement) {
  this.removeAttribute('open')
  try {
    nativeClose?.call(this)
  } catch {
    // jsdom does not fully implement dialog.close().
  }
}
