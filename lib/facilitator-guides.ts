import { moduleContent, type CourseModuleContent, type LessonContent } from "./course-content";
import { moduleOneContent } from "./module-one-content";
import { thoughtToFreedomCourse } from "./courses/thought-to-freedom";
import type { ContentBlock, CourseLesson, CourseModule } from "./courses/types";

export type FacilitatorScript = {
  opening: string;
  teaching: string;
  discussion: string;
  activity: string;
  closing: string;
};

export type FacilitatorGuide = {
  id: string;
  courseSlug: "turning-forward" | "thought-to-freedom";
  courseTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  lessonNumber: number;
  lessonTitle: string;
  overview: string;
  facilitationGoal: string;
  discussionPoints: string[];
  facilitatorNotes: string[];
  script: FacilitatorScript;
};

function sentence(value: string) {
  const trimmed=value.trim();
  return /[.!?]$/.test(trimmed)?trimmed:trimmed+".";
}

function quote(value: string) {
  return "“"+value.replace(/[“”]/g,"").trim()+"”";
}

function tfDiscussionPoints(lesson:LessonContent){
  const fields=lesson.fields.slice(0,3).map(field=>field.label.replace(/[.…]+$/g,""));
  return [
    `What stands out to you in this idea: ${quote(lesson.quote)}?`,
    `Where have you seen ${lesson.sectionTitle.toLowerCase()} show up in your own decisions or routines?`,
    ...fields.map(label=>`How would you answer this honestly today: ${label}?`),
  ].slice(0,5);
}

function turningForwardGuide(module:CourseModuleContent,lesson:LessonContent):FacilitatorGuide{
  const isFinalLesson=lesson.number===3;
  const challenge=isFinalLesson?module.challenge:null;
  const discussionPoints=tfDiscussionPoints(lesson);

  return {
    id:`turning-forward-m${module.number}-l${lesson.number}`,
    courseSlug:"turning-forward",
    courseTitle:"Turning Forward",
    moduleNumber:module.number,
    moduleTitle:module.title,
    lessonNumber:lesson.number,
    lessonTitle:lesson.title,
    overview:`${sentence(lesson.intro)} ${sentence(lesson.sectionBody)}`,
    facilitationGoal:`Help participants understand ${lesson.sectionTitle.toLowerCase()} and translate the lesson into one specific behavior they can practice.`,
    discussionPoints,
    facilitatorNotes:[
      "Invite participation; do not force personal disclosure.",
      "Keep the conversation focused on present choices, responsibility, and forward action rather than shame.",
      "Ask one question at a time and allow silence before calling on anyone.",
      challenge?`Use the module challenge—${challenge.title}—as the bridge from discussion to action.`:`Use the ${lesson.activityTitle} activity to move the group from insight to application.`,
    ],
    script:{
      opening:`“Today we are working on ${lesson.title}. The purpose is not to pretend the past did not happen or to leave here with a motivational speech. The purpose is to understand one idea clearly enough that we can use it. Here is the starting point: ${lesson.intro}”`,
      teaching:`“The main idea I want us to sit with is this: ${lesson.quote} ${lesson.sectionBody} As we talk, listen for the difference between what sounds good and what can actually be practiced.”`,
      discussion:`“I’m going to give us a few questions. You can answer from your own experience, from something you have observed, or you can pass. First: ${discussionPoints[0]}”\n\n“Now let’s go one step deeper: ${discussionPoints[1]}”\n\n“Last discussion question before we practice: ${discussionPoints[2]||"What is one decision this lesson is asking you to make differently?"}”`,
      activity:`“Now we move from talking to doing. Open the ${lesson.activityTitle} activity. Do not write what sounds impressive. Write what is true and useful. Take this one prompt at a time. If you get stuck, make the answer smaller and more specific.”`,
      closing:challenge
        ?`“Before we close, this module asks you to complete the challenge called ${challenge.title}. ${challenge.description} The commitment is: ${challenge.pledge} I want each person to leave with one action that can be seen, measured, or completed—not just an intention.”`
        :`“Before we close, name one sentence, decision, or action from today that you can carry into the next twenty-four hours. The goal is not to agree with everything we discussed. The goal is to leave with one responsible next move.”`,
    },
  };
}

function getBlock<T extends ContentBlock["type"]>(lesson:CourseLesson,type:T){
  return lesson.blocks.find(block=>block.type===type) as Extract<ContentBlock,{type:T}>|undefined;
}

function ttfDiscussionPoints(module:CourseModule,lesson:CourseLesson){
  const reflection=getBlock(lesson,"reflection");
  const decision=getBlock(lesson,"decision-point");
  const catchBlock=getBlock(lesson,"catch-the-thought");
  const activity=getBlock(lesson,"workbook-activity");

  const points=[
    module.coreQuestion,
    reflection?.prompt,
    decision?.prompt||catchBlock?.prompt,
    activity?`What would make ${activity.title} useful in a real decision this week?`:undefined,
    "What would a responsible replacement thought sound like in the same situation?",
  ].filter(Boolean) as string[];

  return points.slice(0,5);
}

