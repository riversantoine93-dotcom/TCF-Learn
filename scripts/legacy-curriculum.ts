import {moduleContent} from '../lib/course-content';
import {moduleOneContent} from '../lib/module-one-content';
import {thoughtToFreedomCourse} from '../lib/courses/thought-to-freedom';
const tf=[moduleOneContent,...moduleContent].flatMap(m=>m.lessons.map(l=>({course_slug:'turning-forward',number:(m.number-1)*3+l.number,title:l.title,content:{...l,moduleNumber:m.number,legacy:true}})));
const ttf=thoughtToFreedomCourse.modules.flatMap(m=>m.lessons.map(l=>({course_slug:'thought-to-freedom',number:(m.number-1)*3+l.number,title:`${m.title}: ${l.title}`,content:{...l,moduleNumber:m.number,legacy:true}})));
export const legacyLessons=[...tf,...ttf];
export const legacyCourses=[{slug:'turning-forward',title:'Turning Forward',description:'The Work Beyond Fear. Build identity, discipline, accountability, relationships, purpose, and deliberate forward momentum.',category:'reentry',duration_minutes:480,lesson_count:tf.length,outline:tf.map(l=>({number:l.number,title:l.title})),legacy_url:'/course/turning-forward'},{slug:'thought-to-freedom',title:'Thought to Freedom',description:'Correcting Criminal Thinking Errors. Recognize thought patterns, examine consequences, and practice responsible replacement thinking.',category:'reentry',duration_minutes:450,lesson_count:ttf.length,outline:ttf.map(l=>({number:l.number,title:l.title})),legacy_url:'/course/thought-to-freedom'}];
