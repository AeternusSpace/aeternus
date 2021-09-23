import { Gamepad, GamepadHandedness } from './gamepad'

WL.registerComponent('input-manager', {
}, {
    init: function () {
        this.left = {
            gamepad: new Gamepad(GamepadHandedness.LEFT),
            hand: null
        }
        this.right = {
            gamepad: new Gamepad(GamepadHandedness.RIGHT),
            hand: null
        }
    },
    start: function () {
        this.left.gamepad.start();
        this.right.gamepad.start();
    },
    update: function (dt) {
        this.left.gamepad.update(dt);
        this.right.gamepad.update(dt);
    },
});
