/**
 * Adapted from https://github.com/SignorPipo/wle_gamepad
 */

const GamepadHandedness =
{
    LEFT: "left",
    RIGHT: "right"
};

const ButtonType = {
    SELECT: 0,  //Trigger
    SQUEEZE: 1, //Grip
    THUMBSTICK: 3,
    BOTTOM_BUTTON: 4, // A or X button on oculus quest controller, also triggered for "touchpad" press on other controllers
    TOP_BUTTON: 5  // B or Y button
};

const ButtonEvent = {
    PRESS_START: 0,
    PRESS_END: 1,
    PRESSED: 2, //Every frame that it is pressed
    NOT_PRESSED: 3, //Every frame that it is not pressed
    TOUCH_START: 4,
    TOUCH_END: 5,
    TOUCHED: 6, //Every frame that it is touched
    NOT_TOUCHED: 7, //Every frame that it is not touched
    VALUE_CHANGED: 8,
    ALWAYS: 9, //callback every frame for this button
};

class ButtonInfo {
    constructor() {
        this.isPressed = false;
        this.isPrevPressed = false;

        this.isTouched = false;
        this.isPrevTouched = false;

        this.value = 0.0;
        this.prevValue = 0.0;
    }

    isPressStart() {
        return this.isPressed && !this.isPrevPressed;
    }

    isPressEnd() {
        return !this.isPressed && this.isPrevPressed;
    }

    isTouchStart() {
        return this.isTouched && !this.isPrevTouched;
    }

    isTouchEnd() {
        return !this.isTouched && this.isPrevTouched;
    }

    clone() {
        let value = new ButtonInfo();
        value.isPressed = this.isPressed;
        value.isPrevPressed = this.isPrevPressed;
        value.isTouched = this.isTouched;
        value.isPrevTouched = this.isPrevTouched;
        value.value = this.value;
        value.prevValue = this.prevValue;

        return value;
    }
};

const AxesEvent = {
    X_CHANGED: 0,
    Y_CHANGED: 1,
    AXES_CHANGED: 2,
    ALWAYS: 3
};

//index 0 is x, index 1 is y
class AxesInfo {
    constructor() {
        this.axes = new Float32Array(2);
        this.axes.fill(0.0);

        this.prevAxes = new Float32Array(2);
        this.prevAxes.fill(0.0);
    }

    clone() {
        let value = new AxesInfo();
        value.axes = this.axes;
        value.prevAxes = this.prevAxes;

        return value;
    }
};

class PulseData {
    constructor() {
        this.intensity = 0.0;
        this.duration = 0.0;

        this.isPulsing = false;
    }
};

/**
 * Lets you easily retrieve the current state of a gamepad and register to events
 * 
 * xr-standard mang is assumed for gamepad
 */
class Gamepad {

    /**
     * @param {GamepadHandedness} handedness specifies which controller this gamepad will represent, left or right
     */
    constructor(handedness) {
        this.handedness = handedness;

        this.buttonInfos = [];
        for (let key in ButtonType) {
            this.buttonInfos[ButtonType[key]] = new ButtonInfo();
        }

        this.axesInfo = new AxesInfo();

        this.selectStart = false;
        this.selectEnd = false;
        this.squeezeStart = false;
        this.squeezeEnd = false;

        this.session = null;
        this.inputSource = null;
        this.gamepad = null;

        this._buttonCallbacks = [];
        for (let typeKey in ButtonType) {
            this._buttonCallbacks[ButtonType[typeKey]] = [];
            for (let eventKey in ButtonEvent) {
                this._buttonCallbacks[ButtonType[typeKey]][ButtonEvent[eventKey]] = new Map(); //keys = object, item = callback
            }
        }

        this._axesCallbacks = [];
        for (let eventKey in AxesEvent) {
            this._axesCallbacks[AxesEvent[eventKey]] = new Map(); //keys = object, item = callback
        }

        this._pulseData = new PulseData();
    }

    /**
     * @param {ButtonType} buttonType
     * @returns {ButtonInfo}
     */
    getButtonInfo(buttonType) {
        return this.buttonInfos[buttonType].clone();
    }

