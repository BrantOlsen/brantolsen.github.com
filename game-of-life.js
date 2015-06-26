"use strict";

/**
 * Javascript implementation of Conway's Game of Life.
 * See http://en.wikipedia.org/wiki/Conway's_Game_of_Life for more
 * information.
 */
function GameOfLife(context, settings) {
  // Force settings to be an object.
  settings = settings || {};
  // Save the settings for use everywhere.
  this.settings = settings;

  this.board = {};
  this.board.div_class = 'game-of-life-div';
  this.board.context = context;
  this.board.cellSize = 25;
  if (this.settings.cellSize) {
    this.board.cellSize = this.settings.cellSize;
  }
  this.settings.drawLines = this.settings.drawLines || false;

  // Do an initial resize.
  this.resize();

  if (this.settings.debug) {
    console.log("Created a new GameOfLife object.");
  }
};

/**
  * Determine the number of rows and columns of the board based on the size
  * of the canvas and cellSize.
  *
  * Please note that this will reset boards state.
  */
GameOfLife.prototype.resize = function() {
  this.board.rows = Math.floor(this.getViewportHeight() / this.board.cellSize);
  if (this.settings.maxRows && this.settings.maxRows > this.board.rows) {
    this.board.rows = this.settings.maxRows;
  }
  this.board.columns = Math.floor(this.getViewportWidth() / this.board.cellSize);
  if (this.settings.maxColumns && this.settings.maxColumns > this.board.columns) {
    this.board.columns = this.settings.maxColumns;
  }

  // Init the this.board and its next state with blank values.
  this.board.nextState = new Array(this.board.rows);
  for (var i = 0; i < this.board.rows; ++i) {
    this.board[i] = new Array(this.board.columns);
    this.board.nextState[i] = new Array(this.board.columns);
    for (var j = 0; j < this.board.columns; ++j) {
      this.board[i][j] = 0;
      this.board.nextState[i][j] = 0;
    }
  }

  if (this.settings.debug) {
    console.log("Resized the board.");
  }
};

/**
 * Get the height of the container that the gameboard
 * is contained within.
 */
GameOfLife.prototype.getViewportHeight = function() {
  if (this.board.context.canvas != null) {
    return this.board.context.canvas.height;
  }
  else {
    return $(this.board.context).height();
  }
};

/**
 * Get the width of the container that the gameboard
 * is contained within.
 */
GameOfLife.prototype.getViewportWidth = function() {
  if (this.board.context.canvas != null) {
    return this.board.context.canvas.width;
  }
  else {
    return $(this.board.context).width();
  }
};

/**
 * Draw an orange line from the start coordinates to end coordinates.
 */
GameOfLife.prototype.drawLine = function(xStart, yStart, xEnd, yEnd) {
  if (this.board.context.fillStyle) {
    this.board.context.fillStyle = 'orange';
    this.board.context.beginPath();
    this.board.context.moveTo(xStart, yStart);
    this.board.context.lineTo(xEnd, yEnd);
    this.board.context.closePath();
    this.board.context.stroke();
  }
};

/**
  * Fill the given cell for the row and column with a black box.
  *
  * @param row The row of the cell.
  * @column column The column of the cell.
  */
GameOfLife.prototype.fillCell = function(row, column) {
  this.settings.color = this.settings.color || "black";
  var x = column * this.board.cellSize;
  var y = row * this.board.cellSize;

  if (this.board.context.fillStyle) {
    this.board.context.fillStyle = this.settings.color;
    this.board.context.fillRect(x, y, this.board.cellSize, this.board.cellSize);
  }
  else {
    var rect_div = $('<div></div>');
    rect_div.css('position', 'absolute')
      .addClass('game-of-life-div')
      .css('bottom', y)
      .css('left', x)
      .css('z-index', 7)
      .css('width', this.board.cellSize)
      .css('height', this.board.cellSize)
      .css('background-color', this.settings.color)
      .css('boarder', '1px solid black');
    this.board.context.append(rect_div);
  }
};

/**
  * Fill all cells that contain the value 1.
  */
