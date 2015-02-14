angular.module('solve.controllers', [])

.controller('SolveCtrl', function($scope) {
  var solveEditor = new Phaser.Game(1024, 705, Phaser.AUTO, 'solveCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var floor, furn1, logo; //initialise global variables [TODO] Replace by this. when eventually using states
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
    var floorBmd = createBmd(floor);
    floorBmd.ctx.fillStyle = '#ffffff';
    floorBmd.ctx.fill();
    floor = solveEditor.add.sprite(50, 50, floorBmd);

    // furn1 = JSON.parse(window.localStorage.getItem("furn1"));
    // var furn1Bmd = createBmd(furn1);
    var furnitures = JSON.parse(window.localStorage.getItem('furniture'));
    for(var furniture in furnitures){
        console.log(furnitures[furniture]);
        console.log(furnitures[furniture]['recX']);
        furnitures[furniture] = createBmd(furnitures[furniture]);
        furnitures[furniture] = solveEditor.add.sprite(0, 0, furnitures[furniture]);
    }
    
    logo = solveEditor.add.sprite(0,0,'logo');
    logo.inputEnabled = true;
    logo.input.enableDrag();

  }
  function update(){
    
  }
  function render(){
  }
  function createBmd(item){
    var bmd = solveEditor.add.bitmapData(item['recX'],item['recY']);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,item['recX'],item['recY']);
    bmd.ctx.fillStyle = '#0080ff';
    bmd.ctx.fill();
    // var item['name'] = solveEditor.add.sprite(50, 50, bmd);
    // item['name'].inputEnabled = true;
    // item['name'].input.enableDrag();
    // item['name'].input.enableSnap(50, 50, false, true); 
    return item['name'];
  }
})

