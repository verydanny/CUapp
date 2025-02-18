<script lang="ts">
    import { onMount } from 'svelte'

    // Add 'src' to the component props.
    const {
        onCrop,
        size = 300,
        src = null,
        useCredentials = false
    } = $props<{
        // onCrop now receives an object whose keys are the format strings and values are Blobs.
        onCrop: (blobs: { avif?: Blob; webp?: Blob; png?: Blob }) => void | Promise<void>
        size?: number
        src?: string | null
        useCredentials?: boolean
    }>()

    let fileInput: HTMLInputElement
    let canvas: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D
    let image: HTMLImageElement
    let zoomLevel = $state(1)
    let isDragging = $state(false)
    let startX = $state(0)
    let startY = $state(0)
    let offsetX = $state(0)
    let offsetY = $state(0)
    let imageLoaded = $state(false)
    let preCropped = $state(false)

    const canvasSize = $derived(size)

    function loadInitialImage(imageSrc: string) {
        image = new Image()
        image.crossOrigin = useCredentials ? 'use-credentials' : 'anonymous'
        image.onload = () => {
            imageLoaded = true

            // If the image dimensions are less than or equal to the crop size,
            // assume it was already cropped.
            preCropped = image.width <= canvasSize * 2 && image.height <= canvasSize * 2
            if (image.width > canvasSize * 2 || image.height > canvasSize * 2) {
                zoomLevel = 0.75
            } else {
                zoomLevel = 0.5
            }
            offsetX = 0
            offsetY = 0
            drawImage()
        }
        image.onerror = (error) => {
            console.error('Error loading image:', error)
        }
        image.src = imageSrc
    }

    onMount(() => {
        // Use a fixed multiplier for exporting a 2x resolution image.
        const outputScale = 2
        // Set the canvas internal dimensions based on the desired output scale.
        canvas.width = canvasSize * outputScale
        canvas.height = canvasSize * outputScale
        // The CSS size remains at canvasSize (e.g. 150px).
        canvas.style.width = `${canvasSize}px`
        canvas.style.height = `${canvasSize}px`

        ctx = canvas.getContext('2d')!
        // Scale the drawing context so your coordinate system remains 0..canvasSize.
        ctx.scale(outputScale, outputScale)

        // Do NOT clip the canvas using ctx.arc/ctx.clip here.
        // The full square crop will be drawn, but...
        // the canvas will be wrapped in a container that displays it as a circle.

        // Load an initial image if provided.
        if (src) {
            loadInitialImage(src)
        }
    })

    function supportsAvif(): boolean {
        const canvasTest = document.createElement('canvas')
        return canvasTest.toDataURL('image/avif').indexOf('data:image/avif') === 0
    }

    function supportsWebp(): boolean {
        const canvasTest = document.createElement('canvas')
        return canvasTest.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }

    function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                image = new Image()
                image.onload = () => {
                    imageLoaded = true

                    // Determine if the loaded image is pre-cropped.
                    preCropped = image.width <= canvasSize * 2 && image.height <= canvasSize * 2

                    if (preCropped) {
                        zoomLevel = 0
                    } else if (image.width > canvasSize * 2 || image.height > canvasSize * 2) {
                        zoomLevel = 0.75
                    } else {
                        zoomLevel = 0.5
                    }
                    offsetX = 0
                    offsetY = 0
                    drawImage()
                }
                image.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    function drawImage() {
        if (!ctx || !image) return

        // Clear the canvas.
        ctx.clearRect(0, 0, canvasSize, canvasSize)

        // Calculate the base scale so the image fills the square.
        const baseScale = Math.max(canvasSize / image.width, canvasSize / image.height)
        let scale: number

        if (preCropped) {
            // For an already-cropped image, use no additional zoom (slider at 0 means 1:1).
            scale = baseScale * (1 + zoomLevel)
        } else {
            const isHighRes = image.width > canvasSize * 2 || image.height > canvasSize * 2
            const minZoom = isHighRes ? 1 : 0.5
            const maxZoom = isHighRes ? 4 : 2
            scale = baseScale * (minZoom + (maxZoom - minZoom) * zoomLevel)
        }

        const scaledWidth = image.width * scale
        const scaledHeight = image.height * scale
        // Center the image using the provided offsets.
        const x = (canvasSize - scaledWidth) / 2 + offsetX
        const y = (canvasSize - scaledHeight) / 2 + offsetY

        ctx.drawImage(image, x, y, scaledWidth, scaledHeight)
    }

    // Helper to wrap canvas.toBlob in a Promise.
    function toBlobPromise(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), type)
        })
    }

    // Create multiple blobs based on format support.
    async function handleCrop() {
        if (!canvas) return

        const formats: { [format: string]: string } = {}
        if (supportsAvif()) {
            formats['avif'] = 'image/avif'
        }
        if (supportsWebp()) {
            formats['webp'] = 'image/webp'
        }
        // PNG is always supported.
        formats['png'] = 'image/png'

        const blobs: { [format: string]: Blob } = {}

        await Promise.all(
            Object.entries(formats).map(async ([format, mimeType]) => {
                const blob = await toBlobPromise(canvas, mimeType)
                if (blob) {
                    blobs[format] = blob
                }
            })
        )

        onCrop(blobs)
    }

    function handleMouseDown(event: MouseEvent) {
        if (!imageLoaded) return
        isDragging = true
        startX = event.clientX - offsetX
        startY = event.clientY - offsetY
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return

        offsetX = event.clientX - startX
        offsetY = event.clientY - startY

        const currentScale =
            Math.max(canvasSize / image.width, canvasSize / image.height) *
            (image.width > canvasSize * 2 ? 1 + 3 * zoomLevel : 0.5 + 1.5 * zoomLevel)
        const scaledWidth = image.width * currentScale
        const scaledHeight = image.height * currentScale
        const maxOffsetX = Math.max(0, (scaledWidth - canvasSize) / 2)
        const maxOffsetY = Math.max(0, (scaledHeight - canvasSize) / 2)

        offsetX = Math.max(Math.min(offsetX, maxOffsetX), -maxOffsetX)
        offsetY = Math.max(Math.min(offsetY, maxOffsetY), -maxOffsetY)

        drawImage()
    }

    function handleMouseUp() {
        isDragging = false
    }

    function handleZoom(event: Event) {
        const input = event.target as HTMLInputElement
        zoomLevel = parseFloat(input.value)
        drawImage()
    }
</script>

<div class="cropper">
    <div class="cropper-preview" style="width: {canvasSize}px; height: {canvasSize}px;">
        <canvas
            bind:this={canvas}
            width={canvasSize}
            height={canvasSize}
            onmousedown={handleMouseDown}
            onmousemove={handleMouseMove}
            onmouseup={handleMouseUp}
            onmouseleave={handleMouseUp}
        ></canvas>
    </div>

    <div class="controls">
        <input type="file" accept="image/*" bind:this={fileInput} onchange={handleFileSelect} />

        {#if imageLoaded}
            <div class="zoom-control">
                <span>Zoom:</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={zoomLevel}
                    oninput={handleZoom}
                    disabled={preCropped}
                />
            </div>

            <button onclick={handleCrop}>Upload</button>
        {/if}
    </div>
</div>

<style>
    .cropper-preview {
        border-radius: 50%;
        overflow: hidden;
    }
    /* Additional styling */
    .cropper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    .controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 300px;
    }
    .zoom-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    input[type='range'] {
        flex: 1;
    }
    button {
        padding: 0.5rem 1rem;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }
    button:hover {
        background: #45a049;
    }
</style>
