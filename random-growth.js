"use strict";

function RandomGrowth(context, settings)
{
  this.settings = settings || {};
  this.settings.spawnRate = this.settings.spawnRate || 0.05;
  this.settings.spawnLife = this.settings.spawnLife || 10;
  this.settings.speed = this.settings.speed || 50;
  this.settings.type = this.settings.type || "DrawTree";

  this.percentFromSides = 0.05;

  this.context = context;
  this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

  var y, x, yStep, xStep, trunkHeight;
  y = this.context.canvas.height;
  x = this.context.canvas.width / 2;
  trunkHeight = this.context.canvas.height * 0.1;

  yStep = Math.floor(y / 25);
  if (yStep < 5)
  {
    yStep = 5;
  }
  xStep = Math.floor(x / 50);
  if (xStep < 5)
  {
    xStep = 5;
  }

  context.strokeStyle = "white";

  if (this.settings.type === "DrawTree")
  {
    context.beginPath();
    context.moveTo(x,y);
    y = y - trunkHeight;
    context.lineTo(x,y);
    context.stroke();

    this.drawBranch(context, x, y, yStep, xStep, -1);
    this.drawBranch(context, x, y, yStep, -xStep, -1);
  }
  else
  {
    this.drawRandom(context,
                    this.context.canvas.width / 2,
                    this.context.canvas.height / 2,
                    10,
                    10,
                    -1);
    this.drawRandom(context,
                    this.context.canvas.width / 2,
                    this.context.canvas.height / 2,
                    -10,
                    -10,
                    -1);
  }
}

RandomGrowth.prototype.drawRandom = function(context, x, y, yStep, xStep, lifeCounter)
{
  if (lifeCounter === 0 ||
      y < context.canvas.height*this.percentFromSides ||
      x < context.canvas.width*this.percentFromSides ||
      x > context.canvas.width*(1-this.percentFromSides) ||
      xStep === 0 ||
      yStep === 0)
  {
    return;
  }
  --lifeCounter;
  var self = this;

  context.beginPath();
  context.moveTo(x,y);
  y = y - yStep;
  x = x + xStep;
  context.lineTo(x,y);
  context.stroke();

  setTimeout(function() {
    var minX, maxX;
    minX = (xStep < 0 ? -5 : 0.1);
    maxX = (xStep < 0 ? -0.1 : 5);
    self.drawRandom(context, x, y, self.getRandom(-10, 10), self.getRandom(minX, maxX), lifeCounter);
    if (self.getRandom(0, 1) < self.settings.spawnRate)
    {
      self.drawRandom(context, x, y, self.getRandom(-20, 20), self.getRandom(-5, 5), self.settings.spawnLife);
    }
  }, this.settings.speed);
};

RandomGrowth.prototype.drawBranch = function(context, x, y, yStep, xStep, lifeCounter)
{
  var self = this;
  if (lifeCounter == 0 ||
      y < context.canvas.height*this.percentFromSides ||
      x < context.canvas.width*this.percentFromSides ||
      x > context.canvas.width*(1-this.percentFromSides) ||
      xStep == 0 ||
      yStep == 0)
  {
    return;
  }

  context.beginPath();
  context.moveTo(x,y);
  y = y - yStep;
  x = x + xStep;
  context.lineTo(x,y);
  context.stroke();

  setTimeout(function() {
    self.drawBranch(context, x, y, yStep, xStep, lifeCounter);
  }, this.settings.speed);
  // This causes it to hang. Why?
  if (lifeCounter < 0)
  {
    setTimeout(function() {
      self.drawBranch(context, x, y, yStep, xStep+xStep, -1);
    }, this.settings.speed);
  }
  else
  {
    --lifeCounter;
    setTimeout(function() {
      self.drawBranch(context, x, y, yStep, -xStep, lifeCounter);
    }, this.settings.speed);
  }
};

RandomGrowth.prototype.getRandom = function(min, max)
{
  return Math.random() * (max - min) + min;
};
