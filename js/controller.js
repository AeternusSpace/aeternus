import * as glMatrix from 'gl-matrix';

WL.registerComponent(
	'controller',
	{
		handedness: {
			type: WL.Type.Enum,
			values: ['left', 'right'],
			default: 'left',
		},
		controlType: {
			type: WL.Type.Enum,
			values: ['move', 'rotate'],
			default: 'move',
		},
		controlSource: {
			type: WL.Type.Enum,
			values: ['thumbstick', 'touchpad'],
			default: 'thumbstick',
		},
		player: { type: WL.Type.Object, default: null },
		head: { type: WL.Type.Object, default: null },
		head2: { type: WL.Type.Object, default: null },
		moveSpeed: { type: WL.Type.Float, default: 1 },
		allowFly: { type: WL.Type.Bool, default: false },
		rotationType: {
			type: WL.Type.Enum,
			values: ['snap', 'smooth'],
			default: 'snap',
		},
		snapDegrees: { type: WL.Type.Int, default: 45 },
	},
	{
		init: function () {
			//Rotation
			this.justSnapped = false;
			this.snapDeadzone = 0.8; //Cannot snap turn again unless you go below this threshold

			//Interacting
			this.collider = this.object.getComponent('collision');
			this.grabControls = this.object.getComponent('grabbing-controls');

			//Movement limits for now
			this.min = -4;
			this.max = 4;
		},
		start: function () {
			//Start
		},
		update: function (dt) {
			let s = WL.xrSession;
			if (!s) return;

			//Handle input
			for (let i = 0; i < s.inputSources.length; ++i) {
				let input = s.inputSources[i];
				if (input.handedness == ['left', 'right'][this.handedness]) {
					let gamepad = input.gamepad;
					if (!gamepad) continue;

					//Gather input from controller
					let xAxis =
						this.controlSource == 'thumbstick'
							? gamepad.axes[0]
							: gamepad.axes[2];
					let yAxis =
						this.controlSource == 'thumbstick'
							? gamepad.axes[1]
							: gamepad.axes[3];
					let gripped = gamepad.buttons[1].pressed;

					//Handle movement and rotation
					if (this.controlType == 0) {
						this.move(xAxis, yAxis, dt);
					} else if (this.controlType == 1) this.rotate(xAxis, dt);

					//Handle button presses
					if (gripped) {
						this.grabControls.grab();
					} else {
						this.grabControls.drop();
					}
				}
			}
		},
		move: function (xAxis, yAxis, dt) {
			let direction = [xAxis, 0, yAxis];

			glMatrix.vec3.normalize(direction, direction);
			glMatrix.vec3.scale(direction, direction, dt);
			glMatrix.vec3.transformQuat(
				direction,
				direction,
				this.head.transformWorld
			);
			if (!this.allowFly) direction[1] = 0;
			this.player.translate(direction);

			//TODO: Either implement collision or clamp world translation
		},
		rotate: function (xAxis, dt) {
			if (this.rotationType == 0) {
				//Snap
				if (Math.abs(xAxis) >= .95 && !this.justSnapped) {
					let lastHeadPos = [0, 0, 0];
					this.head.transformWorld;
					this.head.getTranslationWorld(lastHeadPos);

					this.player.rotateAxisAngleDeg(
						[0, 1, 0],
						this.snapDegrees * -xAxis
					);
					this.justSnapped = true;

					this.head2.transformWorld;
					let currentHeadPos = [0, 0, 0];
					this.head.getTranslationWorld(currentHeadPos);

					let newPos = [0, 0, 0];
					glMatrix.vec3.sub(newPos, lastHeadPos, currentHeadPos);

					this.player.translate(newPos);
				} else if (Math.abs(xAxis) < 0.8) {
					this.justSnapped = false;
				}
			} else if (this.rotationType == 1) {
				//Smooth
				let lastHeadPos = [0, 0, 0];
        this.head.transformWorld;
        this.head.getTranslationWorld(lastHeadPos);

        this.player.rotateAxisAngleDeg(
          [0, 1, 0],
          -xAxis
        );

        this.head2.transformWorld;
        let currentHeadPos = [0, 0, 0];
        this.head.getTranslationWorld(currentHeadPos);

        let newPos = [0, 0, 0];
        glMatrix.vec3.sub(newPos, lastHeadPos, currentHeadPos);

        this.player.translate(newPos);
			}
		},
		getHeadPos: function () {
			let left = [0, 0, 0];
			this.head.getTranslationWorld(left);
			let right = [0, 0, 0];
			this.head2.getTranslationWorld(right);
			let center = [0, 0, 0];
			glMatrix.vec3.add(center, left, right);
			glMatrix.vec3.scale(center, center, 0.5);
			return center;
		},
		clamp: function (input, min, max) {
			return input < min ? min : input > max ? max : input;
		},
		grab: function () {
			if (this.currentInteractable.parent) {
				const invParent = glMatrix.quat2.create();
				glMatrix.quat2.invert(
					invParent,
					this.currentInteractable.parent.transformWorld
				);

				// Apply inverted parent to this objects world transform
				glMatrix.quat2.multiply(
					this.currentInteractable.transformLocal,
					invParent,
					this.object.transformWorld
				);
			} else {
				this.currentInteractable.transformLocal.set(
					this.object.transformWorld
				);
			}
			this.currentInteractable.setDirty();
			return;
		},
	}
);
