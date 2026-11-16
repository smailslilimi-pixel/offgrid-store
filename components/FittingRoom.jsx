'use client'
import {useEffect,useState} from 'react'
import {Maximize2,RotateCcw,X} from 'lucide-react'
import {brand,slots} from './catalog'
export default function FittingRoom({picks,onRemove,onClear,onClose,onCart}){
  const staticFitting=process.env.NEXT_PUBLIC_STATIC_FITTING==='true'
  const key=picks.map(product=>product.id).join(',')
  const [result,setResult]=useState(null)
  const [zoom,setZoom]=useState(false)
  useEffect(()=>{
    if(!key || staticFitting) return
    const controller=new AbortController()
    fetch('/api/outfit?items='+encodeURIComponent(key),{signal:controller.signal}).then(async response=>{
      if(response.ok && response.headers.get('content-type')?.startsWith('image/')){
        const blob=await response.blob()
        if(!controller.signal.aborted) setResult({key,url:URL.createObjectURL(blob)})
      } else if(!controller.signal.aborted) setResult({key,url:null})
    }).catch(()=>{if(!controller.signal.aborted)setResult({key,url:null})})
    return ()=>controller.abort()
  },[key,staticFitting])
  useEffect(()=>()=>{if(result?.url)URL.revokeObjectURL(result.url)},[result])
  const pending=Boolean(!staticFitting && key && result?.key!==key)
  function portrait(){
    return <div className="portrait" aria-busy={pending} aria-label={picks.length?'Mannequin wearing '+picks.map(p=>p.name).join(', '):'Undressed mannequin'}>
      {result?.key===key && result.url?<img className="rendered" src={result.url} alt="Generated outfit on a mannequin"/>:<>
        <img className="mannequin" src={brand.mannequin} alt=""/>
        {slots.map(slot=>{const piece=picks.find(p=>p.slot===slot);return piece&&<img key={slot} alt="" className={'cutout '+slot} src={piece.cutout} style={piece.fit}/>})}
      </>}
      {pending&&<div className="render-loading" role="status"><span className="spinner"/><span>Styling your outfit…</span></div>}
    </div>
  }
  return <aside className="fitting" aria-label="Fitting room">
    <div className="fit-title"><h2>Fitting room</h2><button className="icon" aria-label="Close fitting room" onClick={onClose}><X size={19}/></button></div>
    <p className="muted">Add another piece and it goes on top.</p>
    <div className="portrait-wrap" id="outfit-target">{portrait()}<button className="icon zoom" aria-label="Zoom outfit" onClick={()=>setZoom(true)}><Maximize2 size={18}/></button></div>
    <div className="pick-heading"><strong>Your picks</strong><span className="muted">{picks.length} {picks.length===1?'piece':'pieces'}</span></div>
    <div className="picks">{picks.length?picks.map(p=><div className="pick" key={p.id}><img src={p.photo} alt={p.name}/><button className="icon" aria-label={'Remove '+p.name} onClick={()=>onRemove(p.slot)}><X size={13}/></button></div>):<p className="muted">Try on a product to start an outfit.</p>}</div>
    <button className="primary full" disabled={!picks.length} onClick={onCart}>Add the whole outfit to cart</button>
    <button className="text-button reset" disabled={!picks.length} onClick={onClear}><RotateCcw size={15}/> Start over</button>
    {zoom&&<div className="overlay center" onClick={()=>setZoom(false)}><section className="zoom-box" role="dialog" aria-modal="true" aria-label="Outfit preview" onClick={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key==='Escape')setZoom(false)}}><button autoFocus className="icon zoom" onClick={()=>setZoom(false)} aria-label="Close preview"><X/></button>{portrait()}</section></div>}
  </aside>
}
