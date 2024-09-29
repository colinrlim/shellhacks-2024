'use client';

import React, { useRef } from 'react';
import { UIManager } from '@/lib/UIManager';
import { UITextLabel, UITextbox, UIButton, UIFrame } from '@/lib/UIObjectTypes';
import { renderManager, renderInitialize } from '@/lib/renderer';

export default function Home() {
    const managerRef = useRef<UIManager>(new UIManager());
    const manager = managerRef.current;

    renderInitialize(manager, (manager: UIManager) => {
        const frame = new UIFrame({
            id: 'main-frame',
            startX: 50,
            startY: 50,
            endX: 250,
            endY: 200,
            startOpacity: 0,
            endOpacity: 1,
            duration: 2,
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

        const textLabel = new UITextLabel({
            id: 'text-label',
            startX: 50,
            startY: 50,
            endX: 50,
            endY: 50,
            startOpacity: 1,
            endOpacity: 1,
            duration: 2,
            easingStyle: 'Sine',
            easingDirection: 'InOut',
            isVisible: true,
            fillColor: 'yellow',
            outlineColor: 'black',
            outlineSize: 2,
            fontColor: 'black',
            borderRadius: 5,
            text: 'Hello, World!',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center'
        });


        const textbox = new UITextbox({
            id: 'textbox',
            startX: 10,
            startY: 60,
            endX: 10,
            endY: 60,
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

        frame.addChild(textLabel);
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