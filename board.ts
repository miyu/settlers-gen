var kTileSide: number = 50;
var g = this;

enum TileType {
   Water,
   Desert,
   Gold,
   Wood,
   Clay,
   Sheep,
   Ore,
   Wheat,
   Undefined
}

var kTileColors = [];
kTileColors[TileType.Water]  = "#00B7FF";
kTileColors[TileType.Desert] = "#FFF09E";
kTileColors[TileType.Gold]   = "#FFE100";
kTileColors[TileType.Wood]   = "#39AD43";
kTileColors[TileType.Clay]   = "#FF9100";
kTileColors[TileType.Sheep]  = "#BBFF00";
kTileColors[TileType.Ore]    = "#D1D1D1";
kTileColors[TileType.Wheat]  = "#FFFF00";

var allTileTypes = [TileType.Water, TileType.Desert, TileType.Wood, TileType.Clay, TileType.Sheep, TileType.Ore, TileType.Wheat];
var interiorTileTypes = [TileType.Desert, TileType.Wood, TileType.Clay, TileType.Sheep, TileType.Ore, TileType.Wheat];
var resourceTileTypes = [TileType.Wood, TileType.Clay, TileType.Sheep, TileType.Ore, TileType.Wheat];

class GridLocation {
   constructor(
      public x: number = 0,
      public y: number = 0,
      public z: number = 0
   ) { }

   public toScreenCoordinates(): Vec2 {
      // pointy-top:
      var x = kTileSide * Math.sqrt(3) * (this.x + this.y / 2);
      var y = kTileSide * 1.5 * this.y;
      return new Vec2(x, y);
   }

   public distanceFrom(o: GridLocation): number {
      return (Math.abs(this.x - o.x) + Math.abs(this.y - o.y) + Math.abs(this.z - o.z)) / 2;
   }
}

class Vec2 {
   constructor(
      public x: number = 0,
      public y: number = 0
   ) { }
}

class Board {
   constructor(private hexesXy: BoardDimension<BoardDimension<Hex>>) { }

   public getHexesXy() { return this.hexesXy; }

   public forEach(f, context?: any): void {
      var i = 0;
      for (var x = this.hexesXy.getLowerIndex(); x <= this.hexesXy.getUpperIndex(); x++) {
         var yLine = this.hexesXy.get(x);
         for (var y = yLine.getLowerIndex(); y <= yLine.getUpperIndex(); y++) {
            var hex = yLine.get(y);
            f.apply(context || this, [hex, i, x, y]);
            i++;
         }
      }
   }

   public forEachInterior(f, context?: any): void {
      var i = 0;
      for (var x = this.hexesXy.getLowerIndex() + 1; x <= this.hexesXy.getUpperIndex() - 1; x++) {
         var yLine = this.hexesXy.get(x);
         for (var y = yLine.getLowerIndex() + 1; y <= yLine.getUpperIndex() - 1; y++) {
            var hex = yLine.get(y);
            f.apply(context || this, [hex, i, x, y]);
            i++;
         }
      }
   }

   public clone(): Board {
      var newHexesXy = new BoardDimension<BoardDimension<Hex>>(this.hexesXy.getLowerIndex(), this.hexesXy.getUpperIndex());
      for (var x = newHexesXy.getLowerIndex(); x <= newHexesXy.getUpperIndex(); x++) {
         var yLine = this.hexesXy.get(x);
         var newYLine = new BoardDimension<Hex>(yLine.getLowerIndex(), yLine.getUpperIndex());
         for (var y = yLine.getLowerIndex(); y <= yLine.getUpperIndex(); y++) {
            newYLine.put(y, yLine.get(y).clone());
         }
         newHexesXy.put(x, newYLine);
      }
      return new Board(newHexesXy);
   }

   public getTiles(): Array<Hex> {
      var result = new Array<Hex>();
      this.forEach(tile => result.push(tile));
      return result;
   }

   public getInteriorTiles(): Array<Hex> {
      var result = new Array<Hex>();
      this.forEachInterior(tile => result.push(tile));
      return result;
   }

