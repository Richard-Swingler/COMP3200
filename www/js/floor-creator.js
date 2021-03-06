angular.module('floor-creator.controllers', [])

.controller('FloorCtrl', function($scope, $ionicModal, $ionicScrollDelegate, $ionicPopup) {
  // Triggered on a button click, or some other target
  $scope.showPopup = function() {
    $scope.data = {}; //creates scope variable for form submition
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
  $scope.showFloorPopup = function() {
    $scope.data = {}; //creates scope variable for form submition
    // Custom pop up to prompt user for length of window
    var popup = $ionicPopup.show({
      template: '<input type="number" placeholder="Width in m" ng-model="data.width"><input type="number" placeholder="Height in m" ng-model="data.height">', 
      title: 'Enter floor dimentions',
      subTitle: '1 Square = 1/2m',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        { text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.width || !$scope.data.height) {
              //don't allow the user to close unless dimentions are entered
              e.preventDefault();
              alert('Values are missing');
            } else {
              addFloor();
            }
          }
        }
      ]
    });
    popup.then(function(res) {
      console.log('Tapped!', res);
    });
  };
  var editor = new Phaser.Game(1024, 705, Phaser.AUTO, 'canvas', { preload: preload, create: create, update:update, render:render}, false);
  var logo, floorPlan, glass, floorCreate, create_button, floor, noDropBmd, bmd, shadow, grid, windows, plug, carouselBg, recX, recY, orX, orY, save_button, carousel, door, doorShadow; //initialise global variables [TODO] Replace by this. when eventually using states
  var create = true;
  var reset, made = false;
  function preload(){
    editor.load.image('create_button', 'img/create_box.png'); //dabuttonfactory.com/
    editor.load.image('save_button', 'img/save.png');//dabuttonfactory.com/
    editor.load.image('reset_button', 'img/button_reset.png');//dabuttonfactory.com/
    editor.load.image('door', 'img/door.png'); //https://lh3.googleusercontent.com/bAdeDTD6qXCO7XqxP6UZ1W-o_JBClH9zatJ6gVvvXKvfG0vfaUf6ufT5uHO4YnrbqjKMjQ=s85
    editor.load.image('window', 'img/window.png'); //https://www.google.co.uk/search?sa=G&q=clip+art+window&tbm=isch&tbs=simg:CAQSiQEahgELEKjU2AQaAggJDAsQsIynCBpfCl0IAxInoQbyBpUKvQLQEvQGV6IG8QagCeg2tyjnNsYhuyiCN7EoqTa-NqM0GjCR4Ib06PvgWui3oeLITPjM5UdL59eUZzuBs7QvRcMEbyzsbWqcOWpFi8ky_1Wo-ZPoMCxCOrv4IGgoKCAgBEgSCHNxYDA&ei=aIw7VZ7bAo35aPLJgcgC&ved=0CB0Qwg4oAA
    editor.load.image('plug', 'img/plug.png'); //https://lh3.googleusercontent.com/0qbFu9bVum2ulPYIPytXOjrplS1f-N-fdpUo9D2sf0SOx3628hVp7hjylUQ62fGkC545Hls=s85
    editor.load.image('full_grid', 'img/full_grid.png'); //https://lh3.googleusercontent.com/c3MBWvvre_BZ5Mr2DvaYRvEOMX_H2ietDlJdXXzjIP4u7SO66Ht8aolHtFLBM0zL0CVW5A=s128
    editor.load.image('banner', 'img/banner.png'); 
    editor.load.image('manual', 'img/manual.png'); 
    editor.load.image('door_tile', 'img/door_floorplan.png');//https://lh3.googleusercontent.com/YgIyOo9NvVLdXJxlMGIkIoQ7hHsm_WUVmzYhUgAZmV_XyJ1fJ3rTZ1rtZXsryQBPr46u6w=s85
    editor.load.image('plug_tile', 'img/plug_floorplan.png'); //https://lh3.googleusercontent.com/9LzKIWFdzS6DmcR8y3gP9hmMo7Jd5sm43aqLX_2MQqB3Dp0-1vptCKBQeuozb1Zxx5j-tw=s50
    editor.load.image('window_tile', 'img/window_floorplan.png'); //https://lh3.googleusercontent.com/MjEprep7aGb8s5v0nJdAS-GJUxP_2qYXiO-9GslgZkbL-qjRsUOSX7SqPRKjOnEFAg_ZDQ=s50
    editor.load.image('floor_fabric', 'img/fabricTile.jpg'); //https://lh3.googleusercontent.com/gSalXAf3MgmyRB76o48fdhdnODChmXB-fKAjQi5e3Mncdm012ZO3LQwdZclHBB10BmiM0w=s116
  }
  function create(){
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    editor.stage.backgroundColor = '#ffffff'; 
    grid = editor.add.tileSprite(0, 0, 1024, 705, "full_grid"); 
    createCarousel();
    floorCreate = editor.add.button(editor.width - 200, 55, 'manual', function(){
      if(windows.alpha !== 0.2){
        $scope.showFloorPopup();
      }
    }, this, 2, 1, 0);
  }
  function update(){
    rotateFeature(plug);
    rotateFeature(glass);
    if(editor.input.activePointer.isDown && create){
      reset = false;
      if(editor.input.activePointer.justPressed(50)){
        orX = editor.input.activePointer.x;
        orY = editor.input.activePointer.y;
      }else{
        recX = editor.input.activePointer.x - orX;
        recY = editor.input.activePointer.y - orY;
        shadow = new Phaser.Rectangle(orX, orY, editor.input.activePointer.x - orX, editor.input.activePointer.y - orY);
      }
    } else if (create && editor.input.activePointer.justReleased(40) && !isNaN(recX) && !reset){
      if(isNegative(recX)){
        [recX, orX] = [orX, recX];
        orX = Math.abs(orX);
      }
      if(isNegative(recY)){
        [recY, orY] = [orY, recY];
        orY = Math.abs(orY);
      }
      recX = round(recX);
      recY = round(recY);
      orX = round(orX);
      orY = round(orY);
      //creates floor sprite from shadow
      shadow = null; //removes shadow
      floor = editor.add.tileSprite(orX, orY,recX,recY, 'floor_fabric');
      floor.alpha = 0.8;
      floor.inputEnabled = true;
      floor.input.enableDrag();
      floor.input.enableSnap(50, 50, false, true);
      create = false; 
    }
    if(!create && !made){  
      made = true;
      window.localStorage.setItem("floor", JSON.stringify({orX: orX, orY: orY, recX: recX, recY: recY}));
      floorPlan = editor.add.group();
      floor.x = 100;
      floor.y = 50;
      floor.inputEnabled = false;
      floorCreate.visible = false;
      carousel.visible = true;
      noDrop = editor.add.tileSprite(floor.x +50, floor.y +50,floor.width - 100,floor.height - 100, 'floor_fabric');
      editor.world.sendToBack(noDrop);
      editor.world.sendToBack(floor);
      editor.world.sendToBack(grid);
      save_button = editor.add.button(editor.world.width - 200, editor.world.height -100, 'save_button', function(){
        var features = {};
        floorPlan.forEach(function(item) {
            features[item.name] = {name: item.name, x: item.x, y: item.y, width: item.width, height: item.height, type: item.type};
        }, this);
        window.localStorage.setItem('features', JSON.stringify(features));
        console.log('saved!!');
        window.open("#/app/furniture");
      }, this, 2, 1, 0);
      reset_button = editor.add.button(editor.world.x + 100, editor.world.height -100, 'reset_button', function(){
        made = false;
        reset = true;
        create = true;
        floorCreate.visible = true;
        floor.visible = false;
        noDrop.visible = false;
        carousel.visible = false;
        reset_button.visible=false;
        carousel.destroy(true, true);
        floorPlan.destroy(true, true);
        save_button.destroy();
        createCarousel();
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

    var banner = editor.add.tileSprite(0, editor.height - 150, editor.width, 150, 'banner');
    carouselBg = carousel.add(banner);

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
    door.events.onInputDown.add(dragObj, this);
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
  function dragObj(sprite, pointer){
    noDrop.visible = true;
    console.log(sprite.x);
    floor.tint = 0x00ff00;
    door.loadTexture('door_tile', 0, false);
    door.height = 100;
    door.width = 100;
  }
  function dragPlug(sprite, pointer){
    noDrop.visible = true;
    floor.tint = 0x00ff00;
    plug.loadTexture('plug_tile', 0, false);
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
      door.name = 'door1';
      door.type = 'door';
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
      plug.name = 'plug1';
      plug.type = 'plug';
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
      glass.type = 'window';
      glass.name = 'window1';
      floorPlan.add(glass);
      glass.inputEnabled = false;
    } else{
      glass.x = floor.x;
      glass.y = floor.y;
    }
  }
  addWindow = function(){
    //the window will in fact be more of a window area, where furniture with certain flags cannot be placed
    glass = editor.add.tileSprite(floor.x, floor.y +50, 50 , round($scope.data.window * 100), 'window_tile');  //converts metres into px according to grid and rounds to nearest 50 px block
    glass.inputEnabled = true;
    glass.input.enableDrag();
    glass.input.enableSnap(50, 50, true, true);
    glass.events.onInputDown.add(dragGlass, this);
    glass.events.onDragStop.add(dropGlass, this);
    windows.tint = 0xD3D3D3;
    windows.alpha = 0.2;
  }
  addFloor = function(){
    floor = editor.add.tileSprite(50, 50, round($scope.data.width * 100), round($scope.data.height * 100), 'floor_fabric');
    floor.alpha = 0.8;
    create = false; 
  }
  function onWall(floor, feature){
    var onwall = checkNorth(floor, feature) || checkSouth(floor, feature) || checkWest(floor, feature) || checkEast(floor, feature);
    return checkOverlap(feature, floor) && onwall;
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
  function rotateFeature(feature){
    //roatates rectangular when wall it hit to aling with it -- experimental
    if(floor != null && feature != null ){
      if(feature.width < feature.height && (checkNorth(floor, feature) || checkSouth(floor, feature))){
        temp = feature.width, feature.width = feature.height, feature.height = temp; //swap width with height 
      }else if(feature.height < feature.width && (checkWest(floor, feature) || checkEast(floor, feature))){
        temp = feature.height, feature.height = feature.width, feature.width = temp; //swap width with height 
      }
    }
  }
})