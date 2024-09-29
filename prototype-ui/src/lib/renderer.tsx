'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UIBox, UITextbox, UIButton, UIFrame } from '@/lib/UIObjectTypes';
import { UIManager } from './UIManager';

function renderObject(obj: UIBox | UITextbox | UIButton | UIFrame) {
    if (!obj.isVisible) return null;

    if (obj instanceof UIFrame) {
        return (
            <div key={`frame-${obj.id}`} style={{
            position: 'absolute',
            left: `${obj.currentX}px`,
            top: `${obj.currentY}px`,
            border: `${obj.outlineSize}px solid ${obj.outlineColor}`,
            padding: '10px',
            backgroundColor: obj.fillColor,
            color: obj.fontColor,
            }}>
            {obj.children.map((child, index) => 
                renderObject(child as UIBox | UITextbox | UIButton | UIFrame)
            )}
            </div>
        );
    } else if (obj instanceof UIBox) {
        return (
            <div key={`box-${obj.id}`} style={{
            position: 'absolute',
            left: `${obj.currentX}px`,
            top: `${obj.currentY}px`,
            width: `${obj.width}px`,
            height: `${obj.height}px`,
            backgroundColor: obj.fillColor,
            border: `${obj.outlineSize}px solid ${obj.outlineColor}`,
            }} />
        );
    } else if (obj instanceof UITextbox) {
        return (
            <input
            key={`textbox-${obj.id}`}
            type="text"
            value={obj.text}
            onChange={(e) => obj.text = e.target.value}
            onKeyDown={(e) => e.key === 'Enter' && obj.onEnter(obj.text)}
            style={{
                position: 'absolute',
                left: `${obj.currentX}px`,
                top: `${obj.currentY}px`,
                padding: '5px',
                backgroundColor: obj.fillColor,
                border: `${obj.outlineSize}px solid ${obj.outlineColor}`,
                color: obj.fontColor,
            }}
            />
        );
    } else if (obj instanceof UIButton) {
        return (
            <button
            key={`button-${obj.id}`}
            onClick={obj.onClick}
            style={{
                position: 'absolute',
                left: `${obj.currentX}px`,
                top: `${obj.currentY}px`,
                padding: '10px',
                backgroundColor: obj.fillColor,
                border: `${obj.outlineSize}px solid ${obj.outlineColor}`,
                color: obj.fontColor,
            }}
            >
            {obj.text}
            </button>
        );
    }
};

export function renderManager(manager: UIManager) {
    return manager.objects.filter(obj => obj.isVisible).map(obj => renderObject(obj as UIBox | UITextbox | UIButton | UIFrame));
}
export function renderInitialize(manager: UIManager, init_objects: (manager: UIManager) => void) {
    const animationFrameRef = useRef<number>();
    const [, setRenderTrigger] = useState({});

    useEffect(() => {
        if (manager.objects.length === 0) {
            init_objects(manager);
        }

        const animate = () => {
            manager.updateObjects();
            animationFrameRef.current = requestAnimationFrame(animate);
            
            setRenderTrigger({});
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            manager.objects = [];
        };
    }, [manager]);
}