   public getTile(x: number, y: number, z?: number): Hex {
      if (typeof(z) !== "undefined") {
         if (x + y + z !== 0) {
            throw new Error("Invalid tile coordinate!");
         }
      }

      var yLine = this.hexesXy.get(x);
      if (yLine === null) {
         return null;
      } else {
         return yLine.get(y);
      }
   }

   public getNeighbors(tile: Hex): Array<Hex> {
      var neighbors = new Array<Hex>();
      var candidates = [];
      var position = tile.getPosition();
      candidates.push(this.getTile(position.x + 1, position.y - 1, position.z));
      candidates.push(this.getTile(position.x + 1, position.y, position.z - 1));
      candidates.push(this.getTile(position.x - 1, position.y + 1, position.z));
      candidates.push(this.getTile(position.x - 1, position.y, position.z + 1));
      candidates.push(this.getTile(position.x, position.y + 1, position.z - 1));
      candidates.push(this.getTile(position.x, position.y - 1, position.z + 1));
      candidates.forEach(candidate => {
         if (candidate) {
            neighbors.push(candidate);
         }
      });
      return neighbors;
   }
}

class BoardGenerator {
   public generateCircularBoard(n: number = 3): Board {
      var hexesXy = new BoardDimension<BoardDimension<Hex>>(-n, n);
      for (var x = -n; x <= n; x++) {
         var minY = Math.max(-n, -x - n);
         var maxY = Math.min(n, -x + n);
         var hexesY = new BoardDimension<Hex>(minY, maxY);
         for (var y = hexesY.getLowerIndex(); y <= hexesY.getUpperIndex(); y++) {
            var z = - x - y;
            var position = new GridLocation(x, y, z);
            var boundary = y === hexesY.getLowerIndex() || y === hexesY.getUpperIndex() || x === -n || x === n;
            hexesY.put(y, new Hex(position, boundary));
         }
         hexesXy.put(x, hexesY);
      }
      return new Board(hexesXy);
   }
}

class BoardDimension<T> {
   private arr: Array<T>;

   constructor(
      private minIndex: number,
      private maxIndex: number
   ) {
      this.arr = new Array<T>(maxIndex - minIndex + 1);
   }

   public put(index: number, value: T) {
      this.arr[index - this.minIndex] = value;
   }

   public get(index: number) {
      if (this.minIndex <= index && index <= this.maxIndex) {
         return this.arr[index - this.minIndex];
      } else {
         return null;
      }
   }

   public getLowerIndex(): number { return this.minIndex; }
   public getUpperIndex(): number { return this.maxIndex; }
}

class Hex {
   private type: TileType = TileType.Undefined;
   private number: number = 0;

   constructor(private position: GridLocation, private boundary: Boolean) { }

   public isBoundary(): Boolean { return this.boundary; }
   public getPosition(): GridLocation { return this.position; }
   public getType(): TileType { return this.type; }
   public setType(value: TileType): void { this.type = value; }
   public getNumber(): number { return this.number; }
   public setNumber(value: number): void { this.number = value; }

   public clone(): Hex {
      var newHex = new Hex(new GridLocation(this.position.x, this.position.y, this.position.z), this.boundary);
      newHex.setType(this.getType());
      newHex.setNumber(this.getNumber());
      return newHex;
   }
}

class BoardRenderer {
   constructor(private canvas: any, private context: any) {
      
   }

