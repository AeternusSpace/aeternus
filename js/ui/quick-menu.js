WL.registerComponent('quick-menu', {
  top: {type: WL.Type.Object},
  bottom: {type: WL.Type.Object},
  left: {type: WL.Type.Object},
  right: {type: WL.Type.Object},
  menuObject: {type: WL.Type.Object}
}, {
  init: function() {
    this.summoned = false;

    this.tempPos = [0, 0, 0];
  },
  start: function() {
    this.navigation = this.top.getComponent('cursor-target');
    this.settings = this.bottom.getComponent('cursor-target');
    this.friends = this.left.getComponent('cursor-target');
    this.profile = this.right.getComponent('cursor-target');
    this.menu = this.menuObject.getComponent('menu');

    // Navigation button
    this.navigation.addClickFunction(() => {
      console.log('Clicked navigation button');
      this.object.parent.getTranslationWorld(this.tempPos);
      this.menu.show(this.tempPos, this.object.parent.rotationWorld, 'Navigation');
    });
    this.navigation.addHoverFunction(() => {
      this.navigation.object.getComponent('mesh').material.diffuseColor = [1, 0, 0, .8];
    });
    this.navigation.addUnHoverFunction(() => {
      this.navigation.object.getComponent('mesh').material.diffuseColor = [0, 0, 0, .8];
    });

    // Settings button
    this.settings.addClickFunction(() => {
      console.log('Clicked settings button');
      this.object.parent.getTranslationWorld(this.tempPos);
      this.menu.show(this.tempPos, this.object.parent.rotationWorld, 'Settings');
    });
    this.settings.addHoverFunction(() => {
      this.settings.object.getComponent('mesh').material.diffuseColor = [1, 0, 0, .8];
    });
    this.settings.addUnHoverFunction(() => {
      this.settings.object.getComponent('mesh').material.diffuseColor = [0, 0, 0, .8];
    });

    // Friends button
    this.friends.addClickFunction(() => {
      console.log('Clicked friends button');
      this.object.parent.getTranslationWorld(this.tempPos);
      this.menu.show(this.tempPos, this.object.parent.rotationWorld, 'Friends');
    });
    this.friends.addHoverFunction(() => {
      this.friends.object.getComponent('mesh').material.diffuseColor = [1, 0, 0, .8];
    });
    this.friends.addUnHoverFunction(() => {
      this.friends.object.getComponent('mesh').material.diffuseColor = [0, 0, 0, .8];
    });

    // Profile button
    this.profile.addClickFunction(() => {
      console.log('Clicked profile button');
      this.object.parent.getTranslationWorld(this.tempPos);
      this.menu.show(this.tempPos, this.object.parent.rotationWorld, 'Profile');
    });
    this.profile.addHoverFunction(() => {
      this.profile.object.getComponent('mesh').material.diffuseColor = [1, 0, 0, .8];
    });
    this.profile.addUnHoverFunction(() => {
      this.profile.object.getComponent('mesh').material.diffuseColor = [0, 0, 0, .8];
    });
  },
  update: function(dt) {
    //
  },
  show: function(position, r) {
    // Spawn the quick menu some distance in front of the controller
    this.object.setTranslationWorld(position);
    let theta = Math.atan2(r[1], r[3]);
    let newRot = [0, Math.sin(theta), 0, Math.cos(theta)];
    this.object.rotateObject(newRot);
    this.object.translateObject([0, 0, -0.1]);
  },
  hide: function() {
    // Hide the quick menu
    this.object.rotationWorld = [0, 0, 0, 1];
    this.object.translateObject([0, -30, 0]);
  }
});