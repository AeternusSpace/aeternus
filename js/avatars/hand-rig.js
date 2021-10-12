import { quat } from 'gl-matrix';

WL.registerComponent('hand-rig', {
  leftHand: {type: WL.Type.Object},
  rightHand: {type: WL.Type.Object},
  leftTrackedHand: {type: WL.Type.Object},
  rightTrackedHand: {type: WL.Type.Object}
}, {
  init: function() {
    this.tempRot = [0, 0, 0, 0]
  },
  start: function() {
    this.leftJoints = this.leftTrackedHand.getComponent('hand-tracking').joints;
    this.rightJoints = this.rightTrackedHand.getComponent('hand-tracking').joints;

    this.left = {
      'wrist': this.leftHand,
      'thumb-metacarpal': this.leftHand.children[0],
      'thumb-phalanx-proximal': this.leftHand.children[7],
      'thumb-phalanx-distal': this.leftHand.children[6],
      'thumb-phalanx-tip': this.leftHand.children[5], //5
      'index-finger-metacarpal': null,
      'index-finger-phalanx-proximal': this.leftHand.children[1],
      'index-finger-phalanx-intermediate': this.leftHand.children[10],
      'index-finger-phalanx-distal': this.leftHand.children[9],
      'index-finger-phalanx-tip': this.leftHand.children[8], //8
      'middle-finger-metacarpal': null,
      'middle-finger-phalanx-proximal': this.leftHand.children[2],
      'middle-finger-phalanx-intermediate': this.leftHand.children[13],
      'middle-finger-phalanx-distal': this.leftHand.children[12],
      'middle-finger-phalanx-tip': this.leftHand.children[11], //11
      'ring-finger-metacarpal': null,
      'ring-finger-phalanx-proximal': this.leftHand.children[3],
      'ring-finger-phalanx-intermediate': this.leftHand.children[16],
      'ring-finger-phalanx-distal': this.leftHand.children[15],
      'ring-finger-phalanx-tip': this.leftHand.children[14], //14
      'pinky-finger-metacarpal': null,
      'pinky-finger-phalanx-proximal': this.leftHand.children[4],
      'pinky-finger-phalanx-intermediate': this.leftHand.children[19],
      'pinky-finger-phalanx-distal': this.leftHand.children[18],
      'pinky-finger-phalanx-tip': this.leftHand.children[17], //17
    }
    this.right = {
      'wrist': this.rightHand,
      'thumb-metacarpal': this.rightHand.children[0],
      'thumb-phalanx-proximal': this.rightHand.children[0].children[0],
      'thumb-phalanx-distal': this.rightHand.children[0].children[0].children[0],
      'thumb-phalanx-tip': null,
      'index-finger-metacarpal': null,
      'index-finger-phalanx-proximal': this.rightHand.children[1],
      'index-finger-phalanx-intermediate': this.rightHand.children[1].children[0],
      'index-finger-phalanx-distal': this.rightHand.children[1].children[0].children[0],
      'index-finger-phalanx-tip': null,
      'middle-finger-metacarpal': null,
      'middle-finger-phalanx-proximal': this.rightHand.children[2],
      'middle-finger-phalanx-intermediate': this.rightHand.children[2].children[0],
      'middle-finger-phalanx-distal': this.rightHand.children[2].children[0].children[0],
      'middle-finger-phalanx-tip': null,
      'ring-finger-metacarpal': null,
      'ring-finger-phalanx-proximal': this.rightHand.children[3],
      'ring-finger-phalanx-intermediate': this.rightHand.children[3].children[0],
      'ring-finger-phalanx-distal': this.rightHand.children[3].children[0].children[0],
      'ring-finger-phalanx-tip': null,
      'pinky-finger-metacarpal': null,
      'pinky-finger-phalanx-proximal': this.rightHand.children[4],
      'pinky-finger-phalanx-intermediate': this.rightHand.children[4].children[0],
      'pinky-finger-phalanx-distal': this.rightHand.children[4].children[0].children[0],
      'pinky-finger-phalanx-tip': null,
    }
  },
  update: function(dt) {
    if (this.leftJoints) {
      for (const joint in this.leftJoints) {
        if (this.left[joint] != null) {
          quat.invert(this.left[joint].transformLocal, this.leftJoints[joint].transformLocal);
        }
      }
    }
    if (this.rightJoints) {
      for (const joint in this.rightJoints) {
        if (this.right[joint] != null) {
          quat.invert(this.right[joint].rotationLocal, this.rightJoints[joint].rotationLocal);
        }
      }
    }
  },
});