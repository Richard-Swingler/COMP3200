angular.module('floor-creator.controllers', [])

.controller('FloorCtrl', function($scope, $ionicModal, $ionicScrollDelegate, $ionicPopup) {

  // Triggered on a button click, or some other target
  $scope.showPopup = function() {
    $scope.data = {} //creates scope variable for form submition

    // Custom pop up to prompt user for length of window
    var myPopup = $ionicPopup.show({
      template: '<input type="number" placeholder="Metres" ng-model="data.window">', 
      title: 'Enter Window width',
      subTitle: '1 Square = 1/2m',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.window) {
              //don't allow the user to close unless window width is entered
              e.preventDefault();
            } else {
              addWindow(); //create the window in the default location
            }
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  };
  var editor = new Phaser.Game(1024, 705, Phaser.AUTO, 'canvas', { preload: preload, create: create, update:update, render:render}, false);
  var logo, floorPlan, glass, create_button, floor, noDropBmd, bmd, shadow, grid, windows, plug, carouselBg, recX, recY, orX, orY, save_button, carousel, door, doorShadow; //initialise global variables [TODO] Replace by this. when eventually using states
  function preload(){
    editor.load.image('logo', 'img/ionic.png');
    editor.load.image('grid', 'img/grid.png');
    editor.load.image('create_button', 'img/create_box.png');
    editor.load.image('save_button', 'img/save.png');
    editor.load.image('door', 'img/door.png');
    editor.load.image('window', 'img/window.png');
    editor.load.image('plug', 'img/plug.png');
  }
  function create(){
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    editor.stage.backgroundColor = '#ffffff'; 
    grid = editor.add.tileSprite(0, 0, 1024, 705, "grid"); 
    create_button = editor.add.button(editor.world.width - 200, editor.world.height - 100, 'create_button', createButton, this, 2, 1, 0);
    create_button.on = false;
    function createButton(){
      create_button.on = !create_button.on; 
      if(create_button.on) {
        create_button.loadTexture('logo', 0, false);
      }else{
        create_button.loadTexture('create_button', 0, false);
      }
    }
    logo = editor.add.sprite(0, 0, 'logo');
    editor.physics.enable(logo, Phaser.Physics.ARCADE);
    createCarousel();
    logo.body.collideWorldBounds = true;
    logo.body.bounce.setTo(1, 1);
    logo.inputEnabled = true;
    logo.input.enableDrag();
  }
  function update(){
    rotateFeature(plug);
    rotateFeature(glass);
    if(editor.input.activePointer.isDown && create_button.on){
      if(editor.input.activePointer.justPressed(50)){
        orX = editor.input.activePointer.x;
        orY = editor.input.activePointer.y;
      }else{
        recX = editor.input.activePointer.x - orX;
        recY = editor.input.activePointer.y - orY;
        shadow = new Phaser.Rectangle(orX, orY, editor.input.activePointer.x - orX, editor.input.activePointer.y - orY);
      }
    } else if (create_button.on && editor.input.activePointer.justReleased(40) && !isNaN(recX)){
      if(isNegative(recX)){
        console.log(recX);
        [recX, orX] = [orX, recX];
        orX = Math.abs(orX);
      }
      if(isNegative(recY)){
        console.log(recY);
        [recY, orY] = [orY, recY];
        orY = Math.abs(orY);
      }
      recX = round(recX);
      recY = round(recY);
      orX = round(orX);
      orY = round(orY);
      bmd = editor.add.bitmapData(recX,recY);
      // setup bitmap colour
      bmd.ctx.beginPath();
      bmd.ctx.rect(0,0,recX,recY);
      bmd.ctx.fillStyle = '#ffffff';
      bmd.ctx.fill(); 
      //creates floor sprite from shadow
      shadow = null; //removes shadow
      floor = editor.add.sprite(orX, orY, bmd);
      floor.inputEnabled = true;
      floor.input.enableDrag();
      floor.input.enableSnap(50, 50, false, true);
      create_button.on = false; 
      create_button.kill();

      next_button = editor.add.button(editor.world.width - 200, editor.world.height -100, 'save_button', function(){
        //window.localStorage.setItem("floor", JSON.stringify({orX: orX, orY: orY, recX: recX, recY: recY}));
        floorPlan = editor.add.group();
        floorPlan.add(floor);
        floor.x = 100;
        floor.y = 50;
        floor.inputEnabled = false;
        next_button.visible = false;
        carousel.visible = true;
        noDropBmd = editor.add.bitmapData(floor.width, floor.height);
        // setup bitmap colour
        noDropBmd.ctx.beginPath();
        noDropBmd.ctx.rect(0,0,floor.width - 100, floor.height - 100);
        noDropBmd.ctx.fillStyle = '#ffffff';
        noDropBmd.ctx.fill(); 
        noDrop = editor.add.sprite(floor.x +50, floor.y +50, noDropBmd);
        editor.world.sendToBack(noDrop);
        editor.world.sendToBack(floor);
        editor.world.sendToBack(grid);
        save_button = editor.add.button(editor.world.width - 200, editor.world.height -100, 'save_button', function(){
          console.log('saved!!');
        }, this, 2, 1, 0);
        //window.open("#/app/furniture");
      }, this, 2, 1, 0);
    }
  }
  function render(){
    editor.debug.geom(shadow,'#ff4c4c');
  }
  function isNegative(x){
    return x < 0;
  }
  function round(x){
    return Math.round(x /50)*50;
  }
  function createCarousel(){
    carousel = editor.add.group();
    carouselBmd = editor.add.bitmapData(editor.width, 150);
    // setup bitmap colour
    carouselBmd.ctx.beginPath();
    carouselBmd.ctx.rect(0,0, editor.width, 150);
    carouselBmd.ctx.fillStyle = '#ffffff';
    carouselBmd.ctx.fill(); 
    carouselBg = carousel.create(0,editor.height - 150, carouselBmd);
    doorShadow = carousel.create(250, editor.height - 150, 'door');
    doorShadow.height = 150;
    doorShadow.width = 150;
    doorShadow.alpha = 0.2;
    door = carousel.create(250, editor.height - 150, 'door');
    door.height = 150;
    door.width = 150;
    door.inputEnabled = true;
    door.input.enableDrag();
    door.input.enableSnap(50, 50, true, true);
    door.events.onInputDown.add(dragDoor, this);
    door.events.onDragStop.add(dropDoor, this);
    windows = editor.add.button(425, editor.height - 150, 'window', function(){
      if(windows.alpha !== 0.2){
        $scope.showPopup();
      }
      }, this, 2, 1, 0);
    carousel.add(windows);
    windows.height = 150;
    windows.width = 150;    
    plugShadow = carousel.create(600, editor.height - 150, 'plug');
    plugShadow.height = 150;
    plugShadow.width = 150;
    plugShadow.alpha = 0.2;
    plug = carousel.create(600, editor.height - 150, 'plug');
    plug.height = 150;
    plug.width = 150;
    plug.inputEnabled = true;
    plug.input.enableDrag();
    plug.input.enableSnap(50, 50, true, true);
    plug.events.onInputDown.add(dragPlug, this);
    plug.events.onDragStop.add(dropPlug, this);
    carousel.visible = false;
  }
  function dragDoor(sprite, pointer){
    noDrop.visible = true;
    console.log(sprite.x);
    floor.tint = 0x00ff00;
    door.loadTexture('grid', 0, false);
    door.height = 100;
    door.width = 100;
  }
  function dragPlug(sprite, pointer){
    noDrop.visible = true;
    floor.tint = 0x00ff00;
    plug.loadTexture('grid', 0, false);
    plug.height = 50;
    plug.width = 200;
  }
  function dragGlass(sprite, pointer){
    noDrop.visible = true;
    floor.tint = 0x00ff00;
  }
  function dropDoor(sprite, pointer){
    floor.tint = 0xffffff;
    if(onWall(floor, door)){
      //group items
      floorPlan.add(door);
      door.inputEnabled = false;
    } else{
      door.x = doorShadow.x;
      door.y = doorShadow.y;
      door.loadTexture('door', 0, false);
      door.height = 150;
      door.width = 150;
    }
  }
  function dropPlug(sprite, pointer){
    floor.tint = 0xffffff;
    if(onWall(floor, plug)){
      //group items
      floorPlan.add(plug);
      plug.inputEnabled = false;
    } else{
      plug.x = plugShadow.x;
      plug.y = plugShadow.y;
      plug.loadTexture('plug', 0, false);
      plug.height = 150;
      plug.width = 150;
    }
  }
  function dropGlass(sprite, pointer){
    floor.tint = 0xffffff;
    if(onWall(floor, glass)){
      //group items
      floorPlan.add(glass);
      glass.inputEnabled = false;
    } else{
      glass.x = floor.x;
      glass.y = floor.y;
    }
  }
  addWindow = function(){
    //the window will in fact be more of a window arearea, where furniture with certain flags cannot be placed
    var bmd = editor.add.bitmapData(50 , round($scope.data.window * 100)); //converts metres into px according to grid and rounds to nearest 50 px block
    bmd.ctx.beginPath();
    bmd.ctx.rect(0 , 0, 50 , round($scope.data.window * 100)); //converts metres into px according to grid and rounds to nearest 50 px block
    bmd.ctx.fillStyle = '#00EEEE';
    bmd.ctx.fill(); 
    glass = editor.add.sprite(floor.x, floor.y, bmd);  
    glass.bringToTop();
    glass.inputEnabled = true;
    glass.input.enableDrag();
    glass.input.enableSnap(50, 50, true, true);
    glass.events.onInputDown.add(dragGlass, this);
    glass.events.onDragStop.add(dropGlass, this);
    windows.tint = 0xD3D3D3;
    windows.alpha = 0.2;
  }
  function onWall(floor, feature){
    console.log(checkOverlap(feature, floor));
    return checkOverlap(feature, floor) && checkOverlap(feature, noDrop) && checkNorth(floor, feature) || checkSouth(floor, feature) || checkWest(floor, feature) || checkEast(floor, feature);
  }
  function checkNorth(floor, feature){
    return checkOverlap(feature, floor) && feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.y;
  }
  function checkSouth(floor, feature){
    return checkOverlap(feature, floor) && feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.height || feature.y === floor.height - 50;
  }
  function checkWest(floor, feature){
    return checkOverlap(feature, floor) && feature.y >= floor.y && feature.y <= floor.height && feature.x === floor.x;
  }
  function checkEast(floor, feature){
    return checkOverlap(feature, floor) && feature.y >= floor.y && feature.y <= floor.height && feature.x === floor.width || feature.x === floor.width + 50;
  }
  function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.containsRect(boundsA, boundsB);
  }
  function rotateFeature(feature){
    if(floor != null && feature != null ){
      if(feature.width < feature.height && (checkNorth(floor, feature) || checkSouth(floor, feature))){
        temp = feature.width, feature.width = feature.height, feature.height = temp;
      }else if(feature.height < feature.width && (checkWest(floor, feature) || checkEast(floor, feature))){
        temp = feature.height, feature.height = feature.width, feature.width = temp;
      }
    }
  }
})