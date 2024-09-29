import { UIObject, UIObjectProps } from './UIObject';

export class UITextLabel extends UIObject {
    text: string;
    fontSize: number;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';

    constructor(props: UIObjectProps & { 
        text: string;
        fontSize?: number;
        fontWeight?: string;
        textAlign?: 'left' | 'center' | 'right';
    }) {
        super(props);
        this.text = props.text;
        this.fontSize = props.fontSize || 16;
        this.fontWeight = props.fontWeight || 'normal';
        this.textAlign = props.textAlign || 'left';
    }
}
export class UITextbox extends UIObject {
    text: string;
    onEnter: (value: string) => void;

    constructor(props: UIObjectProps & { text: string; onEnter: (value: string) => void }) {
        super(props);
        this.text = props.text;
        this.onEnter = props.onEnter;
    }
}

export class UIButton extends UIObject {
    text: string;
    onClick: () => void;

    constructor(props: UIObjectProps & { text: string; onClick: () => void }) {
        super(props);
        this.text = props.text;
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