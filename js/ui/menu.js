WL.registerComponent('menu', {
  //imagePanel: {type: WL.Type.Object}
}, {
  init: function() {
  },
  start: function() {
    //
    this.imagePanel = this.object.getComponent('image-panel');
  },
  update: function(dt) {
    //
  },
  show: function(position, r) {
    // Spawn the menu some distance in front of the player
    this.object.setTranslationWorld(position);
    let theta = Math.atan2(r[1], r[3]);
    let newRot = [0, Math.sin(theta), 0, Math.cos(theta)];
    this.object.rotateObject(newRot);
    this.object.translateObject([0, 1.5, -0.1]);
    console.log(this.object);
    this.object.getComponent('image-panel').show();
  },
  hide: function() {
    // Hide the menu
    this.object.rotationWorld = [0, 0, 0, 1];
    this.object.translateObject([0, -30, 0]);
  }
});