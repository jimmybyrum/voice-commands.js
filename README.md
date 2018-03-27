voice-commands.js
=================

Simple wrapper for Javascript Speech-to-text to add voice commands.

### Example

```javascript
if ( SPEECH.isCapable() ) { // the browser supports speech recognition
    SPEECH.onStart(function() {
        // fires once browser recognition has started
    });
    SPEECH.onStop(function() {
        // fires when speech is manually stopped, or on error
    });
    SPEECH.min_confidence = .2; // the default minimum confidence you're willing to accept as a command
    SPEECH.addVoiceCommands([
        {
            command: "show help",
            callback: function() {
                // do something when the user says "show help". Maybe open a help dialog!
            },
            min_confidence: .5 // you can set a confidence level for each command individually
        },
        {
            command: /next (slide)?/,
            callback: function() {
                // this would fire when the user says "next" OR "next slide"
                // using a regex like that makes the voice command recognition
                // a bit more forgiving
            }
        },
        {
            command: /go.+(top|home)/, // regex to match commands more dynamically
            callback: function() {
                // the regex above would match:
                //  * go home
                //  * go to the top
            }
        }
    });
    SPEECH.onResult(function(result) {
        // fires after commands set via addVoiceCommands are parsed.
        // result.transcript is the object built by the speech recognition engine.
        // result.confidence is confidence in decimals (0.02392)
    });

    // gets things going. when speech recognition is ready,
    // onStart will be called.
    // you can also pass config here
    SPEECH.start({
        min_confidence: .3,
        lang: 'en-US' // defaults to HTML lang attribute value, or user agent's language
    });
}
```
