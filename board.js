var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var kTileSide = 50;
var g = this;
var TileType;
(function (TileType) {
    TileType[TileType["Water"] = 0] = "Water";
    TileType[TileType["Desert"] = 1] = "Desert";
    TileType[TileType["Gold"] = 2] = "Gold";
    TileType[TileType["Wood"] = 3] = "Wood";
    TileType[TileType["Clay"] = 4] = "Clay";
    TileType[TileType["Sheep"] = 5] = "Sheep";
    TileType[TileType["Ore"] = 6] = "Ore";
    TileType[TileType["Wheat"] = 7] = "Wheat";
    TileType[TileType["Undefined"] = 8] = "Undefined";
    TileType[TileType["Wildcard"] = 9] = "Wildcard";
})(TileType || (TileType = {}));
var kTileColors = [];
kTileColors[TileType.Water] = "#00B7FF";
kTileColors[TileType.Desert] = "#FFF09E";
kTileColors[TileType.Gold] = "#FFE100";
kTileColors[TileType.Wood] = "#39AD43";
kTileColors[TileType.Clay] = "#FF9100";
kTileColors[TileType.Sheep] = "#BBFF00";
kTileColors[TileType.Ore] = "#D1D1D1";
kTileColors[TileType.Wheat] = "#FFFF00";
var kTileLetters = [];
kTileLetters[TileType.Water] = "w";
kTileLetters[TileType.Desert] = "d";
kTileLetters[TileType.Gold] = "G";
kTileLetters[TileType.Wood] = "W";
kTileLetters[TileType.Clay] = "C";
kTileLetters[TileType.Sheep] = "S";
kTileLetters[TileType.Ore] = "O";
kTileLetters[TileType.Wheat] = "H";
var kWeightsByNumber = [0, 0, 1, 2, 3, 4, 5, 0, 5, 4, 3, 2, 1, 0];
var kDesiredNumberDistribution = [
    2,
    3, 3,
    4, 4,
    5, 5, 5,
    6, 6,
    8, 8,
    9, 9, 9,
    10, 10,
    11, 11,
    12
];
var allTileTypes = [TileType.Water, TileType.Desert, TileType.Wood, TileType.Clay, TileType.Sheep, TileType.Ore, TileType.Wheat];
var interiorTileTypes = [TileType.Desert, TileType.Gold, TileType.Wood, TileType.Clay, TileType.Sheep, TileType.Ore, TileType.Wheat];
var resourceTileTypes = [TileType.Wood, TileType.Clay, TileType.Sheep, TileType.Ore, TileType.Wheat];
var portTileTypes = __spreadArray(__spreadArray([], resourceTileTypes, true), [TileType.Wildcard], false);
var GridLocation = /** @class */ (function () {
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
    GridLocation.prototype.offsetBy = function (o) {
        return new GridLocation(this.x + o.dx, this.y + o.dy, this.z + o.dz);
    };
    GridLocation.prototype.toString = function () {
        return "at".concat(this.x, "_").concat(this.y, "_").concat(this.z);
    };
    return GridLocation;
}());
var GridDirection = /** @class */ (function () {
    function GridDirection(dx, dy, dz) {
        if (dx === void 0) { dx = 0; }
        if (dy === void 0) { dy = 0; }
        if (dz === void 0) { dz = 0; }
        this.dx = dx;
        this.dy = dy;
        this.dz = dz;
    }
    GridDirection.prototype.toString = function () {
        return "dir".concat(this.dx, "_").concat(this.dy, "_").concat(this.dz);
    };
    return GridDirection;
}());
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    return Vec2;
}());
var kNeighborOffsets = [
    new GridDirection(1, -1, 0),
    new GridDirection(1, 0, -1),
    new GridDirection(-1, 1, 0),
    new GridDirection(-1, 0, 1),
    new GridDirection(0, 1, -1),
    new GridDirection(0, -1, 1)
];
var Board = /** @class */ (function () {
    function Board(hexesXy, ports) {
        this.hexesXy = hexesXy;
        this.ports = ports;
    }
    Board.prototype.getHexesXy = function () { return this.hexesXy; };
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
        return new Board(newHexesXy, __assign({}, this.ports));
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
    Board.prototype.getEdgeTiles = function () {
        var _this = this;
        var edgeTiles = new Array();
        this.forEach(function (tile) {
            var neighbors = _this.getNeighbors(tile);
            var hasWaterNeighbor = false;
            neighbors.forEach(function (n) {
                if (n.getType() === TileType.Water) {
                    hasWaterNeighbor = true;
                }
            });
            if (hasWaterNeighbor && tile.getType() != TileType.Water) {
                edgeTiles.push(tile);
            }
        });
        return edgeTiles;
    };
    Board.prototype.getShorelines = function () {
        var _this = this;
        var edgeTiles = this.getEdgeTiles();
        var shorelines = [];
        edgeTiles.forEach(function (tile) {
            var p = tile.getPosition();
            kNeighborOffsets.forEach(function (offset) {
                var q = p.offsetBy(offset);
                var n = _this.getTileWithLocation(q);
                if (n.getType() === TileType.Water) {
                    shorelines.push(new Shoreline(tile, offset));
                }
            });
        });
        return shorelines;
    };
    Board.prototype.getTileWithLocation = function (p) {
        return this.getTile(p.x, p.y, p.z);
    };
    Board.prototype.getTile = function (x, y, z) {
        if (typeof (z) !== "undefined") {
            if (x + y + z !== 0) {
                throw new Error("Invalid tile coordinate!");
            }
        }
        var yLine = this.hexesXy.get(x);
        if (yLine === null) {
            return null;
        }
        else {
            return yLine.get(y);
        }
    };
    Board.prototype.getNeighbors = function (tile) {
        var neighbors = new Array();
        var candidates = [];
        var position = tile.getPosition();
        candidates.push(this.getTile(position.x + 1, position.y - 1, position.z));
        candidates.push(this.getTile(position.x + 1, position.y, position.z - 1));
        candidates.push(this.getTile(position.x - 1, position.y + 1, position.z));
        candidates.push(this.getTile(position.x - 1, position.y, position.z + 1));
        candidates.push(this.getTile(position.x, position.y + 1, position.z - 1));
        candidates.push(this.getTile(position.x, position.y - 1, position.z + 1));
        candidates.forEach(function (candidate) {
            if (candidate) {
                neighbors.push(candidate);
            }
        });
        return neighbors;
    };
    return Board;
}());
var BoardGenerator = /** @class */ (function () {
    function BoardGenerator() {
    }
    BoardGenerator.prototype.generateCircularBoard = function (n) {
        if (n === void 0) { n = 3; }
        var hexesXy = new BoardDimension(-n, n);
        for (var x = -n; x <= n; x++) {
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
        return new Board(hexesXy, []);
    };
    return BoardGenerator;
}());
var BoardDimension = /** @class */ (function () {
    function BoardDimension(minIndex, maxIndex) {
        this.minIndex = minIndex;
        this.maxIndex = maxIndex;
        this.arr = new Array(maxIndex - minIndex + 1);
    }
    BoardDimension.prototype.put = function (index, value) {
        this.arr[index - this.minIndex] = value;
    };
    BoardDimension.prototype.get = function (index) {
        if (this.minIndex <= index && index <= this.maxIndex) {
            return this.arr[index - this.minIndex];
        }
        else {
            return null;
        }
    };
    BoardDimension.prototype.getLowerIndex = function () { return this.minIndex; };
    BoardDimension.prototype.getUpperIndex = function () { return this.maxIndex; };
    return BoardDimension;
}());
var Hex = /** @class */ (function () {
    function Hex(position, boundary) {
        this.position = position;
        this.boundary = boundary;
        this.type = TileType.Undefined;
        this.number = 0;
    }
    Hex.prototype.isBoundary = function () { return this.boundary; };
    Hex.prototype.getPosition = function () { return this.position; };
    Hex.prototype.getType = function () { return this.type; };
    Hex.prototype.setType = function (value) { this.type = value; };
    Hex.prototype.getNumber = function () { return this.number; };
    Hex.prototype.setNumber = function (value) { this.number = value; };
    Hex.prototype.clone = function () {
        var newHex = new Hex(new GridLocation(this.position.x, this.position.y, this.position.z), this.boundary);
        newHex.setType(this.getType());
        newHex.setNumber(this.getNumber());
        return newHex;
    };
    return Hex;
}());
var Shoreline = /** @class */ (function () {
    function Shoreline(hex, direction) {
        this.hex = hex;
        this.direction = direction;
    }
    Shoreline.prototype.buildKey = function () {
        return this.hex.getPosition().toString() + "" + this.direction.toString();
    };
    return Shoreline;
}());
var BoardRenderer = /** @class */ (function () {
    function BoardRenderer(canvas, context) {
        this.canvas = canvas;
        this.context = context;
    }
    BoardRenderer.prototype.render = function (board, iterations, scrollingGraph) {
        var _this = this;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, 100, 50);
        var fontSize = 20;
        this.context.fillStyle = "#000000";
        this.context.font = fontSize + "px 'segoe ui'";
        this.context.textAlign = 'left';
        this.context.fillText(iterations.toString(), 10, fontSize);
        this.context.stroke();
        this.context.setTransform(1, 0, 0, 1, 1000, 550);
        this.context.fillStyle = "#000000";
        var tilesByNumber = {};
        var tilesByType = {};
        board.forEachInterior(function (tile) {
            var tileNumber = tile.getNumber();
            var tileType = tile.getType();
            if (typeof (tilesByNumber[tileNumber]) === "undefined") {
                tilesByNumber[tileNumber] = [];
            }
            if (typeof (tilesByType[tileType]) === "undefined") {
                tilesByType[tileType] = [];
            }
            var numberGroup = tilesByNumber[tileNumber];
            numberGroup.push(tile);
            var typeGroup = tilesByType[tileType];
            typeGroup.push(tile);
        });
        for (var i = 2; i <= 12; i++) {
            var fontSize = 20;
            this.context.fillStyle = "#000000";
            this.context.textAlign = 'right';
            var rowY = fontSize * (i - 2);
            this.context.fillText(i.toString(), 0, rowY);
            this.context.stroke();
            var group = tilesByNumber[i] || [];
            if (group) {
                group.sort(function (a, b) {
                    if (a.getType() < b.getType()) {
                        return -1;
                    }
                    else if (a.getType() > b.getType()) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });
                for (var j = 0; j < group.length; j++) {
                    var tile = group[j];
                    this.context.fillStyle = kTileColors[tile.getType()];
                    this.context.fillRect(5 + j * 12, rowY - (fontSize - 10), 10, 10);
                }
            }
        }
        var maximumTypeCount = 1; // can't be 0 or div by 0
        for (var i = 0; i < interiorTileTypes.length; i++) {
            if (tilesByType[interiorTileTypes[i]]) {
                var group = tilesByType[interiorTileTypes[i]];
                var frequencySum = 0;
                for (var j = 0; j < group.length; j++) {
                    var tile = group[j];
                    frequencySum += kWeightsByNumber[tile.getNumber()];
                }
                if (maximumTypeCount < frequencySum) {
                    maximumTypeCount = frequencySum;
                }
            }
        }
        this.context.setTransform(1, 0, 0, 1, 1100, 500);
        var typeFrequencyGraphHeight = 100;
        this.context.fillStyle = "#444444";
        this.context.fillRect(0, 0, 100, typeFrequencyGraphHeight);
        for (var i = 0; i < interiorTileTypes.length; i++) {
            var fontSize = 20;
            this.context.fillStyle = "#000000";
            this.context.textAlign = 'left';
            var tileType = interiorTileTypes[i];
            var group = tilesByType[tileType] || [];
            var groupSum = 0;
            for (var j = 0; j < group.length; j++) {
                groupSum += kWeightsByNumber[group[j].getNumber()];
            }
            if (groupSum > maximumTypeCount) {
                alert("! " + groupSum + " " + maximumTypeCount);
            }
            this.context.fillStyle = kTileColors[tileType];
            var blockHeight = typeFrequencyGraphHeight * (groupSum / maximumTypeCount);
            this.context.fillRect(10 * i, typeFrequencyGraphHeight - blockHeight, 10, blockHeight);
        }
        this.context.setTransform(1, 0, 0, 1, 1100, 650);
        scrollingGraph.render(this.context, 0, 0, 200, 100);
        board.forEach(function (hex) {
            _this.context.setTransform(1, 0, 0, 1, 500, 400);
            _this.context.strokeStyle = "#000000";
            _this.context.fillStyle = kTileColors[hex.getType()] || "#FF00FF";
            _this.hexPath(hex);
            _this.context.fill();
            _this.context.stroke();
            if (hex.getType() !== TileType.Water && hex.getType() !== TileType.Desert) {
                var screenCoordinates = hex.getPosition().toScreenCoordinates();
                var fontSize = 20;
                _this.context.fillStyle = "#000000";
                _this.context.font = fontSize + "px 'segoe ui'";
                _this.context.textAlign = 'center';
                _this.context.fillText(hex.getNumber().toString(), screenCoordinates.x, screenCoordinates.y + kTileSide + fontSize / 2);
                _this.context.stroke();
            }
            // Draw tiles lit by probability
            var weight = kWeightsByNumber[hex.getNumber()];
            var colorHex = (~~(255 * weight / 5)).toString(16);
            if (colorHex.length === 1)
                colorHex = "0" + colorHex;
            _this.context.setTransform(0.5, 0, 0, 0.5, 1150, 200);
            _this.context.strokeStyle = "#000000";
            _this.context.fillStyle = "#" + colorHex + colorHex + colorHex;
            _this.hexPath(hex);
            _this.context.fill();
            _this.context.stroke();
        }, this);
        var shorelines = board.getShorelines();
        shorelines.forEach(function (shoreline) {
            var hex = shoreline.hex;
            var hexPosition = hex.getPosition();
            var direction = shoreline.direction;
            var neighbor = board.getTileWithLocation(hexPosition.offsetBy(direction));
            var positionA = hexPosition.toScreenCoordinates();
            var positionB = neighbor.getPosition().toScreenCoordinates();
            _this.context.setTransform(1, 0, 0, 1, 500, 400);
            _this.context.strokeStyle = "#000000";
            _this.context.beginPath();
            _this.context.moveTo(positionA.x, positionA.y + kTileSide);
            _this.context.lineTo(positionB.x, positionB.y + kTileSide);
            _this.context.closePath();
            _this.context.stroke();
        });
    };
    BoardRenderer.prototype.hexPath = function (hex) {
        var position = hex.getPosition();
        var screenCoordinates = position.toScreenCoordinates();
        this.context.beginPath();
        this.context.moveTo(screenCoordinates.x, screenCoordinates.y);
        this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
        this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
        this.context.lineTo(screenCoordinates.x, screenCoordinates.y + kTileSide * 2);
        this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
        this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
        this.context.lineTo(screenCoordinates.x, screenCoordinates.y);
        this.context.closePath();
    };
    return BoardRenderer;
}());
var IterationDebugInfo = /** @class */ (function () {
    function IterationDebugInfo() {
    }
    return IterationDebugInfo;
}());
var IterationResult = /** @class */ (function () {
    function IterationResult(board, score) {
        this.board = board;
        this.score = score;
    }
    return IterationResult;
}());
var MapGenerator = /** @class */ (function () {
    function MapGenerator() {
    }
    MapGenerator.prototype.randomizeBoard = function (board, interiorWaterFraction) {
        if (interiorWaterFraction === void 0) { interiorWaterFraction = 0.0; }
        var desertCount = 2;
        var interiorTileCount = 0;
        board.forEachInterior(function (tile) { return interiorTileCount++; });
        board.forEach(function (tile) { if (tile.isBoundary())
            tile.setType(TileType.Water); });
        var waterTileCount = ~~(interiorWaterFraction * interiorTileCount);
        var nonwaterTileCount = interiorTileCount - waterTileCount;
        var resourceTileCount = interiorTileCount - waterTileCount - desertCount;
        var numberNormalize = 0.8;
        var numbers = [];
        shuffle(kDesiredNumberDistribution);
        for (var i = 0; i < ~~(resourceTileCount * numberNormalize); i++) {
            // var number = i % 10 + 2;
            // if (number >= 7) number++;
            var number = kDesiredNumberDistribution[i % kDesiredNumberDistribution.length];
            numbers.push(number);
        }
        while (numbers.length < resourceTileCount) {
            var number = ~~(Math.random() * 10) + 2;
            if (number >= 7)
                number++;
            numbers.push(number);
        }
        if (numbers.length != resourceTileCount) {
            throw new Error("Check number distribution code: " + numbers.length + " " + resourceTileCount);
        }
        var types = [TileType.Desert, TileType.Desert, TileType.Gold, TileType.Gold, TileType.Gold];
        var typeNormalize = 0.8;
        var requiredTilesPerType = ~~(typeNormalize * (nonwaterTileCount - types.length) / resourceTileTypes.length);
        for (var i = 0; i < resourceTileTypes.length; i++) {
            for (var j = 0; j < requiredTilesPerType; j++) {
                types.push(resourceTileTypes[i]);
            }
        }
        while (types.length < nonwaterTileCount) {
            types.push(resourceTileTypes[~~(Math.random() * resourceTileTypes.length)]);
        }
        if (types.length != nonwaterTileCount) {
            throw new Error("Check nonwater distribution code: " + types.length + " " + nonwaterTileCount);
        }
        shuffle(numbers);
        shuffle(types);
        for (var i = 0; i < waterTileCount; i++) {
            types.push(TileType.Water);
        }
        shuffle(types);
        if (types.length != interiorTileCount) {
            throw new Error("Check distribution code: " + types.length + " " + interiorTileCount);
        }
        var numberIndex = 0;
        board.forEachInterior(function (tile, i) {
            tile.setType(types[i]);
            if (types[i] === TileType.Water || types[i] === TileType.Desert) {
                tile.setNumber(0);
            }
            else {
                tile.setNumber(numbers[numberIndex++]);
            }
        });
        var shorelines = board.getShorelines();
        console.log("SHORELINES", shorelines);
        return board;
    };
    MapGenerator.prototype.iterateBoard = function (board, iterations) {
        if (iterations === void 0) { iterations = 10; }
        var initialTiles = board.getTiles();
        var edgeTiles = board.getEdgeTiles();
        var shorelines = board.getShorelines();
        var initialScore = this.scoreBoard(board, initialTiles);
        var bestScore = initialScore;
        for (var i = 0; i < iterations; i++) {
            var clone = board.clone();
            var cloneTiles = clone.getTiles();
            var cloneInteriorTiles = clone.getInteriorTiles();
            this.iterateBoardDispatcher(clone, cloneInteriorTiles);
            var cloneScore = this.scoreBoard(clone, cloneTiles);
            if (cloneScore < bestScore) {
                board = clone;
                bestScore = cloneScore;
            }
        }
        console.log("Iterated from " + initialScore + " to " + bestScore);
        return new IterationResult(board, bestScore);
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
        if (first.getType() === TileType.Water || second.getType() === TileType.Water ||
            first.getType() === TileType.Desert || second.getType() === TileType.Desert) {
            return;
        }
        var temp = first.getNumber();
        first.setNumber(second.getNumber());
        second.setNumber(temp);
    };
    MapGenerator.prototype.iterateBoardSwapTypes = function (board, interiorTiles) {
        var first = interiorTiles[~~(Math.random() * interiorTiles.length)];
        var second = interiorTiles[~~(Math.random() * interiorTiles.length)];
        if (first.getType() === TileType.Water || second.getType() === TileType.Water) {
            return;
        }
        if (first.getType() === TileType.Desert || second.getType() === TileType.Desert) {
            var firstValue = first.getNumber();
            first.setNumber(second.getNumber());
            second.setNumber(firstValue);
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
                    var weight = kWeightsByNumber[tileA.getNumber()] + kWeightsByNumber[tileB.getNumber()];
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
        if (distance >= 1.9) {
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
            if (aType === TileType.Gold) {
                multiplier = 100.0;
            }
            else if (aType === TileType.Wood) {
                multiplier = 1.8;
            }
            else if (aType === TileType.Sheep) {
                multiplier = 2.8;
            }
            else if (aType === TileType.Wheat) {
                multiplier = 2.5;
            }
            else if (aType === TileType.Ore) {
                multiplier = 2.8;
            }
            else if (aType === TileType.Clay) {
                multiplier = 1.8;
            }
        }
        else if (aType === TileType.Wood && bType === TileType.Clay) {
            multiplier = 1.8;
        }
        else if (aType === TileType.Ore && bType === TileType.Wheat) {
            multiplier = 1.8;
        }
        else if (aType === TileType.Desert) {
            multiplier = 0.0;
        }
        else if (aType === TileType.Water) {
            multiplier = 3;
            //         multiplier = 8.0;
        }
        else if (aType === TileType.Gold) {
            var distanceFrom7 = Math.abs(a.getNumber() - 7);
            // discourage 6/8 and 2/12 golds. Bias toward 3s.
            //            7   6    5    4    3    2
            multiplier = [-1, 1.3, 1.2, 1.2, 1.1, 1.6][distanceFrom7];
        }
        else if (aType === TileType.Sheep && (bType === TileType.Wheat || bType === TileType.Ore)) {
            multiplier = 1.2;
        }
        if (a.getNumber() === b.getNumber() && distance === 1) {
            multiplier *= 20;
        }
        return 1 + multiplier * weight;
    };
    return MapGenerator;
}());
var SlidingGraph = /** @class */ (function () {
    function SlidingGraph(width, height) {
        this.width = width;
        this.height = height;
        this.currentX = 0;
        this.scale = 1;
        this.isSliding = false;
        this.canvas = document.createElement("canvas");
        this.canvas.width = width + "";
        this.canvas.height = width + "";
        this.context = this.canvas.getContext("2d");
    }
    SlidingGraph.prototype.push = function (value) {
        if (value > this.scale) {
            var ratio = this.scale / value;
            var rescaledHeight = ~~(this.height * ratio);
            this.context.drawImage(this.canvas, 0, this.height - rescaledHeight, this.width, rescaledHeight);
            this.scale = value;
        }
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(this.currentX, 0, 1, this.height);
        var renderedHeight = this.height * (value / this.scale);
        this.context.fillStyle = "#000000";
        this.context.fillRect(this.currentX, this.height - renderedHeight, 1, renderedHeight);
        this.currentX++;
        if (this.currentX > this.width) {
            this.currentX = 0;
            this.isSliding = true;
        }
    };
    SlidingGraph.prototype.render = function (ctx, x, y, w, h) {
        if (!this.isSliding) {
            ctx.drawImage(this.canvas, 0, 0, this.width, this.height, x, y, w, h);
        }
        else {
            ctx.drawImage(this.canvas, this.currentX + 1, 0, this.width - this.currentX - 1, this.height, x, y, w * (this.width - this.currentX) / this.width, h); // * (1 - (this.currentX / this.width)), h);
            ctx.drawImage(this.canvas, 0, 0, this.currentX, this.height, x + w * (this.width - this.currentX) / this.width, y, w * (this.currentX / this.width), h);
        }
    };
    return SlidingGraph;
}());
var Application = /** @class */ (function () {
    function Application(canvas) {
        this.canvas = canvas;
    }
    Application.prototype.run = function () {
        this.context = this.canvas.getContext("2d");
        var boardGenerator = new BoardGenerator();
        var board = boardGenerator.generateCircularBoard(4);
        var mapGenerator = new MapGenerator();
        mapGenerator.randomizeBoard(board, 0.15);
        var boardRenderer = new BoardRenderer(this.canvas, this.context);
        var scrollingGraph = new SlidingGraph(200, 100);
        var iterations = 0;
        g.board = board;
        setInterval(function () {
            var iterationsPerFrame = 10;
            var iterationResult = mapGenerator.iterateBoard(board, iterationsPerFrame);
            board = iterationResult.board;
            scrollingGraph.push(iterationResult.score);
            iterations += iterationsPerFrame;
            boardRenderer.render(board, iterations, scrollingGraph);
        }, 1);
    };
    return Application;
}());
function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
        ;
    return o;
}
;