    /**
     * @param {ButtonType} buttonType 
     * @param {ButtonEvent} buttonEvent 
     * @param id 
     * @param callback callback params are (ButtonInfo, Gamepad)
     */
    registerButtonEventListener(buttonType, buttonEvent, id, callback) {
        this._buttonCallbacks[buttonType][buttonEvent].set(id, callback);
    }

    /**
     * @param {ButtonType} buttonType 
     * @param {ButtonEvent} buttonEvent 
     * @param id 
     */
    unregisterButtonEventListener(buttonType, buttonEvent, id) {
        this._buttonCallbacks[buttonType][buttonEvent].delete(id);
    }

    /**
     * @returns {AxesInfo}
     */
    getAxesInfo() {
        return this.axesInfo.clone();
    }

    /**
     * @param {AxesEvent} axesEvent 
     * @param id 
     * @param callback callback parameters are (AxesInfo, Gamepad)
     */
    registerAxesEventListener(axesEvent, id, callback) {
        this._axesCallbacks[axesEvent].set(id, callback);
    }

    /**
     * @param {AxesEvent} axesEvent 
     * @param id 
     */
    unregisterAxesEventListener(axesEvent, id) {
        this._axesCallbacks[axesEvent].delete(id);
    }

    /**
     * @returns {boolean}
     */
    isGamepadActive() {
        //connected == null is to fix webxr emulator that leaves that field undefined
        return this.gamepad != null && (this.gamepad.connected == null || this.gamepad.connected);
    }

    /**
     * pulse, rumble, vibration, whatever
     * @param {number} intensity range from 0 to 1
     * @param {number} duration specified in seconds, 0 means 1 frame
     */
    pulse(intensity, duration) {
        this._pulseData.intensity = Math.min(Math.max(intensity, 0), 1); //clamp 
        this._pulseData.duration = Math.max(duration, 0);
    }

    stolse() {
        this._pulseData.intensity = 0;
        this._pulseData.duration = 0;
    }

    start() {
        if (WL.xrSession) {
            this._setupVREvents(WL.xrSession);
        } else {
            WL.onXRSessionStart.push(this._setupVREvents.bind(this));
        }
    }

    update(dt) {
        this._preUpdateButtonInfos();
        this._updateButtonInfos();
        this._postUpdateButtonInfos();

        this._preUpdateAxesInfos();
        this._updateAxesInfos();
        this._postUpdateAxesInfos();

        this._updatePulse(dt);
    }

    _preUpdateButtonInfos() {
        this.buttonInfos.forEach(function (item) {
            item.isPrevPressed = item.isPressed;
            item.isPrevTouched = item.isTouched;
            item.prevValue = item.value;
        });
    }

    _updateButtonInfos() {
        this._updateSelectAndSqueezePressed();
        this._updateSingleButtonInfo(ButtonType.SELECT, false);
        this._updateSingleButtonInfo(ButtonType.SQUEEZE, false);
        this._updateSingleButtonInfo(ButtonType.THUMBSTICK, true);
        this._updateSingleButtonInfo(ButtonType.BOTTOM_BUTTON, true);
        this._updateSingleButtonInfo(ButtonType.TOP_BUTTON, true);
    }

    //This sadly must be done this way to be the most compatible
    _updateSelectAndSqueezePressed() {
        let buttonSelect = this.buttonInfos[ButtonType.SELECT];

        if (this._setSelectStart) {
            buttonSelect.isPressed = true;
        }
        if (this._setSelectEnd) {
            buttonSelect.isPressed = false;
        }

        let buttonSqueeze = this.buttonInfos[ButtonType.SQUEEZE];
        if (this._setSqueezeStart) {
            buttonSqueeze.isPressed = true;
        }

        if (this._setSqueezeEnd) {
            buttonSqueeze.isPressed = false;
        }
    }

    _updateSingleButtonInfo(buttonType, updatePressed) {
        let button = this.buttonInfos[buttonType];
        let internalButton = this._getInternalButton(buttonType);

        if (updatePressed) {
            button.isPressed = internalButton.pressed;
        }

        button.isTouched = internalButton.touched;
        button.value = internalButton.value;
    }

