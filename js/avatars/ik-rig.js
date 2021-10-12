import { vec3, quat } from 'gl-matrix';

WL.registerComponent('human-ik-rig', {
  head: {type: WL.Type.Object},
  upperLeftArm: {type: WL.Type.Object},
  lowerLeftArm: {type: WL.Type.Object},
  leftHand: {type: WL.Type.Object}
}, {
  init: function() {
    this.upperLeftArmLength = 0;
    this.lowerLeftArmLength = 0;
  },
  start: function() {
  
  },
  update: function(dt) {
      
  },
});