WL.registerComponent('cube-test', {
    
}, {
    init: function() {
      this.spinning = false;      
    },
    start: function() {
    
    },
    update: function(dt) {
      if (this.spinning) {
        this.object.rotateAxisAngleDegObject([0, 1, 0], 1);
      }
    },
    spin: function() {
      this.spinning = true;
    },
    stop: function() {
      this.spinning = false;
    }
});