function thoughtToFreedomGuide(module:CourseModule,lesson:CourseLesson):FacilitatorGuide{
  const keyIdea=getBlock(lesson,"key-idea")?.text||module.keyIdea;
  const paragraph=getBlock(lesson,"paragraph")?.text||module.description;
  const reflection=getBlock(lesson,"reflection");
  const decision=getBlock(lesson,"decision-point");
  const catchBlock=getBlock(lesson,"catch-the-thought");
  const activity=getBlock(lesson,"workbook-activity");
  const discussionPoints=ttfDiscussionPoints(module,lesson);

  let practiceScript="“Before we leave this lesson, write down one thought pattern you want to notice earlier and one different response you can practice.”";
  if(decision){
    practiceScript=`“Listen to this situation without rushing to judge the person in it: ${decision.scenario} Now ask yourself: ${decision.prompt} We are looking for the thought, the choice point, and the consequence—not just the behavior at the end.”`;
  }else if(catchBlock){
    practiceScript=`“Now we are going to catch the thought in real time. ${catchBlock.prompt} Listen for which statement keeps the old pattern going and which statement creates room for a different choice.”`;
  }else if(activity){
    practiceScript=`“Now we move from insight to practice. The activity is ${activity.title}. ${activity.instructions} Do not write the answer you think the room wants. Write the response you could actually use when this pattern shows up.”`;
  }

  return {
    id:`thought-to-freedom-m${module.number}-l${lesson.number}`,
    courseSlug:"thought-to-freedom",
    courseTitle:"Thought to Freedom",
    moduleNumber:module.number,
    moduleTitle:module.title,
    lessonNumber:lesson.number,
    lessonTitle:lesson.title,
    overview:`${sentence(lesson.objective)} ${sentence(module.description)}`,
    facilitationGoal:`Help participants recognize ${module.title.toLowerCase()}, identify the decision point before action, and practice a more responsible replacement thought.`,
    discussionPoints,
    facilitatorNotes:[
      "Do not use the thinking-error label as a permanent label for a person.",
      "Acknowledge unfair circumstances without allowing them to erase personal choice or responsibility.",
      "Participants may pass on personal disclosure; examples and hypotheticals are acceptable.",
      "Redirect debates about who is 'bad' or 'good' back to the thought → choice → action → consequence chain.",
    ],
    script:{
      opening:`“Today we are working on ${module.title}, specifically ${lesson.title}. This is not about labeling anybody. It is about catching a thinking pattern early enough to make a different choice. The core question for this module is: ${module.coreQuestion}”`,
      teaching:`“Here is the key idea: ${keyIdea} ${paragraph} The point is not to argue with every feeling. The point is to slow the thought down before it becomes a choice, an action, and a consequence.”`,
      discussion:`“Let’s discuss this without performing for the room. You can speak from your own life, from something you have observed, or you can pass. First question: ${discussionPoints[0]}”\n\n“Second question: ${discussionPoints[1]||"Where does this pattern usually show up first—in the thought, the feeling, or the reaction?"}”\n\n“Now bring it back to choice: ${discussionPoints[2]||"What is the earliest point where a different decision could be made?"}”`,
      activity:practiceScript,
      closing:`“The goal is not to promise that this thought will never show up again. The goal is to recognize it earlier, examine it honestly, interrupt the automatic response, replace it with a responsible thought, and practice the new response. Before we leave, name one place where you can use that process this week.”`,
    },
  };
}

function orientationGuide():FacilitatorGuide{
  const lesson=thoughtToFreedomCourse.orientation!;
  const keyIdea=getBlock(lesson,"key-idea")?.text||"Before the action comes the thought.";
  const paragraph=getBlock(lesson,"paragraph")?.text||thoughtToFreedomCourse.description;
  const reflection=getBlock(lesson,"reflection");

  return {
    id:"thought-to-freedom-orientation",
    courseSlug:"thought-to-freedom",
    courseTitle:"Thought to Freedom",
    moduleNumber:0,
    moduleTitle:"Orientation",
    lessonNumber:0,
    lessonTitle:lesson.title,
    overview:`${sentence(lesson.objective)} ${sentence(paragraph)}`,
    facilitationGoal:"Introduce the Thought → Choice → Action → Consequence chain and establish a non-shaming, accountability-centered group culture.",
    discussionPoints:[
      "Where do people usually notice a problem—at the thought, the choice, the action, or the consequence?",
      "What becomes possible when a thought is caught before it becomes action?",
      reflection?.prompt||"What recurring thought has led you toward a result you did not want?",
      "What would make this group feel honest, accountable, and safe enough for real reflection?",
    ],
    facilitatorNotes:[
      "Set expectations before asking for personal examples.",
      "Make it explicit that participants may pass.",
      "Do not diagnose, shame, or label participants.",
      "Keep examples focused on choices and consequences rather than graphic details of past harm.",
    ],
    script:{
      opening:`“Before we talk about specific thinking errors, we need one shared idea: before the action comes the thought. This course is not about attaching a label to a person. It is about finding the thought early enough to create another choice.”`,
      teaching:`“The chain we will use is Thought → Choice → Action → Consequence. ${keyIdea} Throughout this course we are going to practice five moves: recognize the thought, examine it, interrupt the automatic response, replace it with a responsible thought, and practice the new response.”`,
      discussion:"“Think about a decision that created a consequence you did not want. You do not have to tell us the details. Just ask yourself: how early in the chain could a different choice have been made?”\n\n“Now let’s discuss: what makes it hard to slow down a thought before reacting?”",
      activity:"“Take a moment and write one recurring thought, one choice that often follows it, and one consequence that tends to come after that choice. We are not fixing it yet. We are learning to see the chain.”",
      closing:"“For the rest of this course, we are going to practice catching the thought earlier. Accountability is not the same as shame. Accountability says: I can tell the truth about my thinking and still choose what I do next.”",
    },
  };
}

export function getFacilitatorGuides(courseSlug:"turning-forward"|"thought-to-freedom"){
  if(courseSlug==="turning-forward"){
    const modules=[moduleOneContent,...moduleContent];
    return modules.flatMap(module=>module.lessons.map(lesson=>turningForwardGuide(module,lesson)));
  }

  return [
    orientationGuide(),
    ...thoughtToFreedomCourse.modules.flatMap(module=>module.lessons.map(lesson=>thoughtToFreedomGuide(module,lesson))),
  ];
}