GameOfLife.prototype.fillCells = function() {
  for (var i = 0; i < this.board.rows; ++i) {
    if (this.settings.drawLines) {
      this.drawLine(0, i*this.board.cellSize, this.getViewportWidth(), i*this.board.cellSize);
    }

    for (var j = 0; j < this.board.columns; ++j) {
      if (this.board[i][j] == 1) {
        this.fillCell(i, j);
      }

      if (this.settings.drawLines && i == 0) {
        this.drawLine(j*this.board.cellSize, 0, j*this.board.cellSize, this.getViewportHeight());
      }
    }
  }

  if (this.settings.debug) {
    console.log("fillCells.");
  }
};

/**
  * Determine how many adjacent neighbors are alive for this cell.
  *
  * @param row The cell's row number.
  * @param column The cell's column number.
  *
  * @return The number of adjacent alive rows.
  */
GameOfLife.prototype.getNeighbourCount = function(row, column)
{
  var count = 0;
  var columnToRight = column - 1;
  var columnToLeft = column + 1;
  var rowAbove = row - 1;
  var rowBelow = row + 1;

  if (columnToRight < this.board.columns)
  {
    count = count + this.board[row][columnToRight];
  }
  if (columnToLeft >= 0)
  {
    count = count + this.board[row][columnToLeft];
  }
  // Count the rows above us that are alive.
  if (rowAbove >= 0)
  {
    count = count + this.board[rowAbove][column];
    if (columnToRight < this.board.columns)
    {
      count = count + this.board[rowAbove][columnToRight];
    }
    if (columnToLeft >= 0)
    {
      count = count + this.board[rowAbove][columnToLeft];
    }
  }
  // Count the cells below us that are alive.
  if (rowBelow < this.board.rows)
  {
    count = count + this.board[rowBelow][column];
    if (columnToRight < this.board.columns)
    {
      count = count + this.board[rowBelow][columnToRight];
    }
    if (columnToLeft >= 0)
    {
      count = count + this.board[rowBelow][columnToLeft];
    }
  }

  return count;
}

/**
  * Determine which cells live and die.
  */
GameOfLife.prototype.determineNextState = function()
{
  for (var i = 0; i < this.board.rows; ++i)
  {
    for (var j = 0; j < this.board.columns; ++j)
    {
      var numberOfNeighbours = this.getNeighbourCount(i, j);
      // Rule 4 of Life.
      if (this.board[i][j] == 0 && numberOfNeighbours  == 3)
      {
        this.board.nextState[i][j] = 1;
      }
      else if (this.board[i][j] == 1)
      {
        // Rule 1 and Rule 3 of Life.
        if (numberOfNeighbours < 2 || numberOfNeighbours > 3)
        {
          this.board.nextState[i][j] = 0;
        }
        // Rule 2 of Life.
        else
        {
          this.board.nextState[i][j] = 1;
        }
      }
    }
  }
}

/**
  * Copy all values in nextState to the this.board.
  */
GameOfLife.prototype.moveToNextState = function()
{
  for (var i = 0; i < this.board.rows; ++i)
  {
    for (var j = 0; j < this.board.columns; ++j)
    {
      this.board[i][j] = this.board.nextState[i][j];
    }
  }
}

/**
  * Clear the canvas of everything.
  */
GameOfLife.prototype.clear = function() {
  if (this.board.context.clearRect) {
    this.board.context.clearRect(0, 0, this.getViewportWidth(), this.getViewportHeight());
  }
  else {
    this.board.context.find('div.game-of-life-div').remove();
  }

  if (this.settings.debug) {
    console.log("Clear the board.");
  }
};

/**
  * Draw the this.board. Then update it for the next call to update.
  */
GameOfLife.prototype.update = function()
{
  this.clear();
  this.fillCells();
  this.determineNextState();
  this.moveToNextState();

  if (this.settings.debug)
  {
    console.log("updating the game of life.");
  }
}

/**
  * Start the setInterval to update the game board periodically based
  * on the upateInterval given by the user, or half a second if none
  * was given.
  */
GameOfLife.prototype.start = function()
{
  var self = this;

  var updateInterval = 500;
  if (this.settings.updateInterval)
  {
    updateInterval = this.settings.updateInterval;
  }

  this.intervalID = setInterval(function() {
    self.update();
  }, updateInterval);

  if (this.settings.debug)
  {
    console.log("Start the game of life.");
  }
}