    _postUpdateButtonInfos() {
        for (let typeKey in ButtonType) {
            let buttonInfo = this.buttonInfos[ButtonType[typeKey]];
            let buttonCallbacks = this._buttonCallbacks[ButtonType[typeKey]];

            //PRESSED
            if (buttonInfo.isPressed && !buttonInfo.isPrevPressed) {
                let callbacksMap = buttonCallbacks[ButtonEvent.PRESS_START];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            if (!buttonInfo.isPressed && buttonInfo.isPrevPressed) {
                let callbacksMap = buttonCallbacks[ButtonEvent.PRESS_END];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            if (buttonInfo.isPressed) {
                let callbacksMap = buttonCallbacks[ButtonEvent.PRESSED];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            } else {
                let callbacksMap = buttonCallbacks[ButtonEvent.NOT_PRESSED];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            //TOUCHED
            if (buttonInfo.isTouched && !buttonInfo.isPrevTouched) {
                let callbacksMap = buttonCallbacks[ButtonEvent.TOUCH_START];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            if (!buttonInfo.isTouched && buttonInfo.isPrevTouched) {
                let callbacksMap = buttonCallbacks[ButtonEvent.TOUCH_END];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            if (buttonInfo.isTouched) {
                let callbacksMap = buttonCallbacks[ButtonEvent.TOUCHED];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            } else {
                let callbacksMap = buttonCallbacks[ButtonEvent.NOT_TOUCHED];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            //VALUE
            if (buttonInfo.value != buttonInfo.prevValue) {
                let callbacksMap = buttonCallbacks[ButtonEvent.VALUE_CHANGED];
                this._triggerCallbacks(callbacksMap, buttonInfo);
            }

            //ALWAYS
            let callbacksMap = buttonCallbacks[ButtonEvent.ALWAYS];
            this._triggerCallbacks(callbacksMap, buttonInfo);
        }

        this._selectStart = false;
        this._selectEnd = false;
        this._squeezeStart = false;
        this._squeezeEnd = false;
    }

    _preUpdateAxesInfos() {
        this.axesInfo.prevAxes = this.axesInfo.axes;
    }

    _updateAxesInfos() {
        this.axesInfo.axes = this._getInternalAxes();
    }

    _postUpdateAxesInfos() {
        //X CHANGED
        if (this.axesInfo.axes[0] != this.axesInfo.prevAxes[0]) {
            let callbacksMap = this._axesCallbacks[AxesEvent.X_CHANGED];
            this._triggerCallbacks(callbacksMap, this.axesInfo);
        }

        //Y CHANGED
        if (this.axesInfo.axes[1] != this.axesInfo.prevAxes[1]) {
            let callbacksMap = this._axesCallbacks[AxesEvent.Y_CHANGED];
            this._triggerCallbacks(callbacksMap, this.axesInfo);
        }

        //AXES CHANGED
        if (!glMatrix.vec2.exactEquals(this.axesInfo.axes, this.axesInfo.prevAxes)) {
            let callbacksMap = this._axesCallbacks[AxesEvent.AXES_CHANGED];
            this._triggerCallbacks(callbacksMap, this.axesInfo);
        }

        //ALWAYS        
        let callbacksMap = this._axesCallbacks[AxesEvent.ALWAYS];
        this._triggerCallbacks(callbacksMap, this.axesInfo);
    }

    _getInternalButton(buttonType) {
        let buttonData = { pressed: false, touched: false, value: 0 };
        if (this.isGamepadActive()) {
            if (buttonType < this.gamepad.buttons.length) {
                let gamepadButton = this.gamepad.buttons[buttonType];
                buttonData.pressed = gamepadButton.pressed;
                buttonData.touched = gamepadButton.touched;
                buttonData.value = gamepadButton.value;
            } else if (buttonType == ButtonType.BOTTOM_BUTTON && this.gamepad.buttons.length >= 3) {
                //This way if you are using a basic touch controller bottom button will work anyway
                let touchButton = this.gamepad.buttons[2];
                buttonData.pressed = touchButton.pressed;
                buttonData.touched = touchButton.touched;
                buttonData.value = touchButton.value;
            }
        }

        return buttonData;
    }

    _getInternalAxes() {
        let axes = [0.0, 0.0];
        if (this.isGamepadActive()) {
            let internalAxes = this.gamepad.axes;
            if (internalAxes.length == 4) {
                //in this case it could be both touch axes or thumbstick axes, that depends on the controller
                //to surt both I simply choose the absolute max value (unused axes will always be 0)

                //X
                if (Math.abs(internalAxes[0]) > Math.abs(internalAxes[2])) {
                    axes[0] = internalAxes[0];
                } else {
                    axes[0] = internalAxes[2];
                }

                //Y
                if (Math.abs(internalAxes[1]) > Math.abs(internalAxes[3])) {
                    axes[1] = internalAxes[1];
                } else {
                    axes[1] = internalAxes[3];
                }

            } else if (internalAxes.length == 2) {
                axes[0] = internalAxes[0];
                axes[1] = internalAxes[1];
            }
        }

        //y axis is recorder negative when thumbstick is pressed forward for weird reasons
        axes[1] = -axes[1];

        return axes;
    }

    _updatePulse(dt) {
        let hapticActuator = this._getHapticActuator();
        if (hapticActuator) {
            if (this._pulseData.intensity > 0) {
                hapticActuator.pulse(this._pulseData.intensity, 1000); //duration is managed by this class
                this._pulseData.isPulsing = true;
            } else if (this._pulseData.isPulsing) {
                hapticActuator.reset();
                this._pulseData.isPulsing = false;
            }
        }

        this._pulseData.duration -= dt;
        if (this._pulseData.duration <= 0) {
            this._pulseData.intensity = 0;
            this._pulseData.duration = 0;
        }
    }

    _getHapticActuator() {
        let hapticActuator = null;

        if (this.isGamepadActive()) {
            if (this.gamepad.hapticActuators && this.gamepad.hapticActuators.length > 0) {
                hapticActuator = this.gamepad.hapticActuators[0];
            } else {
                hapticActuator = this.gamepad.vibrationActuator;
            }
        }

        return hapticActuator;
    }

    _setupVREvents(s) {
        this.session = s;

        this.session.addEventListener('end', function (event) {
            this.session = null;
            this.inputSource = null;
            this.gamepad = null;
        }.bind(this));

        this.session.addEventListener('inputsourceschange', function (event) {
            if (event.removed) {
                for (let item of event.removed) {
                    if (item.gamepad == this.gamepad) {
                        this.inputSource = null;
                        this.gamepad = null;
                    }
                }
            }

            if (event.added) {
                for (let item of event.added) {
                    if (item.handedness == this.handedness) {
                        this.inputSource = item;
                        this.gamepad = item.gamepad;
                    }
                }
            }
        }.bind(this));

        this.session.addEventListener('selectstart', this._setSelectStart);
        this.session.addEventListener('selectend', this._setSelectEnd);

        this.session.addEventListener('squeezestart', this._setSqueezeStart);
        this.session.addEventListener('squeezeend', this._setSqueezeEnd);
    }

    //Select and Squeeze are managed this way to be more compatible
    _setSelectStart(event) {
        if (event.inputSource.handedness == this.handedness) {
            this.selectStart = true;
        }
    }

    _setSelectEnd(event) {
        if (event.inputSource.handedness == this.handedness) {
            this.selectEnd = true;
        }
    }

    _setSqueezeStart(event) {
        if (event.inputSource.handedness == this.handedness) {
            this.squeezeStart = true;
        }
    }

    _setSqueezeEnd(event) {
        if (event.inputSource.handedness == this.handedness) {
            this.squeezeEnd = true;
        }
    }

    _triggerCallbacks(callbacksMap, info) {
        for (let value of callbacksMap.values()) {
            value(info, this);
        }
    }
};

export { Gamepad, GamepadHandedness };
