import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {initJsPsych} from 'jspsych';
import 'jspsych/css/jspsych.css'
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychSameDifferentImage from '@jspsych/plugin-same-different-image';
import jsPsychPreload from '@jspsych/plugin-preload'
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';


var jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
  }
});

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function App() {
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  const tabulate = (answers: any[]) => {
    let t = `<Table striped bordered hover border="1"><thead border="1"><tr><td>Spiral</td><td>Percent&nbsp;&nbsp;</td><td># of questions&nbsp;&nbsp;</td><td># of questions correct&nbsp;&nbsp;</td><td>Average Time&nbsp;&nbsp;</td><td>% of questions correct</td></tr></thead><tbody>`;
    const fib = answers.filter( (trial: any) => trial.stimulus.some((i: string) => i.startsWith("/images/f_")));
    const arch = answers.filter( (trial: any) => trial.stimulus.some((i: string) => i.startsWith("/images/a_")));
    const correct = answers.filter( (trial: any) => trial.correct).length;

    const fibResults = [];
    const archResults = [];
    console.log(`fib`, fib)
    for(let j=5;j<90;j+=10) {
      const fibPct = answers.filter((trial: any) => trial.stimulus.some((i: string) => i.startsWith(`/images/f_${j}_`)));
      const fibPctCorrect = fibPct.filter(f => f.correct).length;   
      const avgFibTime = (fibPct.length > 0 ? Math.round(fibPct.reduce((acc, t) => t.rt + acc, 0) / fibPct.length) : 'N/A');
      fibResults.push({count: fibPct.length, correct: fibPctCorrect, avgTime: avgFibTime, pct: fibPct.length > 0 ? `${Math.round(fibPctCorrect*100/fibPct.length)} %` : 'N/A'})
      const archPct = arch.filter((trial: any) => trial.stimulus.some((i: string) => i.startsWith(`/images/a_${j}_`)));
      const archPctCorrect = archPct.filter(f => f.correct).length;   
      const avgArchTime =  ( archPct.length > 0 ? Math.round(archPct.reduce((acc, t) => t.rt + acc, 0) / archPct.length) : "N/A");
      archResults.push({count: archPct.length, correct: archPctCorrect, avgTime: avgArchTime, pct: archPct.length > 0 ? `${Math.round(archPctCorrect*100/archPct.length)} %` : 'N/A'})
      console.log('fibPct', fibPct, 'fibPctCorrect', fibPctCorrect, 'avgFibTime', avgFibTime, `/images/f_${j}_`)
    }
    console.log('archResults', archResults, 'fibResuts', fibResults)
    for(let i=0;i<9;i++) {
    if (archResults[i].count > 0) {
      t = t + `<tr><td>Archimedes</td><td>${10*i + 5}</td><td>${archResults[i].count}</td><td>${archResults[i].correct}</td><td>${archResults[i].avgTime}</td><td>${archResults[i].pct}</td></tr>`
    }
    }
    for(let i=0;i<9;i++) {
      if (fibResults[i].count > 0) {
      t = t + `<tr><td>Fibonacci</td><td>${10*i + 5}</td><td>${fibResults[i].count}</td><td>${fibResults[i].correct}</td><td>${fibResults[i].avgTime}</td><td>${fibResults[i].pct}</td></tr>`
      }
    }
    t = t+ `</tbody></Table><p>You got <b>${correct} / ${numberOfQuestions}</b> correct</p><p><a href="javascript:window.location.href=window.location.href">Refresh</a> the page to try again!</p>`
    return t;
  }



  const runTest = () => {
    var instructions = {
      type: htmlKeyboardResponse,
      stimulus: `
        <p>In this experiment, two glass patterns will appear in the center 
        of the screen, one after the other. One of them will have some type of pattern, and the other will be completely random.</p><p>If the <strong>first</strong> image has a pattern, type <strong>1</strong>.</p>
        <p>If the <strong>second</strong> image has a pattern, type <strong>2</strong>.</p>
        <p>Press any key to begin.</p>
      `,
      post_trial_gap: 500
    };
    
    const welcome = {
      type: htmlKeyboardResponse,
      stimulus: 'Welcome to the experiment. Press any key to begin.',
    }
  
  
    const spiralTypes = ['a', 'f'];
    const percentages = ['5', '15', '25', '35', '45', '55', '65', '75', '85']
    const question = (index: number) => {
      const correctAnswer = randomInt(1,2);
      return {
      type: jsPsychSameDifferentImage,
      prompt: `<br>Which image has a pattern? Type <strong>1</strong> or <strong>2</strong>.`,
      stimuli: [
        `/images/${correctAnswer === 1 ? `${spiralTypes[randomInt(0,1)]}_${percentages[randomInt(0, 8)]}_${randomInt(0, 98)}` : `r_0_${randomInt(0, 199)}`}.png`, 
        `/images/${correctAnswer === 1 ? `r_0_${randomInt(0, 199)}` : `${spiralTypes[randomInt(0,1)]}_${percentages[randomInt(0, 8)]}_${randomInt(0, 98)}`}.png`, 
      ],
      same_key: '1',
      different_key: '2',
      first_stim_duration: 150,
      second_stim_duration: 150,
      gap_duration: 500,
      answer: correctAnswer === 1 ? "same" : "different" 
    }};
  
    var fixation = {
      type: htmlKeyboardResponse,
      stimulus: '<div style="font-size:60px;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 1000,
    };
  
    const testTimeline = [];
    for(let i=0;i< numberOfQuestions;i++) {
      testTimeline.push(fixation);
      testTimeline.push(question(i+1))
    }
  
    var test = {
      timeline: testTimeline,
      repetitions: 1
    };
  
    const preload = {
      type: jsPsychPreload,
      images: test.timeline.filter(t => t.type === jsPsychSameDifferentImage).map((q: any) => q.stimuli).flat()
    };
    console.log("preload", preload);
    const timeline = [];
    timeline.push(preload);
    timeline.push(instructions)
    timeline.push(welcome)
    timeline.push(test);

    var debrief = {
      type: htmlKeyboardResponse,
      stimulus: function() {
        const answers = jsPsych.data.get().filter({trial_type: 'same-different-image'}).values();
        console.log("anwers", answers);
        return `${tabulate(answers)}`;
      },
      css_classes: ['debrief-text']
    };
    timeline.push(debrief);
  
    jsPsych.run(timeline);
  }
  return (
    <Container className='py-5'>
        <Row>
          <Col>
          <Form>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>How many questions?</Form.Label>
        <Form.Control type="input" placeholder="10" defaultValue={10} onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))} />
        <Form.Text className="text-muted">
          You will be presented with a series of Archimedes and Fibbonacci spiral glass patterns paired with a random glass pattern. In each flashing pair, identify the image that has the pattern.
        </Form.Text>
      </Form.Group>

      <Button variant="primary" type="button" onClick={() => runTest()}>
        Start
      </Button>
    </Form>
          </Col>
      </Row>
    </Container>
  );
}

export default App;