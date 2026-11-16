import {createHash,randomUUID} from 'node:crypto'
import {mkdir,readFile,rename,writeFile} from 'node:fs/promises'
import path from 'node:path'
import {brand,products,slots} from '../../../components/catalog'

export const runtime='nodejs'
export const maxDuration=120
const inFlight=new Map()
const model=process.env.IMAGE_MODEL || 'gpt-image-1'
const cacheDir=path.resolve(process.env.OUTFIT_CACHE_DIR || '.outfits')
const instructions='Dress this exact matte gray mannequin in every supplied garment. Keep a front-facing full-body view, centered on a light gray studio background. Preserve garment colors, logos and materials. Put outerwear over the top and show the top underneath where visible. Leave unselected body areas as bare matte mannequin. No props or caption.'

async function asset(src){
  if(!src.startsWith('/products/')||src.includes('..'))throw new Error('Use local /products/ assets')
  return readFile(path.join(process.cwd(),'public',src))
}
async function generate(filename,images,picks){
  await mkdir(cacheDir,{recursive:true})
  const existing=await readFile(filename).catch(error=>{if(error.code!=='ENOENT')throw error})
  if(existing)return existing
  if(inFlight.size>=4)throw new Error('Renderer is busy')
  const form=new FormData()
  form.set('model',model)
  form.set('prompt',instructions+' Input garments in order: '+picks.map(p=>p.slot+' '+p.name).join(', ')+'.')
  form.set('size','1024x1536')
  form.set('quality','medium')
  form.set('output_format','webp')
  images.forEach((bytes,index)=>{
    const extension=path.extname(index===0?brand.mannequin:picks[index-1].photo).toLowerCase()
    const mime=extension==='.jpg'||extension==='.jpeg'?'image/jpeg':extension==='.webp'?'image/webp':'image/png'
    form.append('image[]',new Blob([bytes],{type:mime}),'reference-'+index+extension)
  })
  const response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',body:form,headers:{Authorization:'Bearer '+process.env.IMAGE_API_KEY},signal:AbortSignal.timeout(100000)})
  if(!response.ok)throw new Error('Image provider returned '+response.status)
  const payload=await response.json()
  if(!payload.data?.[0]?.b64_json)throw new Error('Missing image')
  const bytes=Buffer.from(payload.data[0].b64_json,'base64')
  const temporary=filename+'.'+randomUUID()+'.tmp'
  await writeFile(temporary,bytes)
  await rename(temporary,filename)
  return bytes
}

export async function GET(request){
  const ids=new URL(request.url).searchParams.get('items')?.split(',') || []
  const picks=slots.flatMap(slot=>products.filter(p=>p.slot===slot&&ids.includes(p.id)))
  if(!ids.length||ids.length!==picks.length||new Set(picks.map(p=>p.slot)).size!==picks.length)
    return Response.json({error:'Invalid outfit'},{status:400})
  if(!process.env.IMAGE_API_KEY)return new Response(null,{status:204})
  try{
    const images=await Promise.all([asset(brand.mannequin),...picks.map(p=>asset(p.photo))])
    const hash=createHash('sha256').update(JSON.stringify([model,instructions,picks.map(p=>[p.id,p.slot,p.name])]))
    images.forEach(bytes=>hash.update(createHash('sha256').update(bytes).digest()))
    const key=hash.digest('hex')
    let pending=inFlight.get(key)
    if(!pending){
      pending=generate(path.join(cacheDir,key+'.webp'),images,picks).finally(()=>inFlight.delete(key))
      inFlight.set(key,pending)
    }
    return new Response(await pending,{headers:{'Content-Type':'image/webp','Cache-Control':'no-cache'}})
  }catch(error){
    console.error('Outfit rendering failed:',error.message)
    return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}})
  }
}
