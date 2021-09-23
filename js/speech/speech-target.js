WL.registerComponent('speech-target', {
  name: {type: WL.Type.String, default: ''},
  speechObject: {type: WL.Type.Object},
  targetScript: {type: WL.Type.String, default: ''},
  functions: {type: WL.Type.String, default: ''}
}, {
  init: function() {
    this.functionList = this.functions.split(',');
  },
  start: function() {
    const speech = this.speechObject.getComponent('speech');
    speech.speechTargets.push(this);
    this.target = this.object.getComponent(this.targetScript);
  },
  call: function(func) {
    this.target[func]();
  }
});