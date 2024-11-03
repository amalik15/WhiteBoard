import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Canvas.css';

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = '#000000';
                context.lineJoin = 'round';
                context.lineCap = 'round';
                context.lineWidth = 1;
                setCtx(context);

                const savedImage = localStorage.getItem('canvasImage');
                if (savedImage) {
                    const img = new Image();
                    img.src = savedImage;
                    img.onload = () => {
                        context.drawImage(img, 0, 0);
                    };
                }
            }
        }
    }, []);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [resizeCanvas]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        setPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            localStorage.setItem('canvasImage', dataUrl);
        }
    }, []);

    const handleMouseOut = useCallback(() => {
        setIsDrawing(false);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !ctx) return;
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
        setPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }, [isDrawing, ctx, position]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            localStorage.removeItem('canvasImage');
        }
    };

    return (
        <div id="canvasList" style={{ overflow: 'hidden' }}>
            <canvas
                ref={canvasRef}
                className="canvas"
                id="baseCanvas"
                style={{
                    zIndex: 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseOut={handleMouseOut}
                onMouseMove={handleMouseMove}
            />
            <button
                onClick={clearCanvas}
                style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    zIndex: 10,
                }}
            >
                Clear
            </button>
        </div>
    );
}

export default Canvas;