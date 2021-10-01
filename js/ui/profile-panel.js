import { Icon, Label } from '@rafern/canvas-ui';

WL.registerComponent('profile-panel', {
  chain: {type: WL.Type.Enum, values: ['eth','tez'], default: 'eth'},
  walletObject: {type: WL.Type.Object}
}, {
  init() {
    // Blank
  },
  start: function() {
    this.wallet = this.walletObject.getComponent('wallet');
  },
  update(_dt) {
    // Blank
  },
  showInfo: async function(content) {
    content.add(new Label('Connections', { bodyTextAlign: 0.5 }));
    if (this.wallet.ethereumStatus == 2)
      content.add(new Label('Ethereum wallet connected'));
    if (this.wallet.tezosStatus == 2)
      content.add(new Label('Tezos wallet connected'));
  },
  showAvatar: async function(content) {
    // TODO
    content.add(new Label('Avatar'));
  },
  showInventory: async function(content) {
    if (this.chain) { 
      const tokens = await this.wallet.getTezosTokens();
      tokens.forEach(async token => {
        const blob = await (await fetch(token.artifact_uri)).blob();
        if (blob.type.includes('image')) {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.src = URL.createObjectURL(blob);
          content.add(new Icon(img, 256, 256));
        }
        else if (blob.type.includes('video')) {
          const vid = document.createElement('video');
          vid.crossOrigin = 'anonymous';
          vid.autoplay = true;
          vid.loop = true;
          vid.src = URL.createObjectURL(blob);
          content.add(new Icon(vid, 256, 256));
        }
      });
    }    
  },
});