angular.module('solve.controllers', [])

.controller('SolveCtrl', function($scope) {
  var solveEditor = new Phaser.Game(1024, 705, Phaser.AUTO, 'solveCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var floor, furnitures, logo, sprites; //initialise global variables [TODO] Replace by this. when eventually using states
  function preload(){
      solveEditor.load.image('logo', 'img/ionic.png');
      solveEditor.load.image('grid', 'img/grid.png');
  }
  function create(){
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    solveEditor.stage.backgroundColor = '#ffffff'; 
    solveEditor.add.tileSprite(0, 0, 1024, 705, "grid"); 

    floor = JSON.parse(window.localStorage.getItem("floor"));
    console.log(floor);
    var floorBmd = createBmd(floor);
    floorBmd.ctx.fillStyle = '#ffffff';
    floorBmd.ctx.fill();
    floor = solveEditor.add.sprite(50, 50, floorBmd);
    solveEditor.physics.enable(floor, Phaser.Physics.ARCADE);

    // furn1 = JSON.parse(window.localStorage.getItem("furn1"));
    // var furn1Bmd = createBmd(furn1);
    furnitures = JSON.parse(window.localStorage.getItem('furniture'));
    sprites = solveEditor.add.group();
    console.log('hi');
    for(var furniture in furnitures){
        var furnBmd = createBmd(furnitures[furniture]);
        furnBmd.ctx.fillStyle = '#0080ff';
        furnBmd.shiftHSL(0.1);
        furnBmd.ctx.fill();
        furnitures[furniture] = sprites.create(0, 0, furnBmd);
        solveEditor.physics.enable(furnitures[furniture], Phaser.Physics.ARCADE);
        furnitures[furniture].body.velocity.setTo(200, 200);
        furnitures[furniture].body.bounce.set(0.8);
        furnitures[furniture].body.gravity.set(0, 180);
        furnitures[furniture].inputEnabled = true;
        // console.log(furnitures[furniture].height);
        furnitures[furniture].input.enableDrag();
        furnitures[furniture].input.enableSnap(50, 50, false, true); 
        //  This sets the image bounce energy for the horizontal  and vertical vectors (as an x,y point). "1" is 100% energy return
        furnitures[furniture].body.bounce.set(0.8);
        furnitures[furniture].body.gravity.set(0, 180);
    }
    sprites.setAll('body.collideWorldBounds', true);
    sprites.setAll('body.bounce.x', 1);
    sprites.setAll('body.bounce.y', 1);
    sprites.setAll('body.minBounceVelocity', 0);
    logo = solveEditor.add.sprite(0,0,'logo');
    logo.inputEnabled = true;
    logo.input.enableDrag();

  }
  function update(){
    solveEditor.physics.arcade.collide(sprites);
    for(var furniture in furnitures){
      if(!checkOverlap(furnitures[furniture], floor)){
        console.log('hi');
        solveEditor.physics.arcade.moveToXY(furnitures[furniture], floor.width/2, floor.y, 250);  
      }
    }    
  }
  function render(){
    solveEditor.debug.body(sprites);
  }
  function createBmd(item){
    var bmd = solveEditor.add.bitmapData(item['recX'],item['recY']);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,item['recX'],item['recY']);
    return bmd;
  }
  function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    //console.log(boundsA['x']);
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.containsRect(boundsA, boundsB);
  }
})

