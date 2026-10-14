import {redirect} from "next/navigation";
export default async function Module({params}:{params:Promise<{module:string}>}){
 const {module}=await params;
 const n=Number(module.replace('module-',''));
 if(!Number.isInteger(n)||n<1||n>8)redirect('/learn/turning-forward');
 redirect(`/learn/turning-forward/${(n-1)*3+1}`);
}
