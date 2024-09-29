'use client';

import { tween } from './tween';

export interface UIObjectProps {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    easingStyle: string;
    easingDirection: string;
    isVisible: boolean;
    fillColor: string;
    outlineColor: string;
    outlineSize: number;
    fontColor: string;
    borderRadius: number;
}
  
export class UIObject {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    easingStyle: string;
    easingDirection: string;
    isVisible: boolean;
    currentX: number;
    currentY: number;
    startTime: number;
    fillColor: string;
    outlineColor: string;
    outlineSize: number;
    fontColor: string;
    borderRadius: number;

    constructor(props: UIObjectProps) {
        this.id = props.id;
        this.startX = props.startX;
        this.startY = props.startY;
        this.endX = props.endX;
        this.endY = props.endY;
        this.duration = props.duration;
        this.easingStyle = props.easingStyle;
        this.easingDirection = props.easingDirection;
        this.isVisible = props.isVisible;
        this.currentX = props.startX;
        this.currentY = props.startY;
        this.startTime = Date.now();
        this.fillColor = props.fillColor;
        this.outlineColor = props.outlineColor;
        this.outlineSize = props.outlineSize;
        this.fontColor = props.fontColor;
        this.borderRadius = props.borderRadius;
    }

    update() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000;
        const interpolant = Math.min(elapsedTime / this.duration, 1);

        this.currentX = tween(this.startX, this.endX, interpolant, this.easingStyle, this.easingDirection);
        this.currentY = tween(this.startY, this.endY, interpolant, this.easingStyle, this.easingDirection);

        return interpolant < 1;
    }

    reset() {
        this.currentX = this.startX;
        this.currentY = this.startY;
        this.startTime = Date.now();
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
    }
}