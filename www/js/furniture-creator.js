angular.module('furniture-creator.controllers', [])

.controller('FurnitureCtrl', function($scope,  $ionicScrollDelegate, $ionicPopup, $ionicPlatform) {
  $scope.furnitures = {};
  $scope.furn = {};
  $scope.new = false;
  $scope.solve = function(){
    window.localStorage.setItem('furniture', JSON.stringify($scope.furnitures));
    window.open("#/solve/solution");
  };
  var furnEditor = new Phaser.Game(800, 705, Phaser.AUTO, 'furnCanvas', { preload: preload, create: create, update:update, render:render}, false);
  var logo, bottom_left, create_button, box, bmd, shadow, recX, recY, orX, orY, save_button, name; //initialise global variables [TODO] Replace by this. when eventually using states
  function preload(){
    furnEditor.load.image('grid', 'img/grid.png');
    furnEditor.load.image('create_button', 'img/create_box.png');
    furnEditor.load.image('save_button', 'img/save.png');
    furnEditor.load.image('full_grid', 'img/full_grid.png');
  }
  function create(){
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    furnEditor.stage.backgroundColor = '#ffffff'; 
    furnEditor.add.tileSprite(0, 0, 1024, 705, "full_grid"); 
  }
  function update(){
    if(furnEditor.input.activePointer.isDown && $scope.new){
      if(furnEditor.input.activePointer.justPressed(50)){
        orX = furnEditor.input.activePointer.x;
        orY = furnEditor.input.activePointer.y;
      }else{
        recX = furnEditor.input.activePointer.x - orX;
        recY = furnEditor.input.activePointer.y - orY;
        shadow = new Phaser.Rectangle(orX, orY, furnEditor.input.activePointer.x - orX, furnEditor.input.activePointer.y - orY);
      }
    } 
    else if($scope.new && furnEditor.input.activePointer.justReleased(40) && !isNaN(recX)){
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
      $scope.new = false;
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
  // Triggered on a button click, or some other target
  $scope.showPopup = function() {
    $scope.data = {}; //creates scope variable for form submition
    // Custom pop up to prompt user for length of window
    var newFurn = $ionicPopup.show({
      templateUrl: 'templates/addItem.html',  
      cssClass: 'popup',
      title: 'Add Furniture',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.furn) {
              //don't allow the user to close unless window width is entered
              e.preventDefault();
            } else {
              if(typeof(box) !== 'undefined'){
                box.visible = false;
              }
              // /$scope.scroll = true;
              $ionicScrollDelegate.scrollBottom();
              $scope.new = true;
              if($scope.furn['type'] === 'Bed' || $scope.furn['type'] === 'Desk'){
                $scope.furn['name'] = $scope.furn['type'];
              }
              name = $scope.furn['name'];
              $scope.furnitures[name] = {name: $scope.furn['name'], recX: '', recY: '', type: $scope.furn['type']};
              $scope.furn = {};
            }
          }
        }
      ]
    });
  };
  $scope.serverSideChange = function(item) {
    if(typeof(box) !== 'undefined'){
      console.log(item);
      box.x = 100;
      box.y = 100;
      box.height = item.recY;
      box.width = item.recX;
    }
  };
  $scope.remove = function(itemName){
    delete $scope.furnitures[itemName];
  }
});