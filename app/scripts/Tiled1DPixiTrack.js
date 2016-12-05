import {TiledPixiTrack} from './TiledPixiTrack.js';
import {tileProxy} from './TileProxy.js';

export class Tiled1DPixiTrack extends TiledPixiTrack {
    constructor(scene, server, uid) {
        super(scene, server, uid);

    }

    tileToLocalId(tile) {
        /*
         * The local tile identifier
         */

        // tile contains [zoomLevel, xPos]
        return this.tilesetUid + '.' + tile.join('.');
    }

    tileToRemoteId(tile) {
        /**
         * The tile identifier used on the server
         */

        // tile contains [zoomLevel, xPos]
        return this.tilesetUid + '.' + tile.join('.');
    }

    localToRemoteId(remoteId) {
        let idParts = remoteId.split('.');
        return idParts.slice(0, idParts.length-1).join('.');
    }

    relevantScale() {
        /**
         * Which scale should we use for calculating tile positions?
         *
         * Horizontal tracks should use the xScale and vertical tracks
         * should use the yScale
         *
         * This function should be overwritten by HorizontalTiled1DPixiTrack.js
         * and VerticalTiled1DPixiTrack.js
         */
        return null;

    }

    calculateVisibleTiles() {
        // if we don't know anything about this dataset, no point
        // in trying to get tiles
        if (!this.tilesetInfo)
            return;

        // calculate the zoom level given the scales and the data bounds
        this.zoomLevel = this.calculateZoomLevel(); 

        // x doesn't necessary mean 'x' axis, it just refers to the relevant axis
        // (x if horizontal, y if vertical)
        let xTiles =  tileProxy.calculateTiles(this.zoomLevel, this.relevantScale(), 
                                               this.tilesetInfo.min_pos[0],
                                               this.tilesetInfo.max_pos[0],
                                               this.tilesetInfo.max_zoom,
                                               this.tilesetInfo.max_width);

        let tiles = xTiles.map(x => [this.zoomLevel, x]);

        this.setVisibleTiles(tiles);
    }


    getTilePosAndDimensions(zoomLevel, tilePos) {
        /**
         * Get the tile's position in its coordinate system.
         */
        let xTilePos = tilePos[0];

        let totalWidth = this.tilesetInfo.max_width;

        let minX = 0;

        let tileWidth = totalWidth / Math.pow(2, zoomLevel);

        let tileX = minX + xTilePos * tileWidth;

        return { tileX: tileX,
                 tileWidth: tileWidth}
    }


    zoomed(newXScale, newYScale) {
        super.zoomed(newXScale, newYScale);

        // we only scale along 1 dimension

        let scaleX = (newXScale(1) - newXScale(0))/ (this._refXScale(1) - this._refXScale(0));
        let scaleY = 1;

        let translateX = (newXScale(0) + this.position[0]) - this._refXScale(0) * scaleX;
        let translateY = this.position[1];

        this.pMain.position.x = translateX;
        this.pMain.position.y = translateY;

        this.pMain.scale.x = scaleX;
        this.pMain.scale.y = scaleY;
    }

    updateTile(tile) {
        // no need to redraw this tile, usually
        // unless the data scale changes or something like that
        
        return;
    }
}
