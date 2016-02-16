'use strict';
(function() {
  var SpeechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.oSpeechRecognition ||
                          window.msSpeechRecognition;
  var recognition;
  var recognizing = false;
  var commands = [];

  if ( ! window.console) {
    window.console = {
      log: function() {}
    };
  }

  // now and debounce taken from underscore.js
  // by Jeremy Ashkenas http://underscorejs.org/
  var now = Date.now || function() { return new Date().getTime(); };
  var debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  var executeVoiceCommand = debounce(function(cmd) {
    cmd();
  }, 700, true);

  window.SPEECH = {
    _onStart: function() {},
    _onStop: function() {},
    _onResult: function() {},

    onStart: function(fn) {
      this._onStart = fn;
    },
    onStop: function(fn) {
      this._onStop = fn;
    },
    onResult: function(fn) {
      this._onResult = fn;
    },

    isCapable: function() {
      return recognition !== undefined;
    },

    stop: function() {
      if (recognizing) {
        recognizing = false;
        recognition.stop();
      }
    },

    start: function(config) {
      if (config) {
        if (config.min_confidence) {
          this.min_confidence = config.min_confidence;
        }
        if (config.lang) {
          recognition.lang = config.lang;
        }
      }
      if (recognizing) {
        recognition.stop();
        return;
      }
      recognition.start();
    },

    min_confidence: .5,

    addVoiceCommand: function(c) {
      if (typeof c.command === 'string') {
        c.command = new RegExp(c.command, 'i');
      }
      c.min_confidence = c.min_confidence || this.min_confidence;
      commands.push(c);
    },

    addVoiceCommands: function(commands) {
      var c, cl = commands.length;
      for (c = 0; c < cl; c++) {
        this.addVoiceCommand(commands[c]);
      }
    }
  };

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
      recognizing = true;
      SPEECH._onStart();
    };

    recognition.onerror = function(event) {
      SPEECH._onStop();
    };

    recognition.onend = function() {
      recognizing = false;
      SPEECH._onStop();
    };

    recognition.onresult = function(event) {
      var transcript = '';
      if ( ! event.results) {
        recognition.onend = null;
        recognition.stop();
        return;
      }
      var i, il = event.results.length;
      for (i = event.resultIndex; i < il; ++i) {
        var result = event.results[i];
        var confidence = result[0].confidence;
        if (result.isFinal) {
          transcript += result[0].transcript;
        } else {
          transcript += result[0].transcript;
        }
      }
      console.log(transcript, confidence);

      for (var c in commands) {
        var cmd = commands[c];
        if (transcript.match(cmd.command) && (confidence > cmd.min_confidence)) {
          executeVoiceCommand(cmd.callback);
        }
      }

      SPEECH._onResult({
        transcript: transcript,
        confidence: confidence
      });

    };
  }
}());
