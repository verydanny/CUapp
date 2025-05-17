let rootElementState = $state<HTMLElement | null>(null);

export function setRootElement(rootElement: HTMLDivElement) {
    rootElementState = rootElement;
}

export function getRootElement() {
    return rootElementState;
}
