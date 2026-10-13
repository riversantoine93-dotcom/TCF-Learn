import fs from 'node:fs';
const courses=JSON.parse(fs.readFileSync('lib/learning/catalog.json','utf8')).map((c,i)=>({...c,sort_order:i,published:true}));
const lessons=JSON.parse(fs.readFileSync('scripts/learning-lessons.json','utf8'));
const literal=v=>"'"+JSON.stringify(v).replaceAll("'","''")+"'::jsonb";
const courseSQL=`update public.learning_courses set published=false where slug not in (select value from jsonb_array_elements_text(${literal(courses.map(c=>c.slug))})); insert into public.learning_courses select * from jsonb_populate_recordset(null::public.learning_courses,${literal(courses)}) on conflict(slug) do update set title=excluded.title,description=excluded.description,category=excluded.category,duration_minutes=excluded.duration_minutes,lesson_count=excluded.lesson_count,outline=excluded.outline,legacy_url=excluded.legacy_url,published=excluded.published,sort_order=excluded.sort_order;`;
fs.mkdirSync('.task-seed',{recursive:true});fs.writeFileSync('.task-seed/catalog.sql',courseSQL);
for(let i=0;i<lessons.length;i+=60)fs.writeFileSync(`.task-seed/lessons-${i/60}.sql`,`insert into public.learning_lessons select * from jsonb_populate_recordset(null::public.learning_lessons,${literal(lessons.slice(i,i+60))}) on conflict(course_slug,number) do update set title=excluded.title,content=excluded.content;`);
console.log('Catalog and eight lesson seed batches ready.');
