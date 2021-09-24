import { Theme } from '@rafern/canvas-ui';
import { WLVirtualKeyboardRoot } from '@rafern/canvas-ui-wl';
/*global WL*/

WL.registerComponent('virtual-keyboard-ui-root2', {
  /** Material to apply the canvas texture to */
  material: {type: WL.Type.Material},
}, {
  init() {
    const theme = new Theme({
      containerPadding: {left: 16, right: 16, top: 16, bottom: 16},
      multiContainerSpacing: 16,
      sliderMinLength: 400,
      sliderThickness: 40,
      bodyTextFont: '64px Atkinson Hyperlegible',
      checkboxLength: 48,
      checkboxInnerPadding: 8,
      inputTextFont: '64px Atkinson Hyperlegible',
      inputTextInnerPadding: 8,
      inputTextMinWidth: 400,
      cursorThickness: 4,
      scrollBarThickness: 32,
      scrollBarMinPixels: 64,
    });
    this.root = new WLVirtualKeyboardRoot(this.object, this.material, undefined, undefined, theme);
    this.root.unitsPerPixel = 0.0025;
    this.forceDisabled = false;
  },
  update(_dt) {
    if(this.root && !this.forceDisabled) {
      this.root.updateVisibility();
      this.root.update();
    }
  },
  onActivate() {
    if(this.root) {
      this.forceDisabled = false;
      this.root.enabled = true;
    }
  },
  onDeactivate() {
    if(this.root) {
      this.forceDisabled = true;
      this.root.enabled = false;
    }
  },
});