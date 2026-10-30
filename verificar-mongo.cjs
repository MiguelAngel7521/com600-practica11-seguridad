const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { MongoClient, ObjectId } = require(process.cwd()+'/node_modules/mongodb');
const { crearRepositorio } = require(process.cwd()+'/src/repositorio');
(async()=>{
 let id,repo;
 try {
  console.log('Comprobación complementaria con Docker CLI e imagen local mongo:7.');
  console.log('Verificación manual adicional; npm test utiliza Testcontainers.');
  id=execFileSync('docker',['run','--rm','-d','--label','practica7=true','-p','127.0.0.1::27017','mongo:7'],{encoding:'utf8'}).trim();
  const puerto=execFileSync('docker',['port',id,'27017/tcp'],{encoding:'utf8'}).trim().split(':').pop();
  const uri=`mongodb://127.0.0.1:${puerto}/?directConnection=true`;
  for(let i=0;i<30;i++){
   const cliente=new MongoClient(uri,{serverSelectionTimeoutMS:500});
   try {await cliente.connect();await cliente.db('admin').command({ping:1});break;}
   catch(e){if(i===29)throw e;await new Promise(r=>setTimeout(r,300));}
   finally {await cliente.close();}
  }
  repo=await crearRepositorio(uri);
  console.log('MONGO_EVIDENCIA_LISTO',id);
  await new Promise(r=>setTimeout(r,3500));
  const casos=[
   ['guardar y recuperar',async()=>{const t={titulo:'Leer',completada:false};const r=await repo.guardar(t);assert.equal(r.acknowledged,true);assert.deepEqual(await repo.buscarPorTitulo('Leer'),{...t,_id:r.insertedId});assert.equal('_id' in t,false)}],
   ['buscar por título exacto',async()=>{await repo.guardar({titulo:'A'});await repo.guardar({titulo:'B'});assert.equal((await repo.buscarPorTitulo('B')).titulo,'B')}],
   ['actualizar estado',async()=>{const r=await repo.guardar({titulo:'A',completada:false});assert.equal((await repo.actualizarEstado(r.insertedId,true)).modifiedCount,1);assert.equal((await repo.buscarPorTitulo('A')).completada,true)}],
   ['eliminar sin afectar otro documento',async()=>{const r=await repo.guardar({titulo:'A'});await repo.guardar({titulo:'B'});assert.equal((await repo.eliminar(r.insertedId)).deletedCount,1);assert.equal(await repo.buscarPorTitulo('A'),null);assert.equal(await repo.contar(),1)}],
   ['buscar inexistente devuelve null',async()=>assert.equal(await repo.buscarPorTitulo('No existe'),null)],
   ['actualizar inexistente no inserta',async()=>{assert.equal((await repo.actualizarEstado(new ObjectId(),true)).matchedCount,0);assert.equal(await repo.contar(),0)}],
   ['eliminar inexistente devuelve cero',async()=>assert.equal((await repo.eliminar(new ObjectId())).deletedCount,0)],
   ['limpieza aísla los casos',async()=>assert.equal(await repo.contar(),0)]
  ];
  for(const ronda of [1,2]){
   console.log('Ronda',ronda, ronda===1?'orden original':'orden inverso');
   for(const [nombre,verificar] of ronda===1?casos:[...casos].reverse()){
    await repo.limpiar();await verificar();console.log('\x1b[32mPASS\x1b[0m',nombre);
   }
  }
  console.log('16 comprobaciones correctas contra MongoDB real.');
 } finally {
  if(repo)await repo.cerrar();
  if(id){execFileSync('docker',['stop',id],{stdio:'pipe'});console.log('Contenedor eliminado:',id);}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
