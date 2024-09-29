/*enum EasingStyle
{
    Linear = 0,
    Sine = 1,
    Back = 2,
    Quad = 3,
    Quart = 4,
    Quint = 5,
    Bounce = 6,
    Elastic = 7,
    Exponential = 8,
    Circular = 9,
    Cubic = 10
}

enum EasingDirection
{
    In = 0,
    Out = 1,
    InOut = 2,
    OutIn = 3
}*/

export function tween(startingValue: number, endingValue: number, interpolant: number, easingStyle: string, easingDirection: string): number {
    if (interpolant >= 1)
        return endingValue;
    else if (interpolant <= 0)
        return startingValue;

    // https://www.desmos.com/calculator/m8myals511

    let x = interpolant;
    if (easingStyle == "Sine")
    {
        if (easingDirection == "In")
        {
            x = Math.sin(Math.PI * x / 2 - Math.PI / 2) + 1;
        }
        else if (easingDirection == "Out")
        {
            x = Math.sin(Math.PI * x / 2);
        }
        else if (easingDirection == "InOut")
        {
            x = Math.sin(Math.PI * x - Math.PI / 2) / 2 + 0.5;
        }
        else if (easingDirection == "OutIn")
        {
            x = x <= 0.5 ? Math.sin(Math.PI * x) / 2 : Math.sin(Math.PI * x - Math.PI) / 2 + 1;
        }
    }
    else if (easingStyle == "Back")
    {
        let s = 1.70158;
        let s1 = 2.5949095;
        if (easingDirection == "In")
        {
            x = x * x * (x * (s + 1) - s);
        }
        else if (easingDirection == "Out")
        {
            x = Math.pow(x - 1, 2.0) * ((x - 1) * (s + 1) + s) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? 2 * x * x * (2 * x * (s1 + 1) - s1) : 0.5 * Math.pow(2 * x - 2, 2.0) * ((2 * x - 2) * (s1 + 1) + s1) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = 0.5 * Math.pow(2 * x - 1, 2.0) * ((2 * x - 1) * (s1 + 1) + s1 * (x <= 0.5 ? 1 : -1)) + 0.5;
        }
    }
    else if (easingStyle == "Quad")
    {
        if (easingDirection == "In")
        {
            x = Math.pow(x, 2.0);
        }
        else if (easingDirection == "Out")
        {
            x = -Math.pow(x - 1, 2.0) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? 2 * Math.pow(x, 2.0) : -2 * Math.pow(x - 1, 2.0) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = x <= 0.5 ? -2 * Math.pow(x - 0.5, 2.0) + 0.5 : 2 * Math.pow(x - 0.5, 2.0) + 0.5;
        }
    }
    else if (easingStyle == "Quart")
    {
        if (easingDirection == "In")
        {
            x = Math.pow(x, 4.0);
        }
        else if (easingDirection == "Out")
        {
            x = -Math.pow(x - 1, 4.0) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? 8 * Math.pow(x, 4.0) : -8 * Math.pow(x - 1, 4.0) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = x <= 0.5 ? -8 * Math.pow(x - 0.5, 4.0) + 0.5 : 8 * Math.pow(x - 0.5, 4.0) + 0.5;
        }
    }
    else if (easingStyle == "Quint")
    {
        if (easingDirection == "In")
        {
            x = Math.pow(x, 5.0);
        }
        else if (easingDirection == "Out")
        {
            x = Math.pow(x - 1, 5.0) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? 16 * Math.pow(x, 5.0) : 16 * Math.pow(x - 1, 5.0) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = 16 * Math.pow(x - 0.5, 5.0) + 0.5;
        }
    }
    else if (easingStyle == "Bounce")
    {
        if (easingDirection == "In")
        {
            if (x <= 0.25 / 2.75)
                x = -7.5625 * Math.pow(1.0 - x - 2.625 / 2.75, 2.0) + 0.015625;
            else if (x <= 0.75 / 2.75)
                x = -7.5625 * Math.pow(1.0 - x - 2.25 / 2.75, 2.0) + 0.0625;
            else if (x <= 1.75 / 2.75)
                x = -7.5625 * Math.pow(1.0 - x - 1.5 / 2.75, 2.0) + 0.25;
            else
                x = 1 - 7.5625 * Math.pow(1.0 - x, 2.0);
        }
        else if (easingDirection == "Out")
        {
            if (x <= 1.0 / 2.75)
                x = 7.5625 * x * x;
            else if (x <= 2.0 / 2.75)
                x = 7.5625 * Math.pow(x - 1.5 / 2.75, 2.0) + 0.75;
            else if (x <= 2.5 / 2.75)
                x = 7.5625 * Math.pow(x - 2.25 / 2.75, 2.0) + 0.9375;
            else
                x = 7.5625 * Math.pow(x - 2.625 / 2.75, 2.0) + 0.984375;
        }
        else if (easingDirection == "InOut")
        {
            //x = 
        }
        else if (easingDirection == "OutIn")
        {
            //x = 
        }
    }
    else if (easingStyle == "Elastic")
    {
        let p = 0.3;
        let p1 = 0.45;
        if (easingDirection == "In")
        {
            x = -Math.pow(2.0, 10.0 * (x - 1.0)) * Math.sin(2.0 * Math.PI * (x - 1.0 - p / 4.0) / p);
        }
        else if (easingDirection == "Out")
        {
            x = Math.pow(2.0, -10.0 * x) * Math.sin(2.0 * Math.PI * (x - p / 4.0) / p) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? -0.5 * Math.pow(2.0, 20.0 * x - 10.0) * Math.sin(2.0 * Math.PI * (2.0 * x - 1.1125) / p1) : 0.5 * Math.pow(2.0, -20.0 * x + 10.0) * Math.sin(2.0 * Math.PI * (2.0 * x - 1.1125) / p1) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = x <= 0.5 ? 0.5 * Math.pow(2.0, -20.0 * x) * Math.sin(2.0 * Math.PI * (2.0 * x - p1 / 4.0) / p1) + 0.5 : -0.5 * Math.pow(2.0, 10.0 * (2.0 * x - 2.0)) * Math.sin(2.0 * Math.PI * (2.0 * x - 2.0 - p1 / 4.0) / p1) + 0.5;
        }
    }
    else if (easingStyle == "Exponential")
    {
        if (easingDirection == "In")
        {
            x = Math.pow(2.0, 10.0 * x - 10.0) - 0.001;
        }
        else if (easingDirection == "Out")
        {
            x = -1.001 * Math.pow(2.0, -10.0 * x) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? 0.5 * Math.pow(2.0, 20.0 * x - 10.0) - 0.0005 : 0.50025 * -Math.pow(2.0, -20.0 * x + 10.0) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = x <= 0.5 ? 0.5005 * -Math.pow(2.0, -20.0 * x) + 0.5005 : 0.5 * Math.pow(2.0, 10.0 * (2.0 * x - 2.0)) + 0.4995;
        }
    }
    else if (easingStyle == "Circular")
    {
        if (easingDirection == "In")
        {
            x = -Math.pow(1.0 - Math.pow(x, 2.0), 0.5) + 1;
        }
        else if (easingDirection == "Out")
        {
            x = Math.pow(-Math.pow(x - 1.0, 2.0) + 1.0, 0.5);
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? -Math.pow(-Math.pow(x, 2.0) + 0.25, 0.5) + 0.5 : Math.pow(-Math.pow(x - 1.0, 2.0) + 0.25, 0.5) + 0.5;
        }
        else if (easingDirection == "OutIn")
        {
            x = x <= 0.5 ? Math.pow(-Math.pow(x - 0.5, 2.0) + 0.25, 0.5) : -Math.pow(-Math.pow(x - 0.5, 2.0) + 0.25, 0.5) + 1;
        }
    }
    else if (easingStyle == "Cubic")
    {
        if (easingDirection == "In")
        {
            x = Math.pow(x, 3.0);
        }
        else if (easingDirection == "Out")
        {
            x = Math.pow(x - 1, 3.0) + 1;
        }
        else if (easingDirection == "InOut")
        {
            x = x <= 0.5 ? 4 * Math.pow(x, 3.0) : 4 * Math.pow(x - 1, 3.0) + 1;
        }
        else if (easingDirection == "OutIn")
        {
            x = 4 * Math.pow(x - 0.5, 3.0) + 0.5;
        }
    }
    return endingValue * x + startingValue * (1 - x);
}