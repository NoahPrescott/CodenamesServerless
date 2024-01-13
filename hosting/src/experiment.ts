import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response'
import jsPsychImageButtonResponse from '@jspsych/plugin-image-button-response'
import jsPsychSurveyText from '@jspsych/plugin-survey-text'
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice'

//import custom plug-in
import jsPsychHtmlMultiButtonResponse from '@jspsych/plugin-html-multi-button-response.js'

//import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { saveTrialDataComplete, saveTrialDataPartial } from './databaseUtils'
import { debugging, getUserInfo, prolificCC, prolificCUrl } from './globalVariables'

import type { KeyboardResponse, Task, TrialData } from './project'
import type { DataCollection } from '../node_modules/jspsych/dist/modules/data/DataCollection'

import {cluesAndBoards}  from './clues_and_boards/gpt4_clues.js'
//import SurveyMultiChoicePlugin from '@jspsych/plugin-survey-multi-choice'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="align-middle text-center"> 
Please wait. You will be redirected back to Prolific in a few moments. 
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = () => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    window.location.replace(prolificCUrl)
  }, 3000)
}
const exitExperimentDebugging = () => {
  const contentDiv = document.getElementById('jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment() {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    on_data_update: function (trialData: TrialData) {
      if (debug) {
        console.log('jsPsych-update :: trialData ::', trialData)
      }
      // if trialData contains a saveToFirestore property, and the property is true, then save the trialData to Firestore
      if (trialData.saveToFirestore) {
        saveTrialDataPartial(trialData).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
            }
          },
          (err) => {
            console.error(err) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.getElementById('jspsych-content')
      if (contentDiv) contentDiv.innerHTML = '<p> Please wait, your data are being saved.</p>'
      saveTrialDataComplete(data.values()).then(
        () => {
          if (debug) {
            exitExperimentDebugging()
            console.log('saveTrialDataComplete: Success') // Success!
            console.log('jsPsych-finish :: data ::')
            console.log(data)
            setTimeout(() => {
              jsPsych.data.displayData()
            }, 3000)
          } else {
            exitExperiment()
          }
        },
        (err) => {
          console.error(err) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */

  var completion_code = 'xxx';
  var nWords = 12;
  var nTrials = 5;//20;
  var nCheckTrials = 3;//7;
  var check_idxs = jsPsych.randomization.sampleWithoutReplacement(Array.from(Array(nTrials).keys()), nCheckTrials);

  //randomly choose clue/board pairs for this subject
  var cab = jsPsych.randomization.sampleWithoutReplacement(cluesAndBoards, nTrials);
  var clues: string[] = [];
  var boards: string[] = [];
  var intended_words: string[] = [];
  for(var i=0;i<cab.length; i++) {
      clues.push(cab[i][0]);
      boards.push(cab[i][1]);
      intended_words.push(cab[i][2]);
  }
  console.log(boards);

  var trial_num = 1;
  var check_num = 0;

  var check_words: any = [];
  var check_num_dif: any = [];

  var imgPath1 = '../src/images/example1.png'
  var imgPath2 = '../src/images/example2.png'

  var instructionStr = "In each round of the game, you will be shown a one-word clue along with a board of " + nWords + " words. <br> This clue was chosen by your partner to help you guess exactly 3 of the words on the board. <br> Your task is to select the 3 words that you think your partner had in mind based on their clue. <br>";


  //add vars to data
  jsPsych.data.addProperties({
      completion_code: completion_code,
  });

  // consent
  var consent = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "<DIV align='left'><div>&nbsp;</div><div>Please consider this information carefully before deciding whether to participate in this research.</div><div>&nbsp;</div><div>The purpose of this research is to examine which factors influence social judgment and decision-</div><div>making. You will be asked to make judgements about individuals and actions in social scenarios.</div><div>We are simply interested in your judgement. The study will take less than 1 hour to complete,</div><div>and you will receive less than $20 on Amazon Mechanical Turk. Your compensation and time</div><div>commitment are specified in the study description. There are no anticipated risks associated with</div><div>participating in this study. The effects of participating should be comparable to those you would</div><div>ordinarily experience from viewing a computer monitor and using a mouse or keyboard for a</div><div>similar amount of time. At the end of the study, we will provide an explanation of the questions</div><div>that motivate this line of research and will describe the potential implications.</div><div>&nbsp;</div><div>Your participation in this study is completely voluntary and you may refuse to participate or you</div><div>may choose to withdraw at any time without penalty or loss of benefits to you which are</div><div>otherwise entitled. Your participation in this study will remain confidential. No personally</div><div>identifiable information will be associated with your data. Also, all analyses of the data will be</div><div>averaged across all the participants, so your individual responses will never be specifically</div><div>analyzed.</div><div>&nbsp;</div><div>If you have questions or concerns about your participation or payment, or want to request a</div><div>summary of research findings, please contact Dr. Jonathan Phillips at</div><div><a href=mailto:Jonathan.S.Phillips@dartmouth.edu>Jonathan.S.Phillips@dartmouth.edu</a>.</div><div>&nbsp;</div><div>Please save a copy of this form for your records.</div><div>&nbsp;</div></DIV><div>Agreement:</div><DIV align='left'><div>The nature and purpose of this research have been sufficiently explained and I agree to</div><div>participate in this study. I understand that I am free to withdraw at any time without incurring</div><div>any penalty. Please consent by clicking the button below to continue. Otherwise, please exit the</div><div>study at any time.</div><div>&nbsp;</div></DIV>",
      choices: ['Submit']
  };
  //welcome
  var welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<div class='center-content'><br><br><br><br>Welcome to the HIT. Press any key to begin.",
  };
  //get subject ID
  var get_id = {
    type: jsPsychSurveyText,
      preamble: ["Please enter your Prolific Worker ID below.<br><br>If you do not enter your ID accurately, we will not be able to pay you."],
      questions: [{prompt: "Worker ID:", name: "subject_id", required: true}],
      on_finish: function(data: TrialData){
          jsPsych.data.addProperties({
              subject_id: data['response']['subject_id'],
          });
      }
  }
  
  //set instructions
  var instructions1 = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "You will be taking part in a partner word guessing game. <br> " + instructionStr + '<br>',
      choices: ['Continue']
  };

  //give example grid
  var example1 = {
      type: jsPsychImageButtonResponse,
      stimulus: imgPath1,
      stimulus_height: 500,
      stimulus_width: 775,
      render_on_canvas: false,
      choices: ['Continue'],
      prompt: "Consider the example clue and grid below, and click 'Continue' to see an example word selection based on the clue. <br><br>"
  };
  var example2 = {
      type: jsPsychImageButtonResponse,
      stimulus: imgPath2,
      stimulus_height: 500,
      stimulus_width: 775,
      render_on_canvas: false,
      choices: ['Continue'],
      prompt: "In the example below, the clue <b>money</b> applies to the selected words <b>bank</b>, <b>buck</b>, and <b>card</b>. <div></div> Money is kept in banks, a buck is a slang term for money, and people use cards to pay for things in place of money. <div></div> While the other words may also bear some relation to the clue <b>money</b>, <div></div> it seems likely these 3 selected words were intended by the clue. <br><br>"
  };

  //instructions
  var instructions2 = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "Now it's your turn to guess words based on clues!<div></div>You will be asked to complete " + nTrials + " rounds.<div></div>Click 'Continue' to begin.<br><br>",
      choices: ['Continue']
  };

  //pre first trial instructions
  var trial_instructions_first = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "<b>Instructions, if you would like to reread them:</b> <br> " + instructionStr + " <br> Click 'Continue' to begin. <br><br>",
      choices: ['Continue']
  };

  //pre trial instructions
  var trial_instructions = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "Thank you for completing the trial! <br><br> <div></div> <b>Instructions, if you would like to reread them:</b> <br>" + instructionStr + " <br> Click 'Continue' to begin. <br><br>",
      choices: ['Continue']
  };

  // var pres_idx = jsPsych.randomization.sampleWithoutReplacement(Array.from(Array(400).keys()), 1)[0];

  // var guess_trial2 = {
  //     type: "html-multi-button-response",
  //     stimulus: function(){
  //         return '<b>' + pres_list['clues'][pres_idx] + '</b>';
  //     },
  //     choices: function(){
  //         //get a random board
  //         return pres_list['boards'][pres_idx];
  //         return boards[trial_num-1];
  //     },
  //     button_html: ['<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>'],
  //     on_finish: function (data) {
  //         console.log(data.chosen_words);
  //         data.exp_phase = 'trial';
  //         data.intended_words = intended_words[trial_num-1];
  //         data.words = boards[trial_num-1];
  //         data.trial_order = trial_num;
  //         data.clue = clues[trial_num-1];
  //         n=0;
  //         for(k=0;k<data.intended_words.length;k++) {
  //             if (data.chosen_words.includes(data.intended_words[k])) {
  //                 n=n+1;
  //             }
  //         }
  //         data.num_correct = n;
  //         console.log(data.num_correct);
  //         trial_num = trial_num+1;
  //         console.log(data);
  //         save_data(data);
  //     }
  // };

  // var pres_idx2 = 0;
  // var after1 = {
  //     type: jsPsychHtmlKeyboardResponse,
  //   stimulus: function() {
  //         txt = "<div><b>BERT embeddings:</b> "
  //         if (pres_idx2 > 0) {
  //             txt = txt + pres_list['bert'][pres_idx][0] + ", " + pres_list['bert'][pres_idx][1] + ", " + pres_list['bert'][pres_idx][2] + "<br><br>";
  //         }
  //         if (pres_idx2 > 1) {
  //             txt = txt + "<b>GPT-3 embeddings:</b> "
  //         }
  //         if (pres_idx2 > 2) {
  //             txt = txt + pres_list['gpt'][pres_idx][0] + ", " + pres_list['gpt'][pres_idx][1] + ", " + pres_list['gpt'][pres_idx][2] + "<br><br>";
  //         }
  //         if (pres_idx2 > 3) {
  //             txt = txt + "<b>ConceptNet embeddings:</b> "
  //         }
  //         if (pres_idx2 > 4) {
  //             txt = txt + pres_list['nb'][pres_idx][0] + ", " + pres_list['nb'][pres_idx][1] + ", " + pres_list['nb'][pres_idx][2] + "<br><br>";
  //         }
  //         if (pres_idx2 > 5) {
  //             txt = txt + "<b>GPT-3 text prediction:</b> "
  //         }
  //         if (pres_idx2 > 6) {
  //             txt = txt + pres_list['gpt_res'][pres_idx][0] + ", " + pres_list['gpt_res'][pres_idx][1] + ", " + pres_list['gpt_res'][pres_idx][2] + "<br><br>";
  //         }
  //         if (pres_idx2 > 7) {
  //             txt = txt + "<b>Intended words: </b>"
  //         }
  //         if (pres_idx2 > 8) {
  //             txt = txt + " <b>" + pres_list['intended'][pres_idx][0] + ", " + pres_list['intended'][pres_idx][1] + ", " + pres_list['intended'][pres_idx][2] + "</b><br><br>";
  //         }
  //         pres_idx2 = pres_idx2 + 1;
  //         return txt + " </div>"
  //     }
  // }




  var guess_trial = {
      type: jsPsychHtmlMultiButtonResponse,
      response_ends_trial: false,
      stimulus: function(){
          return '<b>' + clues[trial_num-1] + '</b>';
      },
      choices: function(){
          return boards[trial_num-1];
      },
      button_html: ['<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>'],
      on_finish: function (data: TrialData) {
        //console.log(jsPsych.data.getLastTrialData().select('response')).values[0].
          let chosen_word_index = jsPsych.data.getLastTrialData().select('response').values[0].response
          data.exp_phase = 'trial';
          data.intended_words = intended_words[trial_num-1];
          data.words = boards[trial_num-1];
          data.trial_order = trial_num;
          data.clue = clues[trial_num-1];
          var n=0;
          for(var k=0;k<data.intended_words.length;k++) {
            console.log(data.chosen_words)
              // if (data.chosen_words.includes(data.intended_words[k])) {
              //     n=n+1;
              // }
          }
          data.num_correct = n;
          console.log(data.num_correct);
          trial_num = trial_num+1;
          console.log(data);
          save_data(data);
      }
  };

  //instructions for sanity check 
  var check_instructions = {
      type: jsPsychHtmlKeyboardResponse,
    stimulus: "<div> Thank you for completing the trial!</div><div>You will now see some of the same clues again. For each clue, please select the same words that you previously selected for that clue.</div><div>Press any key to begin.</div>"
  };

  //check clue trial
  var check_trial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: function(){
          return 'Please choose the 3 words you prevously selected for this clue. <br> <br> <b>' + clues[check_idxs[check_num]] + '</b> <br> <br>';
      },
      choices: function(){;
          return jsPsych.randomization.sampleWithoutReplacement(boards[check_idxs[check_num]], nWords);
      },
      button_html: ['<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>', '<button class="codenames-card">%choice%</button>'],
      on_finish: function(data: TrialData) {
          check_words.push(data.chosen_words);
          //calculate number of words that are different from those chosen the first time around
          var d = jsPsych.data.get().values();
          var ind = d[d.length-1]['trial_index'];
          var last_choices = d[ind - 2*nTrials - check_num + check_idxs[check_num]*2]['chosen_words'];
          var curr_choices = data.chosen_words;
          var n=0;
          for(var k=0;k<curr_choices.length;k++) {
              if (!(last_choices.includes(curr_choices[k]))) {
                  n=n+1;
              }
          }
          check_num_dif.push(n);
          //iterate check_num
          check_num = check_num+1;
      }
  };
  
  //demographics  
  var demo_instructions = {
      type: jsPsychHtmlKeyboardResponse,
    stimulus: "<div> Thank you!</div><div>Now, please provide us with some demographic information.</div><div>Press any key to begin.</div>",
  };
  var demo1 = {
      type: jsPsychSurveyText,
      preamble: '',
      questions: [{prompt: "How old are you?", required: true}, {prompt: "What is your native language?", required: true}, {prompt: "What is your nationality?", required: true}, {prompt: "In which country do you live?", required: true}],
  };
  //saves data on completion of this trial
  var demo2 = {
      type: jsPsychSurveyMultiChoice,
      preamble: "Please provide us with some demographic information.",
      questions: [
          {prompt: "What is your gender?", options: ["Male","Female","Other"], required:true}, 
          {prompt: "Are you a student?", options: ["Yes","No"], required: true},
          {prompt: "What is your education level?", options: ["Grade/elementary school","High school","Some college or university","College or university degree","Graduate degree, Masters","PhD"], required: true}
      ],
      on_finish: function(data: TrialData) {
          data.exp_phase = 'subject_info';
          var lastData = jsPsych.data.get().last(2).values();
          var demo1 = lastData[0]['response'];
          var demo2 = lastData[1]['response'];
          data.age = demo1['Q0'];
          data.language = demo1['Q1'];
          data.nationality = demo1['Q2'];
          data.country = demo1['Q3'];
          data.gender = demo2['Q0'];
          data.student = demo2['Q1'];
          data.education = demo2['Q2'];
          data.check_words = check_words;
          data.check_num_dif = check_num_dif;
          data.check_idxs = check_idxs;
          console.log(data);
          save_data(data);
      },
};

  //provide completion code
  var end = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "<h4>Thank you for your participation!</h4><h4>In order to complete this HIT, you must enter the code below into Prolific.</h4><h4>Your secret completion code is:<br><br>" + completion_code + "<br><br>Copy this code now.</h4><h4>Once you've copied it, click the button below to leave this window.</h4>",
      choices: ['Finish'],
  };

  //debrief
  var debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<DIV align='left'><div>&nbsp;</div><div><strong>Study Debriefing</strong></div><div>Judgement and decision making are important aspects of public and private life. Using surveys</div><div>like the one you just completed, we are examining the factors that go into making social</div><div>decisions.</div><div>&nbsp;</div><div><strong>How is this being tested?</strong></div><div>We have asked you to respond to stories or videos that differ on several important factors. By</div><div>isolating different variables that are involved in social thought, we can better understand how we</div><div>arrive at complex decision-making. For example, some actions are seen as more worthy of blame</div><div>if they are performed intentionally. Harming someone on purpose is generally worse than</div><div>harming someone by accident, or even harming someone in a way that is foreseen but not</div><div>intended.</div><div>&nbsp;</div><div><strong>Main questions and hypotheses:</strong></div><div>A fundamental goal of our research is to understand the cognitive and emotional factors that</div><div>influence social judgment and decision-making. We are studying these factors by presenting</div><div>people with hypothetical questions that vary in specific ways and seeing which factors make a</div><div>difference. Some people filled out the same survey that you just filled out. Others got slightly</div><div>different surveys.</div><div>&nbsp;</div><div><strong>Why is this important to study?</strong></div><div>By comparing answers on these important factors, we learn about what factors affect social</div><div>judgment. This has crucial implications for many public domains, including the legal system.</div><div>&nbsp;</div><div><strong>How to learn more:</strong></div><div>If you are interested in learning more, you may want to consult the following articles:</div><div>Phillips, J., &amp; Cushman, F. (2017). Morality constrains the default representation of what is</div><div style='padding-left: 30px;'>possible. Proceedings of the National Academy of Sciences of the United States of</div><div style='padding-left: 30px;'>America, 114(18), 4649&ndash;4654. https://doi.org/10.1073/pnas.1619717114</div><div>Phillips, J., Morris, A., &amp; Cushman, F. (2019). How we know what not to think.</div><div style='padding-left: 30px;'>Trends in Cognitive Sciences, 23(12), 1026&ndash;1040. https://doi.org/10.1016/j.tics.2019.09.007</div><div>Phillips, J., Buckwalter, W., Cushman, F., Friedman, O., Martin, A., Turri, J., Santos, L., &amp;</div><div style='padding-left: 30px;'>Knobe, J. (2020). Knowledge before Belief. Behavioral and Brain Sciences, 1-37.</div><div style='padding-left: 30px;'>doi:10.1017/S0140525X20000618</div><div>&nbsp;</div><div><strong>How to contact the researcher:</strong></div><div>If you have questions or concerns about your participation or</div><div>payment, or want to request a summary of research findings, please contact the Primary</div><div>Investigator: Dr. Jonathan Phillips, at Jonathan.S.Phillips@dartmouth.edu.</div><div>Whom to contact about your rights in this research:</div><div>If you have questions, concerns,</div><div>complaints, or suggestions about the present research, you may call the Office of the Committee</div><div>for the Protection of Human Subjects at Dartmouth College (603) 646-6482 during normal</div><div>business hours.</div><div>&nbsp;</div><div><strong>Thank you for your participation!</strong></div><div>&nbsp;</div></DIV>",
  };

  //save data to database
  function save_data(data: TrialData) {
      //var url = "wordGame"; //use this when running on server
      var url = "/"; //use this when running locally
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
          data
      }));
  }

  //set timeline
  var timeline = [];
  
  timeline.push(consent);
  timeline.push(welcome);
  timeline.push(get_id);
  timeline.push(instructions1);
  timeline.push(example1);
  timeline.push(example2);
  timeline.push(instructions2);
  
  timeline.push(trial_instructions_first);
  timeline.push(guess_trial);
  for (var i = 0; i < nTrials-1; i++) {
      timeline.push(trial_instructions);
      timeline.push(guess_trial);
  };
  timeline.push(check_instructions)
  for (var i = 0; i < nCheckTrials; i++) {
      timeline.push(check_trial);
  };
  
  timeline.push(demo_instructions);
  timeline.push(demo1);
  timeline.push(demo2);
  timeline.push(end);
  timeline.push(debrief);
  
  // jsPsych.init({
  //     timeline:timeline,
  // });

  /* start the experiment */
  await jsPsych.run(timeline)
}
