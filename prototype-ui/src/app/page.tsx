'use client';

import React, { useRef } from 'react';
import { UIManager } from '@/lib/UIManager';
import { UIBox, UITextbox, UIButton, UIFrame } from '@/lib/UIObjectTypes';
import { renderManager, renderInitialize } from '@/lib/renderer';

export default function Home() {
    const managerRef = useRef<UIManager>(new UIManager());
    const manager = managerRef.current;

    renderInitialize(manager, (manager: UIManager) => {
        const frame = new UIFrame({
            id: 'main-frame',
            startX: 0,
            startY: 0,
            endX: 200,
            endY: 100,
            startOpacity: 0,
            endOpacity: 1,
            duration: 10,
            easingStyle: 'Elastic',
            easingDirection: 'Out',
            isVisible: true,
            fillColor: 'rgba(200, 200, 200, 0.5)',
            outlineColor: 'black',
            outlineSize: 2,
            fontColor: 'black',
            borderRadius: 10,
            children: []
        });
        const button = new UIButton({
            id: 'toggle-button',
            startX: window.innerWidth / 2 - 75,
            startY: window.innerHeight - 100,
            endX: window.innerWidth / 2 - 75,
            endY: window.innerHeight - 100,
            startOpacity: 1,
            endOpacity: 1,
            duration: 1,
            easingStyle: 'Back',
            easingDirection: 'Out',
            isVisible: true,
            fillColor: 'lightblue',
            outlineColor: 'blue',
            outlineSize: 2,
            fontColor: 'black',
            borderRadius: 5,
            text: 'Toggle Frame',
            onClick: () => { frame.toggleVisibility(); frame.reset(); }
        });

        const box = new UIBox({
            id: 'box',
            startX: 0,
            startY: 0,
            endX: 100,
            endY: 50,
            startOpacity: 0,
            endOpacity: 1,
            duration: 2,
            easingStyle: 'Sine',
            easingDirection: 'InOut',
            isVisible: true,
            fillColor: 'blue',
            outlineColor: 'black',
            outlineSize: 1,
            fontColor: 'white',
            borderRadius: 5,
            width: 50,
            height: 50,
        });
        const textbox = new UITextbox({
            id: 'textbox',
            startX: 0,
            startY: 60,
            endX: 0,
            endY: 110,
            startOpacity: 0,
            endOpacity: 1,
            duration: 1.5,
            easingStyle: 'Bounce',
            easingDirection: 'Out',
            isVisible: true,
            fillColor: 'white',
            outlineColor: 'gray',
            outlineSize: 1,
            fontColor: 'black',
            borderRadius: 3,
            text: '',
            onEnter: (value) => console.log('Entered:', value)
        });

        frame.addChild(box);
        frame.addChild(textbox);

        manager.addObject(frame);
        manager.addObject(button);
    });

    return (
        <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: 'white' }}>
            <h1 style={{ textAlign: 'center' }}>Tweened Animation Demo</h1>
            {renderManager(manager)}
        </div>
    );
}