import { UIObject, UIObjectProps } from '@/lib/UIObject';

export class UITextLabel extends UIObject {
    text: string;
    fontColor: string;
    fontSize: number;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';

    constructor(props: UIObjectProps & { 
        text: string;
        fontColor: string;
        fontSize?: number;
        fontWeight?: string;
        textAlign?: 'left' | 'center' | 'right';
    }) {
        super(props);
        this.fontColor = props.fontColor;
        this.text = props.text;
        this.fontSize = props.fontSize || 16;
        this.fontWeight = props.fontWeight || 'normal';
        this.textAlign = props.textAlign || 'left';
    }
}

export class UITextbox extends UIObject {
    text: string;
    fontColor: string;
    fontSize: number;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    placeholderText: string;
    onEnter: (value: string) => void;

    constructor(props: UIObjectProps & {
        placeholderText: string;
        text: string;
        fontColor: string;
        fontSize?: number;
        fontWeight?: string;
        textAlign?: 'left' | 'center' | 'right';
        onEnter: (value: string) => void;
    }) {
        super(props);
        this.text = props.text;
        this.fontColor = props.fontColor;
        this.fontSize = props.fontSize || 16;
        this.fontWeight = props.fontWeight || 'normal';
        this.textAlign = props.textAlign || 'left';
        this.placeholderText = props.placeholderText;
        this.onEnter = props.onEnter;
    }
}

export class UIButton extends UIObject {
    text: string;
    fontColor: string;
    fontSize: number;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    onClick: () => void;

    constructor(props: UIObjectProps & { 
        text: string;
        fontColor: string;
        fontSize?: number;
        fontWeight?: string;
        textAlign?: 'left' | 'center' | 'right';
        onClick: () => void;
    }) {
        super(props);
        this.fontColor = props.fontColor;
        this.text = props.text;
        this.fontSize = props.fontSize || 16;
        this.fontWeight = props.fontWeight || 'normal';
        this.textAlign = props.textAlign || 'left';
        this.onClick = props.onClick;
    }
}

export class UIFrame extends UIObject {
    children: UIObject[];

    constructor(props: UIObjectProps & { children: UIObject[] }) {
        super(props);
        this.children = props.children;
    }

    addChild(child: UIObject) {
        this.children.push(child);
    }

    removeChild(childId: string) {
        this.children = this.children.filter(child => child.id !== childId);
    }
}