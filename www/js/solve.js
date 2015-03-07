angular.module('solve.controllers', [])

.controller('SolveCtrl', function($scope) {
  
  var solveEditor = new Phaser.Game(1024, 705, Phaser.AUTO, 'solveCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var floor, furnitures, logo, sprites, features, door, plug, plugWall; //initialise global variables [TODO] Replace by this. when eventually using states
  var side = 0;
  var placeDesk = true;
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
        door = featuresData[feature].obj;
      }
      else if(featuresData[feature].type === 'plug'){
        featuresData[feature].obj = solveEditor.add.tileSprite(featuresData[feature].x -50 , featuresData[feature].y ,featuresData[feature].width, featuresData[feature].height, 'plug');
        features.add(featuresData[feature].obj);
        plug = featuresData[feature].obj;
        plugWall = 'unknown';
        plugWall = checkWall(plug);
        console.log(plugWall);
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
    sprites = solveEditor.add.group();
    for(var furniture in furnitures){
        var furnBmd = createBmd(furnitures[furniture]);
        furnBmd.ctx.fillStyle = '#0080ff'; //[TODO] load different texture based on type 
        furnBmd.shiftHSL(0.1);
        furnBmd.ctx.fill();
        furnitures[furniture].obj = sprites.create(50, 50, furnBmd);
        solveEditor.physics.enable(furnitures[furniture].obj, Phaser.Physics.ARCADE);
        furnitures[furniture].obj.inputEnabled = true;
        // console.log(furnitures[furniture].height);
        furnitures[furniture].obj.input.enableDrag();
        furnitures[furniture].obj.input.enableSnap(50, 50, false, true); 
        //defines style to use for labels
        var style = { font: "32px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: furnitures[furniture].obj.width, align: "center" };
        //creates label
        furnitures[furniture].label = solveEditor.add.text(0, 0, furnitures[furniture].type , style);
        furnitures[furniture].label.anchor.set(0.5);
    }
    //solveEditor.time.events.loop(Phaser.Timer.SECOND, function(){ side++; }, this); 
    logo = solveEditor.add.sprite(0,0,'logo');
    logo.inputEnabled = true;
    logo.input.enableDrag();
  }
  function update(){
   
    generateUserSolutions(furnitures, features);
    for(var furniture in furnitures){
      centerText(furnitures[furniture].label, furnitures[furniture].obj); //for each furniture takes its label and adjusts the position if neede;
      if(!checkOverlap(furnitures[furniture].obj, floor)){
        //solveEditor.physics.arcade.moveToXY(furnitures[furniture].obj, floor.width/2, floor.y, 250);  
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
  function generateUserSolutions(furnitures, features){
    //set bed orientation
    rotateBed(furnitures['Bed'].obj); //get each possible possition for a bed
    if(checkCollisions(door, furnitures['Bed'].obj)){ //checks if in way of door (first furniture to be place so no collision there)
      floor.tint = 0xff0000;
      //end itteration
    }else{
      floor.tint = 0xffffff;
      while (placeDesk == true){
        //place desk in all possible positions if bed blocks all plugs, cancell itteration./
        setDesk(furnitures['Desk'].obj);
        break;
        //place rest of furnitures
        //store in memory for next itteration
      }
    }
    
  } 
  function rotateBed(bed){ //rotates bed based on side variable (currently every 2 seconds)
    switch(side) {
      case 0:
          if(!isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          topLeft(bed);
          break;
      case 1:
          if(isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          topLeft(bed);
          break;
      case 2:
          if(!isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          topRight(bed);
          break;
      case 3:
          if(isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          topRight(bed);
          break;
      case 4:
          if(!isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          bottomLeft(bed);
          break;
      case 5:
          if(isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          bottomLeft(bed);
          break;
      case 6:
          if(!isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          bottomRight(bed);
          break;
      case 7:
          if(isFlat(bed)){
            temp = bed.width, bed.width = bed.height, bed.height = temp; //swap width with height 
          }
          bottomRight(bed);
          break;
      default:
          console.log('nothing to do here');
          side = 0;
    } 
  }
  function setDesk(desk){
    desk.x = plug.x;
    desk.y = plug.y;
    desk.alpha = 0.5;  
    if(isFlat(plug) !== isFlat(desk)){ //checks if items are the same orientation //sets default orientation
      temp = desk.width, desk.width = desk.height, desk.height = temp; //swap width with height 
    }
    switch(plugWall){
      case 'East': //for vertical arangements
        if(plug.y === floor.x || plug.y - desk.width < floor.x){
          temp = desk.width, desk.width = desk.height, desk.height = temp; //flip for first itteration
          topRight(desk);
        }
      break; 
    }
    var collision = false;
    solveEditor.physics.arcade.overlap(desk, furnitures['Bed'].obj, function(){ collision = true }, null, this);
    if(collision || checkCollisions(door, desk)){ //checks if in way of door or bed (currently placed features)
      floor.tint = 0xff0000;
      //end itteration
    }else{
      floor.tint = 0xffffff;

    }
    if(floor.width === desk.x){ //if gets out of horizontal floor bounds
      desk.x -= 50; //account for phaser anchor
    } else if(floor.height === desk.y){ //or vertical bounds
      desk.y -= 50; //account for phaser anchor
    }
  }
  function solveForRemainingSpace(){
    //check overlap with group.

  }
  function checkWall(plug){
    if(checkNorth(floor, plug)){
      return 'North';
    }else if(checkEast(floor, plug)){
      return 'East';
    }else if(checkSouth(floor, plug)){
      return 'South';
    }else if(checkWest(floor, plug)){
      return 'West';
    }else{
      return 'error plug not on wall';
    }
  }
  function checkCollisions(bed, door){
    var boundsA = bed.getBounds();
    var boundsB = door.getBounds();
    return Phaser.Rectangle.containsRect(boundsA, boundsB);
  }
  function checkNorth(floor, feature){
    return checkOverlap(feature, floor) && feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.y;
  }
  function checkSouth(floor, feature){
    return checkOverlap(feature, floor) && feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.height || feature.y === floor.height - 50;//+50 to account for phasewr anchor
  }
  function checkWest(floor, feature){
    return checkOverlap(feature, floor) && feature.y >= floor.y && feature.y <= floor.height && feature.x === floor.x;
  }
  function checkEast(floor, feature){
    return checkOverlap(feature, floor) && feature.y >= floor.y && feature.y <= floor.height && feature.x === floor.width || feature.x === floor.width + 50;//+50 to account for phasewr anchor
  }
  function isFlat(object){
    //returns true if width is larger than height
    return object.width > object.height;
  }
  function topLeft(obj){
    obj.x = floor.x;
    obj.y = floor.y;
    //side ++;
  }
  function topRight(obj){
    obj.x = floor.width - obj.width +50; //+50 to account for phasewr anchor
    obj.y = floor.y;
    //side ++;
  }
  function bottomLeft(obj){
    obj.x = floor.x;
    obj.y = floor.height - obj.height + 50; //+50 to account for phaser anchor
    //side ++;
  }
  function bottomRight(obj){
    obj.x = floor.width - obj.width +50; //+50 to account for phasewr anchor
    obj.y = floor.height - obj.height + 50; //+50 to account for phaser anchor
    //side ++;
  }
})