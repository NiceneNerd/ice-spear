/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Selector
{
    constructor(canvas, aspectRatio, camera, icons)
    {
        this.canvas = canvas;
        this.aspectRatio = aspectRatio;
        this.camera = camera;
        this.icons = icons;

        this.pos = {x: 0, y: 0};
        this.gamePos = {x: 0, y: 0};

        this.selectedIcon = undefined;
        this.selectedAnimVal = 0.0;

        this.markedIcon = undefined;
        this.markedAnimVal = 0.0;

        this.hasMoved = false;
    }

    _updatePos(ev)
    {
        const canvasRect = this.canvas.getBoundingClientRect();
        this.pos.x = ev.clientX - canvasRect.left;
        this.pos.y = ev.clientY - canvasRect.top;
        
        if(this.pos.x >= 0 && this.pos.x <= canvasRect.width &&
            this.pos.y >= 0 && this.pos.y <= canvasRect.height)
        {
            const camScale = this.camera.getScale();
            const camPos   = this.camera.getPos();

            // normalize
            this.pos.x =  (this.pos.x / canvasRect.width)  * 2 - 1;
            this.pos.y = -(this.pos.y / canvasRect.height) * 2 + 1;

            // norm. to vertex coordinates
            this.pos.x = this.pos.x / (this.aspectRatio[0] * camScale[0]) - camPos[0];
            this.pos.y = this.pos.y / (this.aspectRatio[1] * camScale[1]) - camPos[1];

            // convert to game coords
            this.gamePos.x = this.pos.x * 1000;
            this.gamePos.y = this.pos.y * 1000;
        }
    }

    _checkIcons()
    {
        const iconSize = this.icons.getRadius()  / this.camera.getScale()[0];
        const iconSizeSquare = iconSize * iconSize;

        const icons = this.icons.getIcons();
        for(let icon of icons)
        {
            const diffX = icon[1].x - this.pos.x;
            const diffY = icon[1].y - this.pos.y;
            const len = (diffX * diffX) + (diffY * diffY);
            if(len < iconSizeSquare)
            {
                if(this.selectedIcon != icon[0] && this.markedIcon != icon[0])
                {
                    this.selectedIcon = icon[0];
                    this.selectedAnimVal = 0.0;
                }

                return (this.markedIcon == icon[0]);
            }
        }

        this._deselect(!this.markedIcon);
        return false;
    }

    _deselect(inclMarked = true)
    {
        if(inclMarked)
        {
            this.markedIcon = undefined;
            this.markedAnimVal = 0.0;
        }

        this.selectedIcon = undefined;
        this.selectedAnimVal = 0.0;

        this.icons.deselectAll();
    }

    onMove(ev)
    {
        if(ev.movementX > 0 || ev.movementY > 0)
            this.hasMoved = true;

        this._updatePos(ev);
        this._checkIcons(ev);
    }

    onMouseDown(ev)
    {
        this.hasMoved = false;
    }

    onMouseUp(ev)
    {
        this._updatePos(ev);
        this._checkIcons(ev);

        if(this.markedIcon)
        {
            if(!this._checkIcons(ev) && !this.hasMoved) {
                this._deselect(); 
                this.onMouseUp(ev);
            }
        }else if(this.selectedIcon)
        {
            this.markedIcon = this.selectedIcon;
        }
    }

    update()
    {
        let iconsChanged = false;

        if(this.markedIcon && this.markedAnimVal <= 1.0)
        {
            this.markedAnimVal = 1.0;
            this.icons.selectIcon(this.markedIcon, this.markedAnimVal, false);
            iconsChanged = true;
        }

        if(this.selectedIcon
            && this.selectedIcon != this.markedIcon
            && (iconsChanged || this.selectedAnimVal <= 1.0))
        {
            this.icons.selectIcon(this.selectedIcon, this.selectedAnimVal, false);
            this.selectedAnimVal += (1.0 / 4.0);
            iconsChanged = true;
        }

        if(iconsChanged)
        {
            this.icons.updateSelectionBuffer();
            this.icons.deselectAll(false);
        }

        this.canvas.style.cursor = this.selectedIcon ? 'pointer' : '';
    }
}