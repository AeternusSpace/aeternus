import { Margin, Label, TextButton, Column, Row, Icon, ScrollableViewportWidget } from '@rafern/canvas-ui';
import { WLRoot } from '@rafern/canvas-ui-wl';

WL.registerComponent('image-panel', {
  chain: {type: WL.Type.Enum, values: ['eth','tez'], default: 'eth'},
  walletObject: {type: WL.Type.Object},
  /** Material to apply the canvas texture to */
  material: {type: WL.Type.Material},
}, {
  init() {
    this.images = [];

    this.column = new Column();
    this.scrollView = new ScrollableViewportWidget(this.column, 400, 400);
    this.root = new WLRoot(this.object, this.material, this.scrollView);
    this.root.unitsPerPixel = 0.000625;
  },
  start: function() {
    this.wallet = this.walletObject.getComponent('wallet');
  },
  update(_dt) {
    if(this.root)
      this.root.update();
  },
  show: async function() {
    if (this.chain) { 
      const tokens = await this.wallet.getTezosTokens();
      tokens.forEach(async token => {
        const blob = await (await fetch(token.artifact_uri)).blob();
        if (blob.type.includes('image')) {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.src = URL.createObjectURL(blob);
          this.column.add(new Icon(img, 400, 400));
        }
        else if (blob.type.includes('video')) {
          const vid = document.createElement('video');
          vid.crossOrigin = 'anonymous';
          vid.autoplay = true;
          vid.loop = true;
          vid.src = URL.createObjectURL(blob);
          this.column.add(new Icon(vid, 400, 400));
        }
      });
      this.images = this.column.children;
    }    
  },  
  onActivate() {
    if(this.root)
      this.root.enabled = true;
  },
  onDeactivate() {
    if(this.root)
      this.root.enabled = false;
  },
});