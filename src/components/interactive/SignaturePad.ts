export class SignaturePad extends HTMLElement {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private isDrawing = false;
    private lastX = 0;
    private lastY = 0;

    connectedCallback() {
        this.innerHTML = `
            <div class="flex flex-col gap-4">
                <canvas 
                    id="signature-canvas" 
                    width="600" 
                    height="200"
                    class="border-2 border-border rounded cursor-crosshair bg-white touch-none"
                ></canvas>
                <button 
                    id="clear-signature"
                    type="button"
                    class="text-xs font-light text-content-muted hover:text-content-primary transition-colors self-start"
                >
                    LIMPIAR FIRMA
                </button>
            </div>
        `;

        this.canvas = this.querySelector('#signature-canvas');
        this.ctx = this.canvas?.getContext('2d') || null;

        if (!this.canvas || !this.ctx) return;

        // Configure drawing style
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000000';

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas?.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas?.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas?.dispatchEvent(mouseEvent);
        });

        // Clear button
        this.querySelector('#clear-signature')?.addEventListener('click', () => {
            this.clear();
        });
    }

    private startDrawing(e: MouseEvent) {
        this.isDrawing = true;
        const rect = this.canvas!.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    private draw(e: MouseEvent) {
        if (!this.isDrawing || !this.ctx || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        this.lastX = x;
        this.lastY = y;
    }

    private stopDrawing() {
        this.isDrawing = false;
    }

    public clear() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public isEmpty(): boolean {
        if (!this.canvas || !this.ctx) return true;

        const pixelBuffer = new Uint32Array(
            this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer
        );

        return !pixelBuffer.some(color => color !== 0);
    }

    public getDataURL(): string | null {
        if (!this.canvas) return null;
        return this.canvas.toDataURL('image/png');
    }
}

customElements.define('signature-pad', SignaturePad);
