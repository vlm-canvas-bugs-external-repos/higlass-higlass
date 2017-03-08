import {scaleLinear} from 'd3-scale';
import {ticks} from 'd3-array';
import {tileProxy} from './TileProxy.js';
import {HorizontalTiled1DPixiTrack} from './HorizontalTiled1DPixiTrack.js';

export class HorizontalLine1DPixiTrack extends HorizontalTiled1DPixiTrack {
    constructor(scene, server, uid, handleTilesetInfoReceived, option, animate) {

        super(scene, server, uid, handleTilesetInfoReceived, option, animate);

        this.pAxis = new PIXI.Graphics();

        this.pMain.addChild(this.pAxis);

        this.axisTexts = [];
    }

    initTile(tile) {
        /**
         * Create whatever is needed to draw this tile.
         */
        this.drawTile(tile);
    }

    destroyTile(tile) {

    }

    drawAxis(valueScale) {
        let TICK_HEIGHT = 40;
        let TICK_MARGIN = 0;
        let TICK_LENGTH = 5;
        let TICK_LABEL_MARGIN = 4;
        let MARGIN_TOP = 3;
        let MARGIN_BOTTOM = 3;

        let tickCount = Math.max(this.dimensions[1] / TICK_HEIGHT, 1);

        let graphics = this.pAxis;

        graphics.clear();
        graphics.lineStyle(1, 0x000000, 1);


        if (this.options.axisPositionHorizontal == 'left' ||
            this.options.axisPositionHorizontal == 'right' ||
            this.options.axisPositionVertical == 'top' ||
            this.options.axisPositionVertical == 'bottom') {

            let i = 0; 

            // create scale ticks but not all the way to the top
            let tickValues = ticks(valueScale.invert(MARGIN_BOTTOM), 
                              valueScale.invert(this.dimensions[1] - MARGIN_TOP), 
                              tickCount);

            if (tickValues.length < 1)  {
                tickValues = ticks(valueScale.invert(MARGIN_BOTTOM),
                              valueScale.invert(this.dimensions[1] - MARGIN_TOP), 
                              tickCount + 1);

                if (tickValues.length > 1) {
                    // sometimes the ticks function will return 0 and then 2
                    // if it didn't return enough previously, we probably only want a single
                    // tick
                    tickValues = [tickValues[0]];
                }
            }

            //
            while (i < tickValues.length) {
                let tick = tickValues[i];

                while (this.axisTexts.length <= i) {
                    let newText = new PIXI.Text(tick, {fontSize:"10px", fontFamily:"Arial", fill: "black"});
                    this.axisTexts.push(newText);

                    this.pAxis.addChild(newText);
                }

                while (this.axisTexts.length > i+1) {
                    let lastText = this.axisTexts.pop();
                    this.pAxis.removeChild(lastText);
                }

                this.axisTexts[i].text = tick;
                this.axisTexts[i].anchor.y = 0.5;
                this.axisTexts[i].anchor.x = 0.5;
                this.axisTexts[i].x = TICK_MARGIN + TICK_LENGTH + TICK_LABEL_MARGIN + this.axisTexts[i].width / 2;
                this.axisTexts[i].y = valueScale(tick);

                if (this.options.axisPositionHorizontal == 'right' || 
                    this.options.axisPositionVertical == 'bottom') {
                    this.axisTexts[i].x = this.dimensions[0] - 
                        (TICK_MARGIN + TICK_LENGTH + TICK_LABEL_MARGIN) - this.axisTexts[i].width / 2;

                    graphics.moveTo(this.dimensions[0],0);
                    graphics.lineTo(this.dimensions[0], this.dimensions[1]);

                    graphics.moveTo(this.dimensions[0], 0);
                    graphics.lineTo(this.dimensions[0] - (TICK_MARGIN + TICK_LENGTH), 0);

                    graphics.moveTo(this.dimensions[0] - TICK_MARGIN, valueScale(tick));
                    graphics.lineTo(this.dimensions[0] - (TICK_MARGIN + TICK_LENGTH), valueScale(tick));
                } else {
                    graphics.moveTo(0,0);
                    graphics.lineTo(0, this.dimensions[1]);

                    graphics.moveTo(0, 0);
                    graphics.lineTo(TICK_MARGIN + TICK_LENGTH, 0);

                    graphics.moveTo(TICK_MARGIN, valueScale(tick));
                    graphics.lineTo(TICK_MARGIN + TICK_LENGTH, valueScale(tick));
                }

                if (this.flipText) {
                    this.axisTexts[i].scale.x = -1;
                }

                i++;
            }
        } else {
            while (this.axisTexts.length) {
                let axisText = this.axisTexts.pop();
                graphics.removeChild(axisText);
            }
        }
    }

    drawTile(tile) {
        super.drawTile(tile);

        if (!tile.graphics)
            return;

        let graphics = tile.graphics;

        let {tileX, tileWidth} = this.getTilePosAndDimensions(tile.tileData.zoomLevel, tile.tileData.tilePos);
        let tileValues = tile.tileData.dense;

        if (tileValues.length == 0)
            return;

        let maxVisibleValue = this.maxVisibleValue();

        if (maxVisibleValue < 0)
            return;

        let valueScale = scaleLinear()
            .domain([0, maxVisibleValue])
            .range([this.dimensions[1], 0]);


        graphics.clear();

        this.drawAxis(valueScale);

        if (valueScale.domain()[1] < 0) {
            return;
        }

        // this scale should go from an index in the data array to
        // a position in the genome coordinates
        let tileXScale = scaleLinear().domain([0, this.tilesetInfo.tile_size])
        .range([tileX,tileX + tileWidth]);

        graphics.lineStyle(1, 0x0000FF, 1);
       // graphics.beginFill(0xFF700B, 1);
        let j = 0;

        for (let i = 0; i < tileValues.length; i++) {
            let xPos = this._xScale(tileXScale(i));

           if(j == 0){
                graphics.moveTo(this._xScale(tileXScale(i)), valueScale(tileValues[i]));
                j++;
            }

            if (tileXScale(i) > this.tilesetInfo.max_pos[0])
                // this data is in the last tile and extends beyond the length
                // of the coordinate system
                break;


            //console.log('drawing:', this._xScale(tileXScale(i)), valueScale(tileValues[i+1]));
            graphics.lineTo(this._xScale(tileXScale(i)), valueScale(tileValues[i+1]));
        }
    }

    setPosition(newPosition) {
        super.setPosition(newPosition);

        this.pMain.position.y = this.position[1];
        this.pMain.position.x = this.position[0];
    }

    zoomed(newXScale, newYScale) {
        this.xScale(newXScale);
        this.yScale(newYScale);

        this.refreshTiles();

        this.draw();

    }

}
