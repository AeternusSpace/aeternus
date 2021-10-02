import { MultiContainer, Label, TextButton, Column, Row, Icon, ScrollableViewportWidget } from '@rafern/canvas-ui';
import { WLRoot } from '@rafern/canvas-ui-wl';

WL.registerComponent('menu', {
  material: {type: WL.Type.Material}
}, {
  init: function() {
    // Create header
    this.title = new Label('Title', { canvasFill: 'darkblue' });
    this.hideButton = new TextButton('X', () => this.hide())
    this.header = new Row({ canvasFill: 'darkblue' });
    this.header.add(this.title);
    this.header.add(this.hideButton);

    // Create content
    this.content = new Column();
    this.contentContainer = new ScrollableViewportWidget(this.content, 256, 256);
    
    // Create tabs
    this.tabs = new Row();
    
    // Create menu
    this.menu = new MultiContainer(true);
    this.menu.add(this.header);
    this.menu.add(this.contentContainer);
    this.menu.add(this.tabs);

    // Create root canvas UI object
    this.root = new WLRoot(this.object, this.material, this.menu);
    this.root.unitsPerPixel /= 8;
  },
  start: function() {
    this.profilePanel = this.object.getComponent('profile-panel');
  },
  update(_dt) {
    if (this.root) 
      this.root.update();
  },
  onActivate() {
    if(this.root)
      this.root.enabled = true;
  },
  onDeactivate() {
    if(this.root)
      this.root.enabled = false;
  },
  show: function(position, r, panel) {
    this.tabs.needsClear = false;
    this.tabs.clearChildren();
    
    // Spawn the menu some distance in front of the player
    this.object.setTranslationWorld(position);
    let theta = Math.atan2(r[1], r[3]);
    let newRot = [0, Math.sin(theta), 0, Math.cos(theta)];
    this.object.rotationWorld = newRot;
    this.object.translateObject([0, -0.25, -0.75]);

    switch(panel) {
      case 'Profile':
        this.profilePanel.showInfo(this.content);
        this.title.source = 'Profile Info';
        
        this.tabs.add(new TextButton('Info', () => {
          this.clearMenu();
          this.profilePanel.showInfo(this.content);
          this.title.source = 'Profile Info';
        }));
        this.tabs.add(new TextButton('Avatar', () => {
          this.clearMenu();
          this.profilePanel.showAvatar(this.content);
          this.title.source = 'Avatar';
        }));
        this.tabs.add(new TextButton('Inventory', () => {
          this.clearMenu();
          this.profilePanel.showInventory(this.content);
          this.title.source = 'Inventory';
        }));
    }
  },
  hide: function() {
    // Hide the menu
    this.clearMenu();
    this.object.translateObject([0, -30, 0]);    
  },
  clearMenu: function() {
    this.content.clearChildren();
  }
});