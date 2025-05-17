let modalState = $state<HTMLElement[]>([])

export function setModal(modal: HTMLElement) {
    modalState.push(modal)
}

export function getModal() {
    return modalState
}

export function removeModal(modal: HTMLElement) {
    modalState = modalState.filter((m) => m !== modal)
}
