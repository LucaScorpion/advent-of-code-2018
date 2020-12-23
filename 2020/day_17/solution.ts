import fs from 'fs';

const input = fs.readFileSync(0).toString().trim().split(/\r?\n/);

type Cell = '#' | '.';
// pos: x;y;z
// e.g.: 1;4;-3
type Cells = { [pos: string]: Cell };

interface GridInfo {
  cells: Cells;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

const initialGrid: Cells = {};
input.forEach((line, y) => {
  line.split('').forEach((char, x) => {
    initialGrid[posString({ x, y, z: 0 })] = char as Cell;
  });
});

const initialGridInfo: GridInfo = {
  cells: initialGrid,
  minX: 0,
  maxX: input[0].length - 1,
  minY: 0,
  maxY: input.length - 1,
  minZ: 0,
  maxZ: 0,
};

function posString(pos: Position): string {
  return `${pos.x};${pos.y};${pos.z}`;
}

function getCell(cells: Cells, pos: Position): Cell {
  const result = cells[posString(pos)];
  return result || '.';
}

function getNeighbors(grid: GridInfo, pos: Position): Cell[] {
  const neighbors: Cell[] = [];

  for (let dX = -1; dX <= 1; dX++) {
    for (let dY = -1; dY <= 1; dY++) {
      for (let dZ = -1; dZ <= 1; dZ++) {
        if (dX === 0 && dY === 0 && dZ === 0) {
          continue;
        }

        neighbors.push(getCell(grid.cells, {
          x: pos.x + dX,
          y: pos.y + dY,
          z: pos.z + dZ,
        }));
      }
    }
  }

  return neighbors;
}

function newCellState(grid: GridInfo, pos: Position): Cell {
  const state = getCell(grid.cells, pos);
  const activeNeighborCount = getNeighbors(grid, pos).filter((n) => n === '#').length;

  if (state === '#' && (activeNeighborCount < 2 || activeNeighborCount > 3)) {
    return '.';
  } else if (state === '.' && activeNeighborCount === 3) {
    return '#';
  }

  return state;
}

function cycle(grid: GridInfo): GridInfo {
  const newGrid = { ...grid, cells: { ...grid.cells } };

  for (let x = grid.minX - 1; x <= grid.maxX + 1; x++) {
    for (let y = grid.minY - 1; y <= grid.maxY + 1; y++) {
      for (let z = grid.minZ - 1; z <= grid.maxZ + 1; z++) {
        const pos = { x, y, z };
        newGrid.cells[posString(pos)] = newCellState(grid, pos);
      }
    }
  }

  newGrid.minX = newGrid.minX - 1;
  newGrid.maxX = newGrid.maxX + 1;
  newGrid.minY = newGrid.minY - 1;
  newGrid.maxY = newGrid.maxY + 1;
  newGrid.minZ = newGrid.minZ - 1;
  newGrid.maxZ = newGrid.maxZ + 1;

  return newGrid;
}

function printGrid(grid: GridInfo): void {
  for (let z = grid.minZ; z <= grid.maxZ; z++) {
    console.log('z =', z);
    for (let y = grid.minY; y <= grid.maxY; y++) {
      let line = '';
      for (let x = grid.minX; x <= grid.maxX; x++) {
        line = `${line}${getCell(grid.cells, { x, y, z })}`;
      }
      console.log(line);
    }
    console.log();
  }
}

let cycledGrid = initialGridInfo;
for (let i = 0; i < 6; i++) {
  cycledGrid = cycle(cycledGrid);
}

// printGrid(cycledGrid);

const activeCount = Object.values(cycledGrid.cells).filter((c) => c === '#').length;
console.log('Active cells:', activeCount);
