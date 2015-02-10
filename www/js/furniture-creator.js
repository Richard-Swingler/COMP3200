angular.module('furniture-creator.controllers', [])

.controller('FurnitureCtrl', function($scope) {
  var furnEditor = new Phaser.Game(800, 705, Phaser.AUTO, 'furnCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var logo, bottom_left, create_button, box, bmd, shadow, recX, recY, orX, orY, save_button; //initialise global variables [TODO] Replace by this. when eventually using states
  function preload(){
      furnEditor.load.image('logo', 'img/ionic.png');
      furnEditor.load.image('grid', 'img/grid.png');
      furnEditor.load.image('bottom_right', 'img/bottom_right.png');
      furnEditor.load.image('bottom_left', 'img/bottom_left.png');
      furnEditor.load.image('top_left', 'img/top_left.png');
      furnEditor.load.image('top_right', 'img/top_right.png');
      furnEditor.load.image('create_button', 'img/create_box.png');
      furnEditor.load.image('save_button', 'img/save.png');
  }
  function create(){
      //scaling options
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      //have the game centered horizontally
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      furnEditor.stage.backgroundColor = '#ffffff'; 
      furnEditor.add.tileSprite(0, 0, 1024, 705, "grid");  
      top_left = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.centerY - 100, 'top_left', function(){
        console.log(box.x);
        logo.x = box.x;    
        logo.y = box.y; 
        logo.bringToTop();     
      }, this, 2, 1, 0);
      top_left.visible = false;
      bottom_left = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.centerY - 50, 'bottom_left', function(){
        logo.x = box.x;    
        logo.y = box.y + box.height - logo.height;  
        logo.bringToTop();     
      }, this, 2, 1, 0);
      bottom_left.visible = false;
      bottom_right = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.centerY + 50, 'bottom_right', function(){
        logo.x = box.x + box.width - logo.width;    
        logo.y = box.y + box.height - logo.height;  
        logo.bringToTop();     
      }, this, 2, 1, 0);
      bottom_right.visible = false;
      top_right = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.centerY, 'top_right', function(){
        logo.x = box.x + box.width - logo.width;    
        logo.y = box.y;  
        logo.bringToTop();     
      }, this, 2, 1, 0);
      top_right.visible = false;
      create_button = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.height -100, 'create_button', createButton, this, 2, 1, 0);
      create_button.on = false;
      function createButton(){
        create_button.on = !create_button.on; 
        if(create_button.on) {
          create_button.loadTexture('logo', 0, false);
        }else{
          create_button.loadTexture('create_button', 0, false);
        }
      }
      logo = furnEditor.add.sprite(0, 0, 'logo');
      furnEditor.physics.enable(logo, Phaser.Physics.ARCADE);
      logo.body.collideWorldBounds = true;
      logo.body.bounce.setTo(1, 1);
      logo.inputEnabled = true;
      logo.input.enableDrag();
      //logo.body.velocity.x = 500;
  }
  function update(){
    if(furnEditor.input.activePointer.isDown && create_button.on){
      if(furnEditor.input.activePointer.justPressed(50)){
        orX = furnEditor.input.activePointer.x;
        orY = furnEditor.input.activePointer.y;
        //console.log(orX);
      }else{
        recX = furnEditor.input.activePointer.x - orX;
        recY = furnEditor.input.activePointer.y - orY;
        shadow = new Phaser.Rectangle(orX, orY, furnEditor.input.activePointer.x - orX, furnEditor.input.activePointer.y - orY);
      }
    } else if (create_button.on && furnEditor.input.activePointer.justReleased(40) && !isNaN(recX)){
      if(isNegative(recX)){
        console.log(recX);
        [recX, orX] = [orX, recX];
        orX = Math.abs(orX);
        console.log(orX);
        console.log(recX);
      }
      if(isNegative(recY)){
        console.log(recY);
        [recY, orY] = [orY, recY];
        orY = Math.abs(orY);
        console.log(orY)
        console.log(recY);
      }
      recX = round(recX);
      recY = round(recY);
      orX = round(orX);
      orY = round(orY);
      bmd = furnEditor.add.bitmapData(recX,recY);
      // setup bitmap colour
      bmd.ctx.beginPath();
      bmd.ctx.rect(0,0,recX,recY);
      bmd.ctx.fillStyle = '#ffffff';
      bmd.ctx.fill(); 
      //creates box sprite from shadow
      shadow = null;
      box = furnEditor.add.sprite(orX, orY, bmd);
      box.inputEnabled = true;
      box.input.enableDrag();
      box.input.enableSnap(50, 50, false, true);

      create_button.on = false; 
      create_button.kill();
      top_left.visible = true;
      top_right.visible = true;
      bottom_left.visible = true;
      bottom_right.visible = true;
      save_button = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.height -100, 'save_button', function(){
        window.open("#/app/furniture");
      }, this, 2, 1, 0);
    }
  }
  function render(){
    furnEditor.debug.geom(shadow,'#ff4c4c');
  }
  function isNegative(x){
    return x < 0;
  }
  function round(x){
    return Math.round(x /50)*50;
  }
})

