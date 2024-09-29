'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UITextLabel, UITextbox, UIButton, UIFrame } from '@/lib/UIObjectTypes';
import { UIManager } from './UIManager';

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

export function renderManager(manager: UIManager) {
    return manager.objects.filter(obj => obj.isVisible).map(obj => renderObject(obj as UITextLabel | UITextbox | UIButton | UIFrame));
}

function renderObject(obj: UITextLabel | UITextbox | UIButton | UIFrame) {
    if (!obj.isVisible) return null;

    const commonStyles = {
        position: 'absolute' as 'absolute',
        left: `${obj.currentX}px`,
        top: `${obj.currentY}px`,
        opacity: obj.currentOpacity,
        backgroundColor: obj.fillColor,
        border: `${obj.outlineSize}px solid ${obj.outlineColor}`,
        borderRadius: `${obj.borderRadius}px`,
        color: obj.fontColor,
    };

    if (obj instanceof UIFrame) {
        return (
            <div key={`frame-${obj.id}`} style={{
                ...commonStyles,
                padding: '10px',
            }}>
                {obj.children.map((child, index) => 
                    renderObject(child as UITextLabel | UITextbox | UIButton | UIFrame)
                )}
            </div>
        );
    } else if (obj instanceof UITextLabel) {
        return (
            <div key={`textlabel-${obj.id}`} style={{
                ...commonStyles,
                fontSize: `${obj.fontSize}px`,
                fontWeight: obj.fontWeight,
                textAlign: obj.textAlign,
                padding: '5px',
            }}>
                {obj.text}
            </div>
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
                    ...commonStyles,
                    padding: '5px',
                }}
            />
        );
    } else if (obj instanceof UIButton) {
        return (
            <button
                key={`button-${obj.id}`}
                onClick={obj.onClick}
                style={{
                    ...commonStyles,
                    padding: '10px',
                }}
            >
                {obj.text}
            </button>
        );
    }
}