   public render(board: Board): void {
      board.forEach(
         (hex) => {
            var position = hex.getPosition();
            var screenCoordinates = position.toScreenCoordinates();
            this.context.fillStyle = kTileColors[hex.getType()] || "#FF00FF";
            this.context.setTransform(1, 0, 0, 1, 500, 400);

            this.context.strokeStyle = "#000000";
            this.context.beginPath();
            this.context.moveTo(screenCoordinates.x, screenCoordinates.y);
            this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            this.context.lineTo(screenCoordinates.x, screenCoordinates.y + kTileSide * 2);
            this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            this.context.lineTo(screenCoordinates.x, screenCoordinates.y);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();

            if (hex.getType() !== TileType.Water && hex.getType() !== TileType.Desert) {
               var fontSize = 20;
               this.context.fillStyle = "#000000";
               this.context.font = fontSize + "px 'segoe ui'";
               this.context.textAlign = 'center';
               this.context.fillText(hex.getNumber().toString(), screenCoordinates.x, screenCoordinates.y + kTileSide + fontSize / 2);
               this.context.stroke();
            }

            // Draw tiles lit by probability
            var kWeightsByNumber = [0, 0, 1, 2, 3, 4, 5, 0, 5, 4, 3, 2, 1, 0];
            var weight = kWeightsByNumber[hex.getNumber()];
            var colorHex = (~~(255 * weight / 5)).toString(16);
            if (colorHex.length === 1) colorHex = "0" + colorHex;
            this.context.fillStyle = "#" + colorHex + colorHex + colorHex;
            this.context.setTransform(0.5, 0, 0, 0.5, 1150, 200);
            this.context.strokeStyle = "#000000";
            this.context.beginPath();
            this.context.moveTo(screenCoordinates.x, screenCoordinates.y);
            this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            this.context.lineTo(screenCoordinates.x + kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            this.context.lineTo(screenCoordinates.x, screenCoordinates.y + kTileSide * 2);
            this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2 + kTileSide);
            this.context.lineTo(screenCoordinates.x - kTileSide * Math.sqrt(3) / 2, screenCoordinates.y + kTileSide / 2);
            this.context.lineTo(screenCoordinates.x, screenCoordinates.y);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();

         }, this
      );
   }
}

class MapGenerator {
   public randomizeBoard(board: Board, interiorWaterFraction: number = 0.0): void {
      var interiorTileCount = 0;
      board.forEachInterior(tile => interiorTileCount++);
      board.forEach(tile => { if (tile.isBoundary()) tile.setType(TileType.Water); });
      
      var numbers = [];
      var types = [];
      for (var i = 0; i < interiorTileCount * 1.5; i++) {
         var number = i % 10 + 2;
         if (number >= 7) number ++;
         numbers.push(number);
      }

      var normalize = 0.5;
      for (var i = 0; i < resourceTileTypes.length; i++) {
         for (var j = 0; j < (interiorTileCount / resourceTileTypes.length) * normalize; j++) {
            types.push(resourceTileTypes[i]);
         }
      }
      while (types.length < interiorTileCount) {
         types.push(resourceTileTypes[~~(Math.random() * resourceTileTypes.length)]);
      }

      shuffle(numbers);
      shuffle(types);
      for (var i = 0; i < interiorWaterFraction * interiorTileCount; i++) {
         types.shift();
         types.push(TileType.Water);
      }
      types.shift();
      types.shift();
      types.shift();
      types.shift();
      types.shift();
      types.push(TileType.Desert);
      types.push(TileType.Desert);
      types.push(TileType.Gold);
      types.push(TileType.Gold);
      types.push(TileType.Gold);
      shuffle(types);
      
      board.forEachInterior(
         (tile, i) => {
            tile.setType(types[i]);
            tile.setNumber(numbers[i]);
         });
   }

   private getBoardEdgeTiles(board: Board) {
      var edgeTiles = new Array<Hex>();
      board.forEach(tile => {
         var neighbors = board.getNeighbors(tile);
         var hasWaterNeighbor = false;
         neighbors.forEach(n => {
            if (n.getType() === TileType.Water) {
               hasWaterNeighbor = true;
            }
         });
         if (hasWaterNeighbor && tile.getType() != TileType.Water) {
            edgeTiles.push(tile);
         }
      });
      return edgeTiles;
   }
   
