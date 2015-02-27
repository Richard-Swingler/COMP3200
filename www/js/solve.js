angular.module('solve.controllers', [])

.controller('SolveCtrl', function($scope) {
  
  var solveEditor = new Phaser.Game(1024, 705, Phaser.AUTO, 'solveCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var floor, furnitures, logo, sprites, features; //initialise global variables [TODO] Replace by this. when eventually using states
  function preload(){
      solveEditor.load.image('logo', 'img/ionic.png');
      solveEditor.load.image('grid', 'img/grid.png');
      solveEditor.load.image('door', 'img/door_floorplan.png');
      solveEditor.load.image('plug', 'img/plug_floorplan.png');
      solveEditor.load.image('window', 'img/window_floorplan.png');
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
    solveEditor.physics.enable(floor, Phaser.Physics.ARCADE);

    //loads features onto floor
    featuresData = JSON.parse(window.localStorage.getItem('features'));
    features = solveEditor.add.group();
    for (var feature in featuresData){
      var texture = 'grid';
      if (featuresData[feature].type === 'door'){
        texture = 'door';
        featuresData[feature].obj = features.create(featuresData[feature].x -50 , featuresData[feature].y , texture);//-50 syncs to new position of floor (50,50) where as (100, 50) before 
        featuresData[feature].obj.width = featuresData[feature].width;
        featuresData[feature].obj.height = featuresData[feature].height;
      }
      else if(featuresData[feature].type === 'plug'){
        featuresData[feature].obj = solveEditor.add.tileSprite(featuresData[feature].x -50 , featuresData[feature].y ,featuresData[feature].width, featuresData[feature].height, 'plug');
        features.add(featuresData[feature].obj);
      }
      else if(featuresData[feature].type === 'window'){
        featuresData[feature].obj = solveEditor.add.tileSprite(featuresData[feature].x -50 , featuresData[feature].y ,featuresData[feature].width, featuresData[feature].height, 'window');
        features.add(featuresData[feature].obj);
      }
      //defines style to use for labels
      var style = { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: featuresData[feature].obj.width, align: "center" };
      //creates label
      featuresData[feature].label = solveEditor.add.text(0, 0, featuresData[feature].type , style);
      featuresData[feature].label.anchor.set(0.5);
      //rotate label to fit narrow features
      if(featuresData[feature].obj.width < featuresData[feature].obj.height){
        featuresData[feature].label.angle += -90;
      }
      centerText(featuresData[feature].label, featuresData[feature].obj); //does nto need to be done dynamically as features should nopt move.
      solveEditor.physics.enable(featuresData[feature].obj, Phaser.Physics.ARCADE);
      featuresData[feature].obj.body.collideWorldBounds = true;
      featuresData[feature].obj.body.immovable = true;
    
}
    //loads furniture onto floor 
    furnitures = JSON.parse(window.localStorage.getItem('furniture'));
    console.log(furnitures);
    sprites = solveEditor.add.group();
    for(var furniture in furnitures){
        console.log(furnitures[furniture]);
        var furnBmd = createBmd(furnitures[furniture]);
        furnBmd.ctx.fillStyle = '#0080ff'; //[TODO] load different texture based on type 
        furnBmd.shiftHSL(0.1);
        furnBmd.ctx.fill();
        furnitures[furniture].obj = sprites.create(0, 0, furnBmd);
        solveEditor.physics.enable(furnitures[furniture].obj, Phaser.Physics.ARCADE);
        furnitures[furniture].obj.body.velocity.setTo(200, 200);
        furnitures[furniture].obj.body.bounce.set(0.8);
        furnitures[furniture].obj.body.gravity.set(0, 180);
        furnitures[furniture].obj.inputEnabled = true;
        // console.log(furnitures[furniture].height);
        furnitures[furniture].obj.input.enableDrag();
        furnitures[furniture].obj.input.enableSnap(50, 50, false, true); 
        //defines style to use for labels
        var style = { font: "32px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: furnitures[furniture].obj.width, align: "center" };
        //creates label
        furnitures[furniture].label = solveEditor.add.text(0, 0, furnitures[furniture].type , style);
        furnitures[furniture].label.anchor.set(0.5);
        //  This sets the image bounce energy for the horizontal  and vertical vectors (as an x,y point). "1" is 100% energy return
        furnitures[furniture].obj.body.bounce.set(0.8);
        furnitures[furniture].obj.body.gravity.set(0, 180);
    }
    sprites.setAll('body.collideWorldBounds', true);
    sprites.setAll('body.bounce.x', 0.7);
    sprites.setAll('body.bounce.y', 0.7);
    sprites.setAll('body.minBounceVelocity', 0);
    logo = solveEditor.add.sprite(0,0,'logo');
    logo.inputEnabled = true;
    logo.input.enableDrag();

  }
  function update(){
    solveEditor.physics.arcade.collide(sprites);
    solveEditor.physics.arcade.collide(sprites,features);
    for(var furniture in furnitures){
      centerText(furnitures[furniture].label, furnitures[furniture].obj); //for each furniture takes its label and adjusts the position if neede;
      if(!checkOverlap(furnitures[furniture].obj, floor)){
        solveEditor.physics.arcade.moveToXY(furnitures[furniture].obj, floor.width/2, floor.y, 250);  
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
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.containsRect(boundsA, boundsB);
  }
  function centerText(text, sprite){
    text.x = Math.floor(sprite.x + sprite.width / 2);
    text.y = Math.floor(sprite.y + sprite.height / 2);
  }
})