/**
  * Clear the setInterval used in the start function. This will halt the board
  * updating.
  */
GameOfLife.prototype.stop = function ()
{
  clearInterval(this.intervalID);
  this.intervalID = undefined;

  if (this.settings.debug)
  {
    console.log("Stop the game of life.");
  }
}

/**
  * Toggle between start and stop based on whether or not we
  * know the interval id.
  */
GameOfLife.prototype.toggle = function () {
  if (this.intervalID)
  {
    this.stop();
  }
  else
  {
    this.start();
  }
}

/**
 * Check if the given parameters will fit in the current board's
 * size.
 *
 * @return True if the arguments will fit.
 */
GameOfLife.prototype.canFit = function(row, column, rowStretch, colStretch)
{
  if (row+rowStretch > this.board.rows ||
      row < 0 ||
      column+colStretch > this.board.columns ||
      column < 0)
  {
    return false;
  }

  return true;
}

/**
  * Create a small glider at the given coords.
  *
  * @param row The row to start the glider at.
  * @param column The column to start the glider at.
  *
  * @return True if the glider was created.
  */
GameOfLife.prototype.createGlider = function(row, column)
{
  // Check to make sure the glider will fit.
  if (!this.canFit(row, column, 2, 2))
  {
    return false;
  }

  this.board[row+1][column] = 1;
  this.board[row+2][column+1] = 1;
  this.board[row+2][column+2] = 1;
  this.board[row+1][column+2] = 1;
  this.board[row][column+2] = 1;

  if (this.settings.debug)
  {
    console.log("Create a glider at " + row + ", " + column);
  }

  return true;
}

/**
  * Create a small glider at the given coords.
  *
  * @param row The row to start the glider at.
  * @param column The column to start the glider at.
  *
  * @return True if the glider was created.
  */
GameOfLife.prototype.createAcorn = function(row, column)
{
  // Check to make sure the glider will fit.
  if (!this.canFit(row, column, 2, 6))
  {
    return false;
  }

  this.board[row+3][column] = 1;
  this.board[row+1][column+1] = 1;
  this.board[row+3][column+1] = 1;
  this.board[row+2][column+3] = 1;
  this.board[row+3][column+4] = 1;
  this.board[row+3][column+5] = 1;
  this.board[row+3][column+6] = 1;

  if (this.settings.debug)
  {
    console.log("Create a glider at " + row + ", " + column);
  }

  return true;
}

/**
  * Create a small glider at the given coords.
  *
  * @param row The row to start the glider at.
  * @param column The column to start the glider at.
  *
  * @return True if the glider was created.
  */
GameOfLife.prototype.createBeacon = function(row, column)
{
  // Check to make sure the glider will fit.
  if (!this.canFit(row, column, 3, 3))
  {
    return false;
  }

  this.board[row][column] = 1;
  this.board[row+1][column] = 1;
  this.board[row][column+1] = 1;
  this.board[row+1][column+1] = 1;
  this.board[row+2][column+2] = 1;
  this.board[row+3][column+2] = 1;
  this.board[row+2][column+3] = 1;
  this.board[row+3][column+3] = 1;

  if (this.settings.debug)
  {
    console.log("Create a glider at " + row + ", " + column);
  }

  return true;
}

/**
  * Create a small glider gun at the given coords.
  *
  * @param row The row to start the gun at.
  * @param column The column to start the gun at.
  *
  * @return True if the gun was created.
  */
