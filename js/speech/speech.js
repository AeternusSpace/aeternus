import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';

WL.registerComponent('speech', {
    transcriptDisplay: {type: WL.Type.Object},
}, {
    init: function() {
        this.transcriptDisplayText = null;
        this.speechTargets = [];

        // Expose some properties that might need to be modified during runtime
        this.continuous = false;
        this.interimResults = false;

        this.speaking = false;
        
        const SpeechRecognition = window.webkitSpeechRecognition || createSpeechlySpeechRecognition(process.env.SPEECHLY_APPID);
        this.speechRecognition = new SpeechRecognition();
        if (SpeechRecognition == window.webkitSpeechRecognition) {
            console.log("This browser supports SpeechRecognition.");
            const grammar = `
                #JSGF V1.0;
                grammar action;
                public <action> = grow | shrink;
            `;
            const speechRecognitionList = new webkitSpeechGrammarList();
            speechRecognitionList.addFromString(grammar, 1);
            this.speechRecognition.grammars = speechRecognitionList;
            this.speechRecognition.lang = 'en-US';
            this.speechRecognition.maxAlternatives = 1;            
        }
        else {
            console.log("This browser does not natively support SpeechRecognition. Speechly polyfill will be used.");
        }
        this.speechRecognition.continuous = this.continuous;
        this.speechRecognition.interimResults = this.interimResults;

        document.addEventListener('keydown', e => {
            if (e.code === 'Space') {
                this.startSpeechRecognition();
            }              
        });
        document.addEventListener('keyup', e => {
            if (e.code === 'Space') {                    
                this.stopSpeechRecognition();
            }   
        });
        this.speechRecognition.onresult = e => {
            const transcript = e.results[0][0].transcript;
            console.log(transcript);
            this.transcriptDisplayText.text = transcript;
            this.parse(transcript);
        }
    },
    start: function() {
        this.transcriptDisplayText = this.transcriptDisplay.getComponent('text');
    },
    startSpeechRecognition: function() {
        if (!this.speaking) {
            console.log('started speaking');
            this.speaking = true;
            this.speechRecognition.start();
        }
    },
    stopSpeechRecognition: function() {
        if (this.speaking) {
            console.log('finished speaking');
            this.speaking = false;
            this.speechRecognition.stop();
        }
    },
    parse: function(transcript) {
        const tokens = transcript.toLowerCase().split(' ');
        
        // Extract subject        
        let subject;
        this.speechTargets.forEach(target => {
            if (tokens.includes(target.name.toLowerCase())) {
                subject = target;
            }
        });
        if (!subject) {
            console.log("No speech target found!");
            return;
        }

        // Extract action
        let action;
        subject.functionList.forEach(func => {
            if (tokens.includes(func)) {
                action = func;
            }
        });
        if (!action) {
            console.log("Action not found on speech target!");
            return;
        }

        // Call the specified action on the speech target
        subject.call(action);
    }
});
