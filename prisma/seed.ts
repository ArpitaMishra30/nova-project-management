import {PrismaClient} from '@prisma/client';import bcrypt from 'bcryptjs';const db=new PrismaClient();
async function main(){const hash=await bcrypt.hash('demo1234',12);const demo=await db.user.upsert({where:{email:'demo@nova.app'},update:{},create:{name:'Alex Morgan',email:'demo@nova.app',passwordHash:hash,role:'ADMIN'}});const teammate=await db.user.upsert({where:{email:'sam@nova.app'},update:{},create:{name:'Sam Lee',email:'sam@nova.app',passwordHash:hash}});const thirdUser=await db.user.upsert({
  where:{email:'rahul@nova.app'},
  update:{},
  create:{
    name:'Rahul Sharma',
    email:'rahul@nova.app',
    passwordHash:hash
  }
});const fourthUser = await db.user.upsert({
  where: {
    email: 'arjun@nova.app',
  },
  update: {},
  create: {
    name: 'Arjun',
    email: 'arjun@nova.app',
    passwordHash: hash,
  },
});const p=await db.project.upsert({where:{id:'demo-project'},update:{},create:{id:'demo-project',name:'NOVA Website',description:'Launch the new productivity platform.',color:'indigo'}});await db.projectMember.upsert({where:{projectId_userId:{projectId:p.id,userId:demo.id}},update:{role:'ADMIN'},create:{projectId:p.id,userId:demo.id,role:'ADMIN'}});await db.projectMember.upsert({where:{projectId_userId:{projectId:p.id,userId:teammate.id}},update:{},create:{projectId:p.id,userId:teammate.id}});if((await db.task.count({where:{projectId:p.id}}))===0){await db.task.createMany({data:[{title:'Set up landing page',status:'DONE',priority:'HIGH',projectId:p.id,creatorId:demo.id,assigneeId:teammate.id},{title:'Build task dashboard',status:'IN_PROGRESS',priority:'HIGH',projectId:p.id,creatorId:demo.id,assigneeId:demo.id},{title:'Add team invitations',status:'TODO',priority:'MEDIUM',projectId:p.id,creatorId:demo.id},{title:'Write onboarding copy',status:'TODO',priority:'LOW',projectId:p.id,creatorId:demo.id,assigneeId:teammate.id}]})}}
main().finally(()=>db.$disconnect());
