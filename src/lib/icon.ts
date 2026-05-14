// src/lib/icon.ts — extension action icon helpers

export async function setStatusDot(color: string | null): Promise<void> {
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    img.src = chrome.runtime.getURL('icons/icon-48.png');
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });
    ctx.drawImage(img, 0, 0, size, size);

    if (color) {
        const r = 10;
        const pad = 2;
        ctx.beginPath();
        ctx.arc(size - r - pad, size - r - pad, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    chrome.action.setIcon({ imageData: ctx.getImageData(0, 0, size, size) });
}
