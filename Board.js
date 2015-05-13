var kTileSide = 50;
var TileType;
(function (TileType) {
    TileType[TileType["Water"] = 0] = "Water";
    TileType[TileType["Desert"] = 1] = "Desert";
    TileType[TileType["Wood"] = 2] = "Wood";
    TileType[TileType["Clay"] = 3] = "Clay";
    TileType[TileType["Sheep"] = 4] = "Sheep";
    TileType[TileType["Ore"] = 5] = "Ore";
    TileType[TileType["Wheat"] = 6] = "Wheat";
    TileType[TileType["Undefined"] = 7] = "Undefined";
})(TileType || (TileType = {}));
var kTileColors = [];
kTileColors[0 /* Water */] = "#00B7FF";
kTileColors[1 /* Desert */] = "#FFF09E";
kTileColors[2 /* Wood */] = "#39AD43";
kTileColors[3 /* Clay */] = "#FF9100";
kTileColors[4 /* Sheep */] = "#BBFF00";
kTileColors[5 /* Ore */] = "#D1D1D1";
kTileColors[6 /* Wheat */] = "#FFFF00";
var allTileTypes = [0 /* Water */, 1 /* Desert */, 2 /* Wood */, 3 /* Clay */, 4 /* Sheep */, 5 /* Ore */, 6 /* Wheat */];
var interiorTileTypes = [1 /* Desert */, 2 /* Wood */, 3 /* Clay */, 4 /* Sheep */, 5 /* Ore */, 6 /* Wheat */];
var resourceTileTypes = [2 /* Wood */, 3 /* Clay */, 4 /* Sheep */, 5 /* Ore */, 6 /* Wheat */];
var GridLocation = (function () {
    function GridLocation(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    GridLocation.prototype.toScreenCoordinates = function () {
        // pointy-top:
        var x = kTileSide * Math.sqrt(3) * (this.x + this.y / 2);
        var y = kTileSide * 1.5 * this.y;
        return new Vec2(x, y);
    };
    GridLocation.prototype.distanceFrom = function (o) {
        return (Math.abs(this.x - o.x) + Math.abs(this.y - o.y) + Math.abs(this.z - o.z)) / 2;
    };
    return GridLocation;
})();
var Vec2 = (function () {
    function Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    return Vec2;
})();
var Board = (function () {
    function Board(hexesXy) {
        this.hexesXy = hexesXy;
    }
    Board.prototype.getHexesXy = function () {
        return this.hexesXy;
    };
    Board.prototype.forEach = function (f, context) {
        var i = 0;
        for (var x = this.hexesXy.getLowerIndex(); x <= this.hexesXy.getUpperIndex(); x++) {
            var yLine = this.hexesXy.get(x);
            for (var y = yLine.getLowerIndex(); y <= yLine.getUpperIndex(); y++) {
                var hex = yLine.get(y);
                f.apply(context || this, [hex, i, x, y]);
                i++;
            }
        }
    };
    Board.prototype.forEachInterior = function (f, context) {
        var i = 0;
        for (var x = this.hexesXy.getLowerIndex() + 1; x <= this.hexesXy.getUpperIndex() - 1; x++) {
            var yLine = this.hexesXy.get(x);
            for (var y = yLine.getLowerIndex() + 1; y <= yLine.getUpperIndex() - 1; y++) {
                var hex = yLine.get(y);
                f.apply(context || this, [hex, i, x, y]);
                i++;
            }
        }
    };
    Board.prototype.clone = function () {
        var newHexesXy = new BoardDimension(this.hexesXy.getLowerIndex(), this.hexesXy.getUpperIndex());
        for (var x = newHexesXy.getLowerIndex(); x <= newHexesXy.getUpperIndex(); x++) {
            var yLine = this.hexesXy.get(x);
            var newYLine = new BoardDimension(yLine.getLowerIndex(), yLine.getUpperIndex());
            for (var y = yLine.getLowerIndex(); y <= yLine.getUpperIndex(); y++) {
                newYLine.put(y, yLine.get(y).clone());
            }
            newHexesXy.put(x, newYLine);
        }
        return new Board(newHexesXy);
    };
    Board.prototype.getTiles = function () {
        var result = new Array();
        this.forEach(function (tile) { return result.push(tile); });
        return result;
    };
    Board.prototype.getInteriorTiles = function () {
        var result = new Array();
        this.forEachInterior(function (tile) { return result.push(tile); });
        return result;
    };
    return Board;
})();
var BoardGenerator = (function () {
    function BoardGenerator() {
    }
    BoardGenerator.prototype.generateCircularBoard = function (n) {
        if (n === void 0) { n = 3; }
        var hexesXy = new BoardDimension(-n, n);
        for (var x = -n; x <= n; x++) {
            Math.max(-n, -x - n);
            var minY = Math.max(-n, -x - n);
            var maxY = Math.min(n, -x + n);
            var hexesY = new BoardDimension(minY, maxY);
            for (var y = hexesY.getLowerIndex(); y <= hexesY.getUpperIndex(); y++) {
                var z = -x - y;
                var position = new GridLocation(x, y, z);
                var boundary = y === hexesY.getLowerIndex() || y === hexesY.getUpperIndex() || x === -n || x === n;
                hexesY.put(y, new Hex(position, boundary));
            }
            hexesXy.put(x, hexesY);
        }
        return new Board(hexesXy);
    };
    return BoardGenerator;
})();
var BoardDimension = (function () {
    function BoardDimension(minIndex, maxIndex) {
        this.minIndex = minIndex;
        this.maxIndex = maxIndex;
        this.arr = new Array(maxIndex - minIndex + 1);
    }
    BoardDimension.prototype.put = function (index, value) {
        this.arr[index - this.minIndex] = value;
    };
    BoardDimension.prototype.get = function (index) {
        return this.arr[index - this.minIndex];
    };
    BoardDimension.prototype.getLowerIndex = function () {
        return this.minIndex;
    };
    BoardDimension.prototype.getUpperIndex = function () {
        return this.maxIndex;
    };
    return BoardDimension;
})();
var Hex = (function () {
    function Hex(position, boundary) {
        this.position = position;
        this.boundary = boundary;
        this.neighbors = [];
        this.type = 7 /* Undefined */;
        this.number = 0;
    }
    Hex.prototype.addNeighbor = function (tile) {
        this.neighbors.push(tile);
    };
    Hex.prototype.isBoundary = function () {
        return this.boundary;
    };
    Hex.prototype.getPosition = function () {
        return this.position;
    };
    Hex.prototype.getType = function () {
        return this.type;
    };
    Hex.prototype.setType = function (value) {
        this.type = value;
    };
    Hex.prototype.getNumber = function () {
        return this.number;
    };
    Hex.prototype.setNumber = function (value) {
        this.number = value;
    };
    Hex.prototype.clone = function () {
        var newHex = new Hex(new GridLocation(this.position.x, this.position.y, this.position.z), this.boundary);
        newHex.setType(this.getType());
        newHex.setNumber(this.getNumber());
        return newHex;
    };
    return Hex;
})();
var HexHelper = (function () {
    function HexHelper() {
    }
    HexHelper.prototype.linkHexes = function (a, b) {
        a.addNeighbor(b);
        b.addNeighbor(a);
    };
    return HexHelper;
})();
var BoardRenderer = (function () {
    function BoardRenderer(canvas, context) {
        this.canvas = canvas;
        this.context = context;
    }
    BoardRenderer.prototype.render = function (board) {
        var _this = this;
        board.forEach(function (hex) {
            var position = hex.getPosition();
            var screenCoordinates = position.toScreenCoordinates();
            _this.context.fillStyle = kTileColors[hex.getType()] || "#FF00FF";
            _this.context.setTransform(1, 0, 0, 1, 400, 400);
            _this.context.strokeStyle = "#000000";
            _this.context.beginPath();
            _this.context.moveTo(screenCoordinates.x, screenCoordinates.y);
            _this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            _this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            _this.context.lineTo(screenCoordinates.x, screenCoordinates.y + kTileSide * 2);
            _this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            _this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            _this.context.lineTo(screenCoordinates.x, screenCoordinates.y);
            _this.context.closePath();
            _this.context.fill();
            _this.context.stroke();
            if (hex.getType() !== 0 /* Water */ && hex.getType() !== 1 /* Desert */) {
                var fontSize = 20;
                _this.context.fillStyle = "#000000";
                _this.context.font = fontSize + "px 'segoe ui'";
                _this.context.textAlign = 'center';
                _this.context.fillText(hex.getNumber().toString(), screenCoordinates.x, screenCoordinates.y + kTileSide + fontSize / 2);
                _this.context.stroke();
            }
            // Draw tiles lit by probability
            var kWeightsByNumber = [0, 0, 1, 2, 3, 4, 5, 0, 5, 4, 3, 2, 1, 0];
            var weight = kWeightsByNumber[hex.getNumber()];
            var colorHex = (~~(255 * weight / 5)).toString(16);
            if (colorHex.length === 1)
                colorHex = "0" + colorHex;
            _this.context.fillStyle = "#" + colorHex + colorHex + colorHex;
            _this.context.setTransform(0.5, 0, 0, 0.5, 1000, 200);
            _this.context.strokeStyle = "#000000";
            _this.context.beginPath();
            _this.context.moveTo(screenCoordinates.x, screenCoordinates.y);
            _this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            _this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            _this.context.lineTo(screenCoordinates.x, screenCoordinates.y + kTileSide * 2);
            _this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            _this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            _this.context.lineTo(screenCoordinates.x, screenCoordinates.y);
            _this.context.closePath();
            _this.context.fill();
            _this.context.stroke();
        }, this);
    };
    return BoardRenderer;
})();
var MapGenerator = (function () {
    function MapGenerator() {
    }
    MapGenerator.prototype.randomizeBoard = function (board) {
        var tileCount = 0;
        board.forEach(function (tile) { return tileCount++; });
        board.forEach(function (tile) {
            if (tile.isBoundary())
                tile.setType(0 /* Water */);
        });
        var numbers = [];
        var types = [];
        for (var i = 0; i < tileCount * 1.5; i++) {
            var number = i % 10 + 2;
            if (number >= 7)
                number++;
            numbers.push(number);
            types.push(resourceTileTypes[i % resourceTileTypes.length]);
        }
        shuffle(numbers);
        types.push(1 /* Desert */);
        types.push(1 /* Desert */);
        shuffle(types);
        board.forEachInterior(function (tile, i) {
            tile.setType(types[i]);
            tile.setNumber(numbers[i]);
        });
    };
    MapGenerator.prototype.iterateBoard = function (board) {
        var initialInteriorTiles = board.getTiles();
        var initialScore = this.scoreBoard(board, initialInteriorTiles);
        var bestScore = initialScore;
        for (var i = 0; i < 10; i++) {
            var clone = board.clone();
            var cloneInteriorTiles = clone.getTiles();
            this.iterateBoardDispatcher(clone, cloneInteriorTiles);
            var cloneScore = this.scoreBoard(clone, cloneInteriorTiles);
            if (cloneScore < bestScore) {
                board = clone;
                bestScore = cloneScore;
            }
        }
        console.log("Iterated from " + initialScore + " to " + bestScore);
        return board;
    };
    MapGenerator.prototype.iterateBoardDispatcher = function (board, interiorTiles) {
        var operations = [
            this.iterateBoardSwapNumbers,
            this.iterateBoardSwapTypes
        ];
        operations[~~(Math.random() * operations.length)](board, interiorTiles);
    };
    MapGenerator.prototype.iterateBoardSwapNumbers = function (board, interiorTiles) {
        var first = interiorTiles[~~(Math.random() * interiorTiles.length)];
        var second = interiorTiles[~~(Math.random() * interiorTiles.length)];
        if (first.getType() === 0 /* Water */ || second.getType() === 0 /* Water */) {
            return;
        }
        var temp = first.getNumber();
        first.setNumber(second.getNumber());
        second.setNumber(temp);
    };
    MapGenerator.prototype.iterateBoardSwapTypes = function (board, interiorTiles) {
        var first = interiorTiles[~~(Math.random() * interiorTiles.length)];
        var second = interiorTiles[~~(Math.random() * interiorTiles.length)];
        if (first.getType() === 0 /* Water */ || second.getType() === 0 /* Water */) {
            return;
        }
        var temp = first.getType();
        first.setType(second.getType());
        second.setType(temp);
    };
    MapGenerator.prototype.scoreBoard = function (board, interiorTiles) {
        var _this = this;
        var kWeightsByNumber = [-1, -1, 1, 2, 3, 4, 5, -1, 5, 4, 3, 2, 1, -1];
        var score = 0;
        interiorTiles.forEach(function (tileA) {
            var hexPower = 0;
            interiorTiles.forEach(function (tileB) {
                if (tileA !== tileB) {
                    var weight = kWeightsByNumber[tileA.getNumber()] * kWeightsByNumber[tileB.getNumber()];
                    var multiplier = _this.rateHexPair(tileA, tileB);
                    hexPower += Math.pow(weight * multiplier, 2);
                }
            }, _this);
            score += hexPower; //Math.pow(hexPower, 2);
        }, this);
        return score;
    };
    MapGenerator.prototype.rateHexPair = function (a, b) {
        if (a.getType() > b.getType()) {
            return this.rateHexPair(b, a);
        }
        var distance = a.getPosition().distanceFrom(b.getPosition());
        if (distance > 3) {
            return 0;
        }
        var weight = 1 / Math.pow(a.getPosition().distanceFrom(b.getPosition()), 2);
        var aType = a.getType();
        var bType = b.getType();
        /* Desert, Wood, Clay, Sheep, Ore, Wheat
           Road = Wood Clay
           Settlement = Clay Wood Wheat Sheep
           City = Wheat Wheat Ore Ore Ore
           Dev = Sheap Wheat Ore
        */
        var multiplier = 1;
        if (aType === bType) {
            var stackBase = 2; //0.5;
            if (aType === 2 /* Wood */) {
                multiplier = 0.8 + stackBase;
            }
            else if (aType === 4 /* Sheep */) {
                multiplier = 0.8 + stackBase;
            }
            else if (aType === 6 /* Wheat */) {
                multiplier = 1.2 + stackBase;
            }
            else if (aType === 5 /* Ore */) {
                multiplier = 1.2 + stackBase;
            }
            else if (aType === 3 /* Clay */) {
                multiplier = 1.2 + stackBase;
            }
        }
        else if (aType === 2 /* Wood */ && bType === 3 /* Clay */) {
            multiplier = 2.0;
        }
        else if (aType === 5 /* Ore */ && bType === 6 /* Wheat */) {
            multiplier = 2.0;
        }
        if (aType === 1 /* Desert */) {
            return 0;
        }
        if (aType === 0 /* Water */) {
            multiplier = 8.0;
        }
        return 1 + multiplier * weight;
    };
    return MapGenerator;
})();
var Application = (function () {
    function Application(canvas) {
        this.canvas = canvas;
    }
    Application.prototype.run = function () {
        this.context = this.canvas.getContext("2d");
        var boardGenerator = new BoardGenerator();
        var board = boardGenerator.generateCircularBoard(4);
        var mapGenerator = new MapGenerator();
        mapGenerator.randomizeBoard(board);
        var boardRenderer = new BoardRenderer(this.canvas, this.context);
        boardRenderer.render(board);
        setInterval(function () {
            board = mapGenerator.iterateBoard(board);
            boardRenderer.render(board);
        }, 10);
    };
    return Application;
})();
function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
        ;
    return o;
}
;
