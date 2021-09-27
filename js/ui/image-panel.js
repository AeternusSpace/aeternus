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

    // this.root = new WLRoot(this.object, this.material,
    //   new ScrollableViewportWidget(
    //     new Column()
    //     .add(this.images),
    //     400,
    //     400
    //   ),
    // );
    // this.root.unitsPerPixel = 0.000625;
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
      this.images = tokens.map(token => {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = token.artifact_uri;
        return new Icon(img, 400, 400);
      });
      this.root = new WLRoot(this.object, this.material,
        new ScrollableViewportWidget(
          new Column()
          .add(this.images.slice(0, 4)),
          400,
          400
        ),
      );
      this.root.unitsPerPixel = 0.000625;
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