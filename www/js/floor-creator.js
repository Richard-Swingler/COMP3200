angular.module('floor-creator.controllers', [])

.controller('FloorCtrl', function($scope) {
  var editor = new Phaser.Game(1024, 705, Phaser.AUTO, 'canvas', { preload: preload, create: create, update:update, render:render}, false);
  var logo, create_button, floor, bmd, shadow, grid, windows, plug, carouselBg, recX, recY, orX, orY, save_button, carousel, door, doorShadow; //initialise global variables [TODO] Replace by this. when eventually using states
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

      save_button = editor.add.button(editor.world.width - 200, editor.world.height -100, 'save_button', function(){
        window.localStorage.setItem("floor", JSON.stringify({orX: orX, orY: orY, recX: recX, recY: recY}));
        floor.x = 100;
        floor.y = 50;
        editor.world.sendToBack(floor);
        editor.world.sendToBack(grid);

        save_button.visible = false;
        carousel.visible = true;
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
    console.log(editor.width);
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
    door.input.enableDrag();
    door.input.enableSnap(50, 50, true, true);
    door.events.onInputDown.add(dragDoor, this);
    door.events.onDragStop.add(dropDoor, this);
    windows = carousel.create(425, editor.height - 150, 'window');
    windows.height = 150;
    windows.width = 150;
    plug = carousel.create(600, editor.height - 150, 'plug');
    plug.height = 150;
    plug.width = 150;
    carousel.visible = false;
  }
  function dragDoor(sprite, pointer){
    console.log(sprite.x);
    door.loadTexture('grid', 0, false);
    door.height = 100;
    door.width = 100;
  }
  function dropDoor(sprite, pointer){
    
    
    if(onWall(floor, door)){
      console.log('yay');
      //group items
    } else{
      door.x = doorShadow.x;
      door.y = doorShadow.y;
      console.log('noooo');
      door.loadTexture('door', 0, false);
      door.height = 150;
      door.width = 150;
    }
  }
  function onWall(floor, feature){
    if (feature.x >= floor.x && feature.x <= floor.width && feature.y === floor.y){
      console.log('touching top');
      return true;
    }
    return false;
  }
})