GameOfLife.prototype.createGliderGun = function(row, column)
{
  // Check to make sure the glider will fit.
  if (!this.canFit(row, column, 8, 35))
  {
    return false;
  }

  // Left square.
  this.board[row+4][column] = 1;
  this.board[row+4][column+1] = 1;
  this.board[row+5][column] = 1;
  this.board[row+5][column+1] = 1;

  // Middle almost circle.
  this.board[row+4][column+10] = 1;
  this.board[row+5][column+10] = 1;
  this.board[row+6][column+10] = 1;
  this.board[row+3][column+11] = 1;
  this.board[row+7][column+11] = 1;
  this.board[row+2][column+12] = 1;
  this.board[row+8][column+12] = 1;
  this.board[row+2][column+13] = 1;
  this.board[row+8][column+13] = 1;
  this.board[row+5][column+14] = 1;
  this.board[row+3][column+15] = 1;
  this.board[row+4][column+16] = 1;
  this.board[row+5][column+16] = 1;
  this.board[row+6][column+16] = 1;
  this.board[row+7][column+15] = 1;
  this.board[row+5][column+17] = 1;

  // Arrow
  this.board[row+2][column+20] = 1;
  this.board[row+3][column+20] = 1;
  this.board[row+4][column+20] = 1;
  this.board[row+2][column+21] = 1;
  this.board[row+3][column+21] = 1;
  this.board[row+4][column+21] = 1;
  this.board[row+1][column+22] = 1;
  this.board[row+5][column+22] = 1;
  this.board[row][column+24] = 1;
  this.board[row+1][column+24] = 1;
  this.board[row+5][column+24] = 1;
  this.board[row+6][column+24] = 1;

  // Right square
  this.board[row+2][column+34] = 1;
  this.board[row+2][column+35] = 1;
  this.board[row+3][column+34] = 1;
  this.board[row+3][column+35] = 1;

  if (this.settings.debug)
  {
    console.log("Create glider gun at " + row + ", " + column);
  }

  return true;
}

/**
 * Create the F-pentomino pattern.
 */
GameOfLife.prototype.createF_Pentomino = function(row, column)
{
  if (!this.canFit(row, column, 2, 2))
  {
    return false;
  }

  this.board[row+1][column] = 1;
  this.board[row][column+1] = 1;
  this.board[row+1][column+1] = 1;
  this.board[row+2][column+1] = 1;
  this.board[row][column+2] = 1;

  return true;
}

/**
 * Create the 1 row gun listed on the wikipedia page.
 */
GameOfLife.prototype.create1RowGun = function(row, column)
{
  if (!this.canFit(row, column, 0, 38))
  {
    return false;
  }

  this.board[row][column] = 1;
  this.board[row][column+1] = 1;
  this.board[row][column+2] = 1;
  this.board[row][column+3] = 1;
  this.board[row][column+4] = 1;
  this.board[row][column+5] = 1;
  this.board[row][column+6] = 1;
  this.board[row][column+7] = 1;

  this.board[row][column+9] = 1;
  this.board[row][column+10] = 1;
  this.board[row][column+11] = 1;
  this.board[row][column+12] = 1;
  this.board[row][column+13] = 1;

  this.board[row][column+17] = 1;
  this.board[row][column+18] = 1;
  this.board[row][column+19] = 1;

  this.board[row][column+26] = 1;
  this.board[row][column+27] = 1;
  this.board[row][column+28] = 1;
  this.board[row][column+29] = 1;
  this.board[row][column+30] = 1;
  this.board[row][column+31] = 1;
  this.board[row][column+32] = 1;

  this.board[row][column+34] = 1;
  this.board[row][column+35] = 1;
  this.board[row][column+36] = 1;
  this.board[row][column+37] = 1;
  this.board[row][column+38] = 1;

  return true;
}

/**
 * Add a cell based on the x and y coordinates of the click. This
 * will also call fillCells.
 *
 * @param clickEvent The click event to obtain x and y coords from.
 */
GameOfLife.prototype.fillByClick = function(clickEvent) {
  var x = clickEvent.clientX;
  var y = clickEvent.clientY;

  var col = Math.floor(x / this.board.cellSize);
  var row = Math.floor(y / this.board.cellSize);

  this.board[row][col] = 1;
  this.fillCells();

  if (this.settings.debug)
  {
    console.log("Fill by click on " + x + ", " + y);
  }
}

GameOfLife.prototype.destroyByClick = function(click_event) {
  var x = clickEvent.clientX;
  var y = clickEvent.clientY;

  var col = Math.floor(x / this.board.cellSize);
  var row = Math.floor(y / this.board.cellSize);

  if (this.board[row][col] == 1) {
    this.board[row][col] = 0;
  }  
  this.fillCells();
};
