WL.registerComponent('network-buttons', {
  peerManagerObject: {type: WL.Type.Object},
  hostButton: {type: WL.Type.Object},
  joinButton: {type: WL.Type.Object},
  cursor: {type: WL.Type.Object},
}, {
  start: function() {
    this.pm = this.peerManagerObject.getComponent('peer-manager');
    this.hostButtonCollider = this.hostButton.getComponent('collision');
    this.hostButton.getComponent('cursor-target').addClickFunction(function() {
      this.pm.host();
    }.bind(this));
    this.joinButtonCollider = this.joinButton.getComponent('collision');
    this.joinButton.getComponent('cursor-target').addClickFunction(function() {
      this.pm.join();
    }.bind(this));
    this.pm.addConnectionEstablishedCallback(this.hide.bind(this));
    this.pm.addDisconnectCallback(this.show.bind(this));
  },
  show: function() {
    if(this.cursor.getComponent('cursor').setEnabled)
      this.cursor.getComponent('cursor').setEnabled(true);
    this.hostButtonCollider.active = true;
    this.joinButtonCollider.active = true;
    this.object.setTranslationLocal([0,0,-3])
  },
  hide: function() {
    if(this.cursor.getComponent('cursor').setEnabled)
      this.cursor.getComponent('cursor').setEnabled(false);
    this.hostButtonCollider.active = false;
    this.joinButtonCollider.active = false;
    this.object.setTranslationLocal([0,-300,0])
  }
});
