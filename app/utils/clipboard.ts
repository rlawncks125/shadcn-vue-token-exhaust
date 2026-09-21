function legacyCopyText(text: string) {
  const textarea = document.createElement('textarea')
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const selection = document.getSelection()
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null

  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  let copied = false
  try {
    copied = document.execCommand('copy')
  }
  finally {
    textarea.remove()
    activeElement?.focus({ preventScroll: true })
    if (selection && selectedRange) {
      selection.removeAllRanges()
      selection.addRange(selectedRange)
    }
  }

  if (!copied) throw new Error('Unable to copy text to the clipboard.')
}

export async function copyText(text: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Clipboard access is only available in a browser.')
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    }
    catch {
      // Clipboard permissions can fail outside a secure context; use the browser fallback.
    }
  }

  legacyCopyText(text)
}
