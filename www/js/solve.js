angular.module('solve.controllers', [])

.controller('SolveCtrl', function($scope) {
  
  var solveEditor = new Phaser.Game(1024, 705, Phaser.AUTO, 'solveCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var floor, furnitures, logo, restrictedFurn, features, door, plug, plugWall, otherFurn,glass; //initialise global variables [TODO] Replace by this. when eventually using states
  var side, placeDeskCount = 0;
  var placeDesk = true;
  var cancel = false;
  $scope.solutions  = [];
  remainingFurnitureData = [];
  function preload(){
      solveEditor.load.image('logo', 'img/ionic.png');
      solveEditor.load.image('grid', 'img/grid.png');
      solveEditor.load.image('door', 'img/door_floorplan.png');
      solveEditor.load.image('plug', 'img/plug_floorplan.png');
      solveEditor.load.image('window', 'img/window_floorplan.png');
  }
  function create(){
    //scaling options
    //solveEditor.physics.startSystem(Phaser.Physics.ARCADE);
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
    //solveEditor.physics.enable(floor, Phaser.Physics.ARCADE);

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
        plugWall = checkWall(plug); //[TODO] problem with detecting corners
      }
      else if(featuresData[feature].type === 'window'){
        featuresData[feature].obj = solveEditor.add.tileSprite(featuresData[feature].x -50 , featuresData[feature].y ,featuresData[feature].width, featuresData[feature].height, 'window');
        glass = featuresData[feature].obj;
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
      centerText(featuresData[feature].label, featuresData[feature].obj); //does not need to be done dynamically as features should nopt move.
    }
    //loads furniture onto floor 
    furnitures = JSON.parse(window.localStorage.getItem('furniture'));
    restrictedFurn = solveEditor.add.group();
    otherFurn = solveEditor.add.group();
    for(var furniture in furnitures){
        var furnBmd = createBmd(furnitures[furniture]);
        furnBmd.ctx.fillStyle = '#0080ff'; //[TODO] load different texture based on type 
        furnBmd.shiftHSL(0.1);
        furnBmd.ctx.fill();
        furnitures[furniture].obj = restrictedFurn.create(50, 50, furnBmd);
        //defines style to use for labels
        var style = {font: "32px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: furnitures[furniture].obj.width, align: "center"};
        //creates label
        furnitures[furniture].label = solveEditor.add.text(0, 0, furnitures[furniture].name , style);
        furnitures[furniture].label.anchor.set(0.5);
        furnitures[furniture].obj.type = furnitures[furniture].type;
        if(furnitures[furniture].type !== 'Bed' && furnitures[furniture].type !== 'Desk'){
          furnitures[furniture].obj.name = furniture;
          otherFurn.add(furnitures[furniture].obj);
          remainingFurnitureData.push(furnitures[furniture]);
        }
        //all remaining furniture in flat orientation
        remainingFurnitureData.forEach(function(item){
          if(!isFlat(item.obj)){
            temp = item.obj.width, item.obj.width = item.obj.height, item.obj.height = temp;
          }
        });
        //sort array by largest flat side (furniture will be flipped to align with wall)
        remainingFurnitureData.sort(compare);
    }
    logo = solveEditor.add.sprite(0,0,'logo');
    logo.inputEnabled = true;
    logo.input.enableDrag();
    for(side = 0; side < 8; side ++){
      console.log('~~~~~~~~~~');
      console.log(side);
      console.log('~~~~~~~~~~');
      generateUserSolutions(furnitures, features);
    }
  }
  function update(){
    //for each furniture takes its label and adjusts the position if needed
    for(var furniture in furnitures){
      centerText(furnitures[furniture].label, furnitures[furniture].obj); 
    }
    //console.log($scope.solutions);
  }
  function render(){
    //solveEditor.debug.body(sprites);
    // solveEditor.debug.spriteInfo(tracer, 32, 32);
    solveEditor.debug.spriteInfo(furnitures['Wardrobe'].obj, 32, 32);
  }
  function createBmd(item){
    var bmd = solveEditor.add.bitmapData(item['recX'],item['recY']);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0,0,item['recX'],item['recY']);
    return bmd;
  }
  function centerText(text, sprite){
    text.x = Math.floor(sprite.x + sprite.width / 2);
    text.y = Math.floor(sprite.y + sprite.height / 2);
  }
  function generateUserSolutions(furnitures, features){
    //set bed orientation
    rotateBed(furnitures['Bed'].obj); //get each possible possition for a bed
    if(checkOverlap(door, furnitures['Bed'].obj)){ //checks if in way of door (first furniture to be place so no other collision there)
      floor.tint = 0xff0000;
      console.log('bed in front of door');
      //end itteration
    }else{
      placeDeskCount = 0;
      placeDesk = true;
      floor.tint = 0xffffff;
      while (placeDesk){
        //place desk in all possible positions if bed blocks all plugs, cancell itteration./
        setDesk(furnitures['Desk'].obj);
        if(!cancel){ //[TODO] -> check if solution is valid
          //Main restrictions have now been inputed, this has now reduced the available space
          //Remaining space needs to be calculated and coordinates stored in an array (for this itteration)
          var spaceLeft = calculateRemainingSpace(furnitures['Bed'].obj, furnitures['Desk'].obj);
          //console.log(spaceLeft);
          //place rest of furnitures in remaining space
          var placedItems = solveForRemainingSpace(remainingFurnitureData, spaceLeft);
          //prepare for store
          var other = [];
          otherFurn.forEach(function(item){
            other.push({name: item.name, x: item.x, y: item.y, width: item.width, height: item.height});
          });
          //check effectiveness of solution by measuring largest connected rectangle
          //generate rectangle size of floor and make it smaller till it fits
          var checkerRec = solveEditor.add.sprite(floor.x, floor.y, 'grid');
          checkerRec.width = floor.width;
          checkerRec.height = floor.height;
          while(checkAllCollisions(checkerRec, true, true)){
            checkerRec.x += 50;
            checkerRec.y += 50;
            checkerRec.width -= 100; //twice as much to componsate with changed x
            checkerRec.height -= 100;//twice as much to componsate with changed y
          }
            checkerRec.x -= 50;
            checkerRec.y -= 50;
            checkerRec.width += 100; //twice as much to componsate with changed x
            checkerRec.height += 100;//twice as much to componsate with changed y
            console.log(checkAllCollisions(checkerRec, true, true));
          //this has given a base now increase each side until reaches maximum size
          // while(!checkAllCollisions(checkerRec, true, true)){
          //   console.log('hey');
          //   checkerRec.x += 50;
          //   //checkerRec.width +=200; //to accomodate change in x
          //   console.log(checkAllCollisions(checkerRec, true, true));
          //   break;
          // }
          //compile solution in memory
          $scope.solutions.push(
            {bed: 
              {x: furnitures['Bed'].obj.x, y: furnitures['Bed'].obj.y, height: furnitures['Bed'].obj.height, width: furnitures['Bed'].obj.width}, 
            desk: 
              {x: furnitures['Desk'].obj.x, y: furnitures['Desk'].obj.y, height: furnitures['Desk'].obj.height, width: furnitures['Desk'].obj.width},  
            other: other,
            useable: ''
          });
          console.log('solution saved!');
        } 
        cancel = false;
        placeDeskCount++;
      }
    }
    //store in local storage
    //window.localStorage.setItem('Solutions', JSON.stringify(/*$scope.solutions*/));
    //check effectiveness of solution then arrange by best to low
    
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
          console.log('nothing left to do here');
    } 
  }
  function setDesk(desk){
    desk.alpha = 0.5;  
    if(isFlat(plug) !== isFlat(desk)){ //checks if items are the same orientation //sets default orientation to be the same as the plug
      temp = desk.width, desk.width = desk.height, desk.height = temp; //swap width with height 
      topRight(desk);
    }
    switch(plugWall){
      case 'East': //for vertical arangements
        if(plug.y === floor.x || plug.y - desk.width < floor.x && placeDeskCount === 0){
          temp = desk.width, desk.width = desk.height, desk.height = temp; //set for first or second itteration in top right
          topRight(desk);
        }
        else if(placeDeskCount <= 1){
          topRight(desk); //place top for first itteration if close enough to top wall
        }
        else if(desk.y + desk.height < floor.height + floor.y){ //first drop desk as far as it can go
          desk.y += 50;
        }
        else if(plug.y + plug.height === floor.height || plug.y + plug.height + desk.width -50 < floor.x){// then flip for last itteration if close enough to bottom wall (-50 for anchor placement)
          temp = desk.width, desk.width = desk.height, desk.height = temp; 
          bottomRight(desk);
          placeDesk = false;
        }else{
          placeDesk = false;
        }
      break;
      case 'South': //for vertical arangements
        if(plug.x === floor.x || plug.x - desk.height < floor.x && placeDeskCount === 0){
          temp = desk.width, desk.width = desk.height, desk.height = temp; //set for first or second itteration in top right
          bottomLeft(desk);
          placeDeskCount++;
        }
        else if(placeDeskCount <= 1){
          bottomLeft(desk); //place top for first itteration if close enough to top wall
          placeDeskCount++;
        }
        else if(desk.x + desk.width < floor.width + floor.x){ //first drag desk as far as it can go
          desk.x += 50;
        }
        else if(plug.x + plug.height === floor.height || plug.x + plug.width + desk.height -50 > floor.width){// then flip for last itteration if close enough to bottom wall (-50 for anchor placement)
          temp = desk.width, desk.width = desk.height, desk.height = temp; 
          bottomRight(desk);
          placeDesk = false;
        }else{
          placeDesk = false;
        }
      break;
      case 'West': //for vertical arangements
        if(plug.y === floor.x || plug.y - desk.width < floor.x && placeDeskCount === 0){
          temp = desk.width, desk.width = desk.height, desk.height = temp; //set for first or second itteration in top right
          topLeft(desk);
          placeDeskCount++;
        }
        else if(placeDeskCount <= 1){
          topLeft(desk); //place top for first itteration if close enough to top wall
          placeDeskCount++;
        }
        else if(desk.y + desk.height < floor.height + floor.y){ //first drop desk as far as it can go
          desk.y += 50;
        }
        else if(plug.y + plug.height === floor.height || plug.y + plug.height + desk.width -50 < floor.x){// then flip for last itteration if close enough to bottom wall (-50 for anchor placement)
          temp = desk.width, desk.width = desk.height, desk.height = temp; 
          bottomLeft(desk);
          placeDesk = false;
        }else{
          placeDesk = false;
        }
      break;
      case 'North': //for vertical arangements
        if(plug.x === floor.x || plug.x - desk.height < floor.x && placeDeskCount === 0){
          temp = desk.width, desk.width = desk.height, desk.height = temp; //set for first or second itteration in top right
          topLeft(desk);
          placeDeskCount++;
        }
        else if(placeDeskCount <= 1){
          topLeft(desk); //place top for first itteration if close enough to top wall
          placeDeskCount++;
        }
        else if(desk.x + desk.width < floor.width + floor.x){ //first drag desk as far as it can go
          desk.x += 50;
        }
        else if(plug.x + plug.height === floor.height || plug.x + plug.width + desk.height -50 > floor.width){// then flip for last itteration if close enough to bottom wall (-50 for anchor placement)
          temp = desk.width, desk.width = desk.height, desk.height = temp; 
          topRight(desk);
          placeDesk = false;
        }else{
          placeDesk = false;
        }
      break;
    }
    if(checkOverlap(furnitures['Bed'].obj, desk) || checkOverlap(door, desk)){ //checks if in way of door or bed (currently placed features)
      floor.tint = 0xff0000;
      console.log('desk is obstructing another item');
      cancel = true; 
      //end itteration
    }else{
      floor.tint = 0xffffff;
    }
    if(floor.width === desk.x){ //if gets out of horizontal floor bounds
      desk.x -= 50; //account for phaser anchor
    } 
    else if(floor.height === desk.y){ //or vertical bounds
      desk.y -= 50; //account for phaser anchor
    }
  }
  function solveForRemainingSpace(group, availableSpace){
    //create non-reference temp version of the data to work on for this itteration
    //first try and fill gaps in west wall
    var remainingFurnitureTemp = group.slice();
    for(space in availableSpace){
      availableSpace[space].forEach(function(gap) {
        placeRemaining(gap.orientation, remainingFurnitureTemp, gap);
      });
    }
  }
  function placeRemaining(orientation, obj, gap){
    var toRemove = [];
    // try and place each remaining items
    obj.forEach(function(item){
      if(orientation === 'east' || orientation === 'west'){
        //flip items to wall orientation
        if(isFlat(item.obj)){
          temp = item.obj.width, item.obj.width = item.obj.height, item.obj.height = temp;
        }
        //try an fit each item
        if(item.obj.height <= gap.height){
          item.obj.x = gap.x;
          item.obj.y = gap.y + gap.height - item.obj.height; //start at bottom
          if(orientation === 'east'){item.obj.x -= item.obj.width;}
          //if item is labelled tall, do not place in front of window
          if(item.type === 'Tall' && checkIntersect(item.obj, glass)){
            //try and find position allong gap
            if(glass.y + glass.height < glass.y + glass.height + item.obj.height <= floor.y + floor.height && !checkAllCollisions(item.obj, false)){
              item.obj.x = gap.x - item.obj.width;
              item.obj.y = gap.y + gap.height;
              if(orientation === 'east'){item.obj.y -= item.obj.height;}
            }else{
              //reset position to default (off screen)
              item.obj.x = 1000;
              item.obj.y = 1000;
            }
          }
          if(!checkAllCollisions(item.obj, false, true) && checkOverlap(floor, item.obj)){
            //modify available space to reflect now ocupied 
            gap.y = item.obj.y + item.obj.height;
            gap.height = gap.height - item.obj.height;
            //remove object from remainingFurnitureData
            toRemove.push(obj.indexOf(item));
          }
          else{
            //reset position to default (off screen)
            item.obj.x = 1000;
            item.obj.y = 1000; 
          }
        }
      }
      else if(orientation === 'south' || orientation === 'north'){
        //flip items to wall orientation
        if(!isFlat(item.obj)){
          temp = item.obj.width, item.obj.width = item.obj.height, item.obj.height = temp;
        }
        //try an fit each item
        if(item.obj.width <= gap.width){
          //if item is labelled tall, do not place in front of window
          item.obj.x = gap.x;
          item.obj.y = gap.y; 
          if(orientation === 'south'){item.obj.y -= item.obj.height;} //account for anchor
          if(item.type === 'Tall' && checkIntersect(item.obj, glass)){
            //try and find position allong gap
            if(glass.x + glass.width < glass.x + glass.width + item.obj.width <= floor.x + floor.width && !checkAllCollisions(item.obj, false)){
              item.obj.x = glass.x + glass.width;
              item.obj.y = gap.y;
              if(orientation === 'south'){item.obj.y -= item.obj.height;}
            }else{
              //reset position to default (off screen)
              item.obj.x = 1000;
              item.obj.y = 1000;
            }
          }
          if(!checkAllCollisions(item.obj, false, true)  && checkOverlap(floor, item.obj)){
            //modify available space to reflect now ocupied 
            gap.x = item.obj.x + item.obj.width;
            gap.width = gap.width - item.obj.width;
            //remove object from remainingFurnitureData
            toRemove.push(obj.indexOf(item));
          }else{
            //reset position to default (off screen)
            item.obj.x = 1000;
            item.obj.y = 1000; 
          }
        }
      }
    });
    //remove any placed items
    toRemove.sort(function(a, b){return b-a});
    toRemove.forEach(function(placed){
      obj.splice(placed, 1);
    });
    toRemove = [];    
  }
  function compare(a,b) {
    if (a.type > b.type)
       return -1;
    if (a.type < b.type)
      return 1;
    return 0;
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
  function checkNorth(floor, feature){
    return checkOverlap(feature, floor) && feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.y;
  }
  function checkSouth(floor, feature){
    return checkOverlap(feature, floor) && feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.height || feature.y === floor.height - 50;// +50 to account for phasewr anchor
  }
  function checkWest(floor, feature){
    return checkOverlap(feature, floor) && feature.y >= floor.y && feature.y <= floor.height && feature.x === floor.x;
  }
  function checkEast(floor, feature){
    return checkOverlap(feature, floor) && feature.y >= floor.y && feature.y <= floor.height && feature.x === floor.width || feature.x === floor.width + 50;// +50 to account for phasewr anchor
  }
  function isFlat(object){
    //returns true if width is larger than height
    return object.width > object.height;
  }
  function topLeft(obj){
    obj.x = floor.x;
    obj.y = floor.y;
  }
  function topRight(obj){
    obj.x = floor.width - obj.width +50; // +50 to account for phasewr anchor
    obj.y = floor.y;
  }
  function bottomLeft(obj){
    obj.x = floor.x;
    obj.y = floor.height - obj.height + 50; // +50 to account for phaser anchor
  }
  function bottomRight(obj){
    obj.x = floor.width - obj.width +50; // +50 to account for phasewr anchor
    obj.y = floor.height - obj.height + 50; // +50 to account for phaser anchor
  }
  //calculates wall space remaining and provides coordinates in an array
  function calculateRemainingSpace(bed, desk){
    var remainingSpace = {west: [], south: [], east: [], north: []};
    //Have a tracer 50 x 50 block go round each wall, records starting and ending value where there is a gap
    var tracer = solveEditor.add.sprite(50, 50, 'grid');

    //first go down west wall and record free space pair -- tracer initialised at top of west wall
    moveTracerVertical(tracer, remainingSpace);
   
    //then East wall - move minus 50 for first itteration
    topRight(tracer);
    moveTracerVertical(tracer, remainingSpace);

    //then North wall
    topLeft(tracer);
    moveTracerHorizontal(tracer, remainingSpace);

    //then south wall
    bottomLeft(tracer);
    moveTracerHorizontal(tracer, remainingSpace);

    tracer.kill();
    return remainingSpace;
  }
  function checkOverlap(spriteA, spriteB) {
    //get bounds broken but creates expected object type (PIXI.Rectangle) then modifyed with actual values
    var boundsA = spriteA.getBounds(); 
    boundsA.x = spriteA.x;
    boundsA.y = spriteA.y;
    boundsA.height = spriteA.height;
    boundsA.width = spriteA.width;
    var boundsB = spriteB.getBounds();
    boundsB.x = spriteB.x;
    boundsB.y = spriteB.y;
    boundsB.height = spriteB.height;
    boundsB.width = spriteB.width;
    //check collision both ways sprite a in spriteb and vice versa
    return (Phaser.Rectangle.containsRect(boundsB, boundsA) || Phaser.Rectangle.containsRect(boundsA, boundsB))? true : false; 
  }
  function checkIntersect(spriteA, spriteB) {
    //get bounds broken but creates expected object type (PIXI.Rectangle) then modifyed with actual values
    var boundsA = spriteA.getBounds(); 
    boundsA.x = spriteA.x;
    boundsA.y = spriteA.y;
    boundsA.height = spriteA.height;
    boundsA.width = spriteA.width;
    var boundsB = spriteB.getBounds();
    boundsB.x = spriteB.x;
    boundsB.y = spriteB.y;
    boundsB.height = spriteB.height;
    boundsB.width = spriteB.width;
    var instersect = Phaser.Rectangle.intersection(boundsB, boundsA);
    return instersect.width !== 0 && instersect.height !== 0; 
  }
  function checkAllCollisions(tracerObj, checkOtherFurn, intersects){
    var collides = false;
    if(typeof(intersects) === 'undefined' || intersects === false){
      //check placed furniture 
      restrictedFurn.forEach(function(item){
        if(checkOverlap(item, tracerObj)){
          collides = true;
        }
      });
      //check other furniture
      if(typeof(checkOtherFurn) === 'undefined' || checkOtherFurn === true){
        otherFurn.forEach(function(item){
          if(checkOverlap(item, tracerObj)){
            collides = true;
          }
        });
      }
      //check door
      if(checkOverlap(door, tracerObj)){
        collides = true;
      }
    }else{
      //check placed furniture 
      restrictedFurn.forEach(function(item){
        if(checkIntersect(item, tracerObj)){
          collides = true;
        }
      });
      //check other furniture
      if(typeof(checkOtherFurn) === 'undefined' || checkOtherFurn === true){
        otherFurn.forEach(function(item){
          if(checkIntersect(item, tracerObj)){
            collides = true;
          }
        });
      }
      //check door
      if(checkIntersect(door, tracerObj)){
        collides = true;
      }
    }
    return collides;
  }
  function moveTracerVertical(tracer, remainingSpace){
    var firstFree = true;
    var save = false;
    var gap = {x: '', y: '', width: '', height: ''};
    while(tracer.y < floor.height + floor.y){
      spaceTaken = checkAllCollisions(tracer, false);
      if(!spaceTaken){
        if(firstFree){
          //log start of gap
          gap.x = tracer.x;
          gap.y = tracer.y; 
          firstFree = false;     
        }else if(tracer.y + tracer.height === floor.y + floor.height){ //if hits end of walll
          tracer.y += 50;
          save = true;
        }
      }else{
        if(!firstFree){
          save = true;
        }
      }
      if(save){
        //log end of gap
        gap.width = tracer.width;  
        gap.height = tracer.y - gap.y;
        if(tracer.x === 50){
          gap.orientation = 'west';
          remainingSpace.west.push(gap);
        }else{
          gap.orientation = 'east';
          gap.x += 50; //accounts for anchor
          remainingSpace.east.push(gap);
        }
        firstFree = true;
        gap = {x: '', y: '', width: '', height: ''};
        save = false;
      }
      tracer.y += 50;
    }
  }
  function moveTracerHorizontal(tracer, remainingSpace){
    var firstFree = true;
    var save = false;
    var gap = {x: '', y: '', width: '', height: ''};
    while(tracer.x < floor.width + floor.x){
      spaceTaken = checkAllCollisions(tracer, false);
      if(!spaceTaken){
        if(firstFree){
          //log start of gap
          gap.x = tracer.x;
          gap.y = tracer.y; 
          firstFree = false;     
        }
        if(tracer.x + tracer.width === floor.x + floor.width){ //if hits end of walll
          tracer.x += 50;
          save = true;
        }
      }else{
        if(!firstFree){
          save = true;
        }
      }
      if(save){
        //log end of gap
        gap.width = tracer.x - gap.x;  
        gap.height = tracer.height;
        if(tracer.y === 50){
          gap.orientation = 'north';
          remainingSpace.north.push(gap);
        }else{
          gap.orientation = 'south';
          gap.y +=50;//accounts for anchor
          remainingSpace.south.push(gap);
        }
        firstFree = true;
        gap = {x: '', y: '', width: '', height: ''};
        save = false;
      }
      tracer.x += 50;
    }
  }
})
