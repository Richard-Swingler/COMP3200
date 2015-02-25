angular.module('furniture-creator.controllers', [])

.controller('FurnitureCtrl', function($scope, $ionicModal, $ionicScrollDelegate) {
  $scope.furnitures = {};
  $scope.furn = {};
  $scope.choice = null;

  $scope.checkRadio = function(selected){
    //console.log();
    console.log(selected);
  };
  var count = 0;
  $scope.addItem = function(){
    $scope.new = true;
    $scope.createBlock($scope.furn['name']);
    $scope.closeModal();
    $scope.furnitures[$scope.furn['name']] = {name: $scope.furn['name'], recX: '', recY: ''};
    $ionicScrollDelegate.scrollBottom();
    count++;
  };
  $scope.solve = function(){
    var hi = JSON.parse(window.localStorage.getItem('furniture'));
        for(var key in hi){
            console.log(hi[key]);
            console.log(hi[key]['recX']);
        }
    window.open("#/solve");
  };
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };  

  $scope.createBlock = function(name){
    var furnEditor = new Phaser.Game(800, 705, Phaser.AUTO, 'furnCanvas', { preload: preload, create: create, update:update, render:render}, false);
    var logo, bottom_left, create_button, box, bmd, shadow, recX, recY, orX, orY, save_button; //initialise global variables [TODO] Replace by this. when eventually using states
    function preload(){
        var hi = JSON.parse(window.localStorage.getItem("floor"));
        furnEditor.load.image('grid', 'img/grid.png');
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
        create_button = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.height -100, 'create_button', createButton, this, 2, 1, 0);
        create_button.on = false;
        function createButton(){
          create_button.on = !create_button.on; 
          if(create_button.on) {
            create_button.visible = false;
          }else{
            create_button.loadTexture('create_button', 0, false);
          }
        }
    }
    function update(){
      if(furnEditor.input.activePointer.isDown && create_button.on){
        if(furnEditor.input.activePointer.justPressed(50)){
          orX = furnEditor.input.activePointer.x;
          orY = furnEditor.input.activePointer.y;
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
        bmd = furnEditor.add.bitmapData(recX,recY);
        // setup bitmap colour
        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,recX,recY);
        bmd.ctx.fillStyle = '#0080ff';
        bmd.ctx.fill(); 
        //creates box sprite from shadow
        shadow = null;
        box = furnEditor.add.sprite(orX, orY, bmd);
        box.inputEnabled = true;
        box.input.enableDrag();
        box.input.enableSnap(50, 50, false, true);
        $scope.furnitures[name]['recX'] = recX;
        $scope.furnitures[name]['recY'] = recY;
        console.log($scope.furnitures);
        create_button.on = false; 
        create_button.kill();
        save_button = furnEditor.add.button(furnEditor.world.width - 200, furnEditor.world.height -100, 'save_button', function(){
          save_button.visible = false;
          if (!save_button.visible){
            window.localStorage.setItem('furniture', JSON.stringify($scope.furnitures));
            furnEditor.destroy();
          }
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
    
  }; 
});

