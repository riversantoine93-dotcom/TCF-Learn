import LearningPlayer from '@/components/LearningPlayer';
export default async function CoursePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <LearningPlayer slug={slug}/>}
