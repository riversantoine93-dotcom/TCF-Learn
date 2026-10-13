import LearningPlayer from '@/components/LearningPlayer';
export default async function LessonPage({params}:{params:Promise<{slug:string;lesson:string}>}){const {slug,lesson}=await params;return <LearningPlayer slug={slug} number={Number(lesson)}/>}
