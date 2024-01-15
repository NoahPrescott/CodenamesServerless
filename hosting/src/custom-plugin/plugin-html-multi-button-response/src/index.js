"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jspsych_1 = require("jspsych");
var info = {
    name: "html-multi-button-response",
    parameters: {
        stimulus: {
            type: jspsych_1.ParameterType.HTML_STRING,
            pretty_name: 'Stimulus',
            default: undefined,
            description: 'The HTML string to be displayed'
        },
        choices: {
            type: jspsych_1.ParameterType.STRING,
            pretty_name: 'Choices',
            default: undefined,
            array: true,
            description: 'The labels for the buttons.'
        },
        button_html: {
            type: jspsych_1.ParameterType.STRING,
            pretty_name: 'Button HTML',
            default: '<button class="jspsych-btn">%choice%</button>',
            array: true,
            description: 'The html of the button. Can create own style.'
        },
        prompt: {
            type: jspsych_1.ParameterType.STRING,
            pretty_name: 'Prompt',
            default: null,
            description: 'Any content here will be displayed under the button.'
        },
        stimulus_duration: {
            type: jspsych_1.ParameterType.INT,
            pretty_name: 'Stimulus duration',
            default: null,
            description: 'How long to hide the stimulus.'
        },
        trial_duration: {
            type: jspsych_1.ParameterType.INT,
            pretty_name: 'Trial duration',
            default: null,
            description: 'How long to show the trial.'
        },
        margin_vertical: {
            type: jspsych_1.ParameterType.STRING,
            pretty_name: 'Margin vertical',
            default: '0px',
            description: 'The vertical margin of the button.'
        },
        margin_horizontal: {
            type: jspsych_1.ParameterType.STRING,
            pretty_name: 'Margin horizontal',
            default: '8px',
            description: 'The horizontal margin of the button.'
        },
        response_ends_trial: {
            type: jspsych_1.ParameterType.BOOL,
            pretty_name: 'Response ends trial',
            default: true,
            description: 'If true, then trial will end when user responds.'
        },
        button_label: {
            type: jspsych_1.ParameterType.STRING,
            pretty_name: 'Button label',
            default: 'Continue',
            description: 'The text that appears on the button to finish the trial.'
        },
    }
};
/**
 * **html-multi-button-response**
 *
 * {description}
 *
 * @author {author}
 * @see {@link {documentation-url}}}
 */
var HTMLMultiButtonResponse = /** @class */ (function () {
    function HTMLMultiButtonResponse(jsPsych) {
        this.jsPsych = jsPsych;
    }
    HTMLMultiButtonResponse.prototype.trial = function (display_element, trial) {
        // display stimulus
        var html = '<div id="jspsych-html-multi-button-response-stimulus">' + trial.stimulus + '</div>';
        html += '<br>';
        //display buttons
        var buttons = [];
        if (Array.isArray(trial.button_html)) {
            if (trial.button_html.length == trial.choices.length) {
                buttons = trial.button_html;
            }
            else {
                console.error('Error in html-multi-button-response plugin. The length of the button_html array does not equal the length of the choices array');
            }
        }
        else {
            for (var i = 0; i < trial.choices.length; i++) {
                buttons.push(trial.button_html);
            }
        }
        html += '<div id="jspsych-html-multi-button-response-btngroup">';
        for (var i = 0; i < trial.choices.length; i++) {
            var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
            if ((i % 4) == 0) {
                html += '<br>';
            }
            html += '<div class="jspsych-html-multi-button-response-button" style="display: inline-block; margin:' + trial.margin_vertical + ' ' + trial.margin_horizontal + '" id="jspsych-html-multi-button-response-button-' + i + '" data-choice="' + i + '">' + str + '</div>';
        }
        html += '</div>';
        html += '<br></br>';
        //show prompt if there is one
        if (trial.prompt !== null) {
            html += trial.prompt;
        }
        // add submit button
        html += '<input type="submit" id="jspsych-html-multi-button-response-next" class="jspsych-btn jspsych-html-multi-button-response" value="' + trial.button_label + '"></input>';
        display_element.innerHTML = html;
        // start time
        var start_time = performance.now();
        var choiceList = [];
        // add event listeners to buttons
        for (var i = 0; i < trial.choices.length; i++) {
            display_element
                .querySelector('#jspsych-html-multi-button-response-button-' + i)
                .addEventListener('click', function (e) {
                //add to list when clicked, or if already in list, remove
                var btn_el = e.currentTarget;
                var choiceIndex = btn_el.getAttribute('data-choice');
                if (choiceList.includes(trial.choices[choiceIndex])) {
                    choiceList.splice(choiceList.indexOf(trial.choices[choiceIndex]), 1);
                    deactivateItem(e.target);
                }
                else {
                    choiceList.push(trial.choices[choiceIndex]);
                    activateItem(e.target);
                }
            });
        }
        function activateItem(e) {
            e.className += "-activeItem";
        }
        function deactivateItem(e) {
            e.className = e.className.substring(0, e.className.length - 11);
        }
        // store response
        var response = {
            rt: null,
            button: null
        };
        // function to handle responses by the subject
        display_element.querySelector('#jspsych-html-multi-button-response-next').addEventListener('click', function (e) {
            if (choiceList.length != 3) {
                return false;
            }
            ;
            // measure rt
            var end_time = performance.now();
            var rt = end_time - start_time;
            //response.button = parseInt(choice);
            response.rt = rt;
            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#jspsych-html-multi-button-response-stimulus').className += ' responded';
            // disable all the buttons after a response
            var btns = document.querySelectorAll('.jspsych-html-multi-button-response-button button');
            for (var i = 0; i < btns.length; i++) {
                //btns[i].removeEventListener('click');
                btns[i].setAttribute('disabled', 'disabled');
            }
            end_trial();
        });
        // function to end trial when it is time
        function end_trial() {
            // kill any remaining setTimeout handlers
            this.jsPsych.pluginAPI.clearAllTimeouts();
            // gather the data to store for the trial
            var trial_data = {
                rt: response.rt,
                stimulus: trial.stimulus,
                chosen_words: choiceList,
                //response: response.button
            };
            // clear the display
            display_element.innerHTML = '';
            // move on to the next trial
            this.jsPsych.finishTrial(trial_data);
        }
        ;
        // hide image if timing is set
        if (trial.stimulus_duration !== null) {
            this.jsPsych.pluginAPI.setTimeout(function () {
                display_element.querySelector('#jspsych-html-multi-button-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }
        // end trial if time limit is set
        if (trial.trial_duration !== null) {
            this.jsPsych.pluginAPI.setTimeout(function () {
                end_trial();
            }, trial.trial_duration);
        }
    };
    HTMLMultiButtonResponse.info = info;
    return HTMLMultiButtonResponse;
}());
exports.default = HTMLMultiButtonResponse;
