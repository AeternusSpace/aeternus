import { Margin, Label, TextButton, BasicTextInput, Column, Row, Theme, ThemeProperties } from '@rafern/canvas-ui';
import { WLRoot } from '@rafern/canvas-ui-wl';
/*global WL*/

WL.registerComponent('test-ui-root', {
  /** Material to apply the canvas texture to */
  material: {type: WL.Type.Material},
}, {
  init() {
    const label = new Label('Hello world!');
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
    this.root = new WLRoot(this.object, this.material,
      new Margin(
        new Column()
        .add(label)
        .add(new BasicTextInput())
        .add(
          new Row()
          .add(new TextButton('Button 1', () => label.source = 'Button 1 pressed!'))
          .add(new TextButton('Button 2', () => label.source = 'Button 2 pressed!'))
        )
      ),
      theme
    );
    this.root.unitsPerPixel = 0.0025;
  },
  update(_dt) {
    if(this.root)
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
});