   public iterateBoard(board: Board, iterations: number = 10): Board {
      var initialInteriorTiles = board.getTiles();
      var edgeTiles = this.getBoardEdgeTiles(board);
      var initialScore = this.scoreBoard(board, initialInteriorTiles);
      var bestScore = initialScore;
      for (var i = 0; i < iterations; i++) {
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
   }

   public iterateBoardDispatcher(board: Board, interiorTiles: Array<Hex>) {
      var operations = [
         this.iterateBoardSwapNumbers,
         this.iterateBoardSwapTypes
      ];
      operations[~~(Math.random() * operations.length)](board, interiorTiles);
   }

   public iterateBoardSwapNumbers(board: Board, interiorTiles: Array<Hex>) {
      var first = interiorTiles[~~(Math.random() * interiorTiles.length)];
      var second = interiorTiles[~~(Math.random() * interiorTiles.length)];

      if (first.getType() === TileType.Water || second.getType() === TileType.Water) {
         return;
      }

      var temp = first.getNumber();
      first.setNumber(second.getNumber());
      second.setNumber(temp);
   }

   public iterateBoardSwapTypes(board: Board, interiorTiles: Array<Hex>) {
      var first = interiorTiles[~~(Math.random() * interiorTiles.length)];
      var second = interiorTiles[~~(Math.random() * interiorTiles.length)];

      if (first.getType() === TileType.Water || second.getType() === TileType.Water) {
         return;
      }

      var temp = first.getType();
      first.setType(second.getType());
      second.setType(temp);
   }

   public scoreBoard(board: Board, interiorTiles: Array<Hex>): number {
      var kWeightsByNumber = [-1, -1, 1, 2, 3, 4, 5, -1, 5, 4, 3, 2, 1, -1];
      var score = 0;
      interiorTiles.forEach(tileA => {
         var hexPower = 0;
         interiorTiles.forEach(tileB => {
            if (tileA !== tileB) {
               var weight = kWeightsByNumber[tileA.getNumber()] * kWeightsByNumber[tileB.getNumber()];
               var multiplier = this.rateHexPair(tileA, tileB);
               hexPower += Math.pow(weight * multiplier, 2);
            }
         }, this);
         score += hexPower;  //Math.pow(hexPower, 2);
      }, this);
      return score;
   }

   private rateHexPair(a: Hex, b: Hex) {
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
         if (aType === TileType.Gold) {
            multiplier = 100.0 + stackBase;
         } else if (aType === TileType.Wood) {
            multiplier = 0.8 + stackBase;
         } else if (aType === TileType.Sheep) {
            multiplier = 0.8 + stackBase;
         } else if (aType === TileType.Wheat) {
            multiplier = 1.2 + stackBase;
         } else if (aType === TileType.Ore) {
            multiplier = 1.2 + stackBase;
         } else if (aType === TileType.Clay) {
            multiplier = 1.2 + stackBase;
         }
      } else if (aType === TileType.Wood && bType === TileType.Clay) {
         multiplier = 2.0;
      } else if (aType === TileType.Ore && bType === TileType.Wheat) {
         multiplier = 2.0;
      }
      if (aType === TileType.Desert) {
         multiplier = 0.0;
      }
      if (aType === TileType.Water) {
         multiplier = 3;
//         multiplier = 8.0;
      }
      if (aType === TileType.Gold) {
         multiplier = 6;
      }
      return 1 + multiplier * weight;
   }
}

class Application {
   private context: any;

   constructor(private canvas: any) { }

   public run() {
      this.context = this.canvas.getContext("2d");

      var boardGenerator = new BoardGenerator();
      var board = boardGenerator.generateCircularBoard(5);
      var mapGenerator = new MapGenerator();
      mapGenerator.randomizeBoard(board, 0.5);
      var boardRenderer = new BoardRenderer(this.canvas, this.context);
      board = mapGenerator.iterateBoard(board, 5000);
      boardRenderer.render(board);

      g.board = board;
//      setInterval(
//         function() {
//            board = mapGenerator.iterateBoard(board, 10);
//            boardRenderer.render(board);
//         }, 10);
   }
}

function shuffle(o) {
   for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
   return o;
};