'use client'
import {useState} from 'react'
import Link from 'next/link'
import {ArrowDown,ArrowRight,Heart,Search,ShoppingBag,Shirt,Star,X,SlidersHorizontal} from 'lucide-react'
import {brand,products,slots,money,cartLines} from './catalog'
import useStored from './useStored'
import FittingRoom from './FittingRoom'

export default function Storefront(){
  const [wishlist,setWishlist]=useStored('offgrid-wishlist',[])
  const [cart,setCart]=useStored('offgrid-cart',{})
  const [outfit,setOutfit]=useStored('offgrid-outfit',{})
  const [fit,setFit]=useState(false)
  const [drawer,setDrawer]=useState(false)
  const [filterOpen,setFilterOpen]=useState(false)
  const [search,setSearch]=useState('')
  const [category,setCategory]=useState('')
  const [max,setMax]=useState(200)
  const [sale,setSale]=useState(false)
  const [liked,setLiked]=useState(false)
  const [sort,setSort]=useState('new')
  const picks=slots.map(slot=>products.find(p=>p.slot===slot&&p.id===outfit[slot])).filter(Boolean)
  const lines=cartLines(cart)
  const count=lines.reduce((sum,p)=>sum+p.quantity,0)
  const total=lines.reduce((sum,p)=>sum+p.quantity*p.price,0)
  const categories=[...new Set(products.map(p=>p.category))]
  const filtered=products.filter(p=>(!category||p.category===category)&&p.price<=max&&(!sale||p.oldPrice)&&(!liked||wishlist.includes(p.id))&&[p.name,p.category].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
  filtered.sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:sort==='rating'?b.rating-a.rating:0)
  function add(items){
    setCart(previous=>{
      const next={...previous}
      for(const item of items)next[item.id]=(next[item.id]||0)+1
      return next
    })
    setDrawer(true)
  }
  function changeQuantity(id,delta){
    setCart(previous=>{
      const next={...previous,[id]:Math.max(0,(previous[id]||0)+delta)}
      if(!next[id])delete next[id]
      return next
    })
  }
  function tryOn(product,event){
    const source=event.currentTarget.closest('article').querySelector('.product-image img').getBoundingClientRect()
    setOutfit(previous=>({...previous,[product.slot]:product.id}))
    setFit(true)
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
    requestAnimationFrame(()=>{
      const target=document.querySelector('#outfit-target')?.getBoundingClientRect()
      if(!target)return
      const clone=document.createElement('img')
      clone.src=product.photo
      clone.alt=''
      Object.assign(clone.style,{position:'fixed',pointerEvents:'none',zIndex:'90',width:'58px',height:'58px',objectFit:'contain',borderRadius:'14px',background:'#272330',left:source.left+source.width/2-29+'px',top:source.top+source.height/2-29+'px'})
      document.body.append(clone)
      const animation=clone.animate([{transform:'translate(0,0)',opacity:1},{transform:'translate('+(target.left+target.width/2-source.left-source.width/2)+'px,'+(target.top+target.height/2-source.top-source.height/2)+'px) scale(.4)',opacity:.2}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'})
      animation.onfinish=()=>clone.remove()
      animation.oncancel=()=>clone.remove()
    })
  }
  function reset(){setCategory('');setMax(200);setSale(false);setLiked(false);setSearch('');setSort('new')}
  function browse(mode){reset();setSale(mode==='sale');setLiked(mode==='wishlist')}
  return <>
    <header className="header">
      <div className="header-inner">
        <nav aria-label="Main navigation"><a href="#" onClick={reset}>Home</a><a className="active" href="#shop" onClick={()=>browse('shop')}>Shop</a><a href="#shop" onClick={()=>browse('new')}>New Arrivals</a><a href="#shop" onClick={()=>browse('sale')}>Sale</a></nav>
        <a className="wordmark" href="#" aria-label={brand.name+' home'}>{brand.logo?<img src={brand.logo} alt={brand.name}/>:<>{brand.name}<i>.</i></>}</a>
        <div className="header-actions">
          <label className="search"><Search size={16}/><input type="search" aria-label="Search products" placeholder="Search products" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')document.getElementById('shop').scrollIntoView()}}/></label>
          <a className={'icon '+(liked?'selected':'')} href="#shop" aria-label="View wishlist" onClick={()=>browse('wishlist')}><Heart size={19}/></a>
          <button className="icon cart-trigger" onClick={()=>setDrawer(true)} aria-label={'Open cart, '+count+' items'}><ShoppingBag size={19}/><span>{count}</span></button>
        </div>
      </div>
    </header>
    <main className="shell">
      <section className="hero">
        <div className="hero-copy"><h1>{brand.headline}</h1><p>{brand.subtext}</p><a className="primary" href="#shop" onClick={()=>browse('shop')}>Shop the merch <ArrowRight size={17}/></a></div>
        <div className="hero-art" aria-hidden="true"><span>{brand.name}</span><img src={brand.hero} alt=""/></div>
      </section>
      <section id="shop" className={'shop-layout '+(fit?'with-fitting':'')}>
        {fit?<FittingRoom picks={picks} onRemove={slot=>setOutfit(previous=>({...previous,[slot]:undefined}))} onClear={()=>setOutfit({})} onClose={()=>setFit(false)} onCart={()=>add(picks)}/>:null}
        <aside className={'filters '+(filterOpen?'filters-open':'')} aria-label="Product filters">
          <div className="filter-head"><h2>Filters</h2><button className="text-button" onClick={reset}>Clear all</button></div>
          <fieldset><legend>Category</legend>{['',...categories].map(name=><button type="button" key={name} className={'category '+(category===name?'current':'')} onClick={()=>setCategory(name)} aria-pressed={category===name}><span>{name||'All products'}</span><span>{name?products.filter(p=>p.category===name).length:products.length}</span></button>)}</fieldset>
          <fieldset><legend>Max price</legend><input aria-label="Max price" type="range" min="20" max="200" value={max} onChange={e=>setMax(Number(e.target.value))}/><div className="price-range"><span>$20</span><strong>{money(max)}</strong></div></fieldset>
          <fieldset className="checks"><legend>Availability</legend><label><input type="checkbox" checked={sale} onChange={e=>setSale(e.target.checked)}/> On sale</label><label><input type="checkbox" checked={liked} onChange={e=>setLiked(e.target.checked)}/> Wishlist only</label></fieldset>
        </aside>
        <div className="catalog">
          <div className="catalog-head"><div><h2>{liked?'Wishlist':sale?'Sale':'New arrivals'}</h2><p className="muted" aria-live="polite">{filtered.length} {filtered.length===1?'product':'products'}</p></div><div className="catalog-tools"><button className="secondary filter-toggle" onClick={()=>setFilterOpen(v=>!v)} aria-expanded={filterOpen}><SlidersHorizontal size={16}/> Filters</button><label className="sort"><ArrowDown size={15}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products"><option value="new">Newest</option><option value="low">Price low to high</option><option value="high">Price high to low</option><option value="rating">Top rated</option></select></label></div></div>
          <div className="product-grid">{filtered.map(p=><article className="product" key={p.id}>
            <div className="product-image"><img src={p.photo} alt={p.name} loading="lazy"/>{p.oldPrice&&<span className="sale">SALE</span>}<button className={'icon heart '+(wishlist.includes(p.id)?'selected':'')} aria-label={'Wishlist '+p.name} aria-pressed={wishlist.includes(p.id)} onClick={()=>setWishlist(previous=>previous.includes(p.id)?previous.filter(id=>id!==p.id):[...previous,p.id])}><Heart size={17}/></button></div>
            <div className="product-info"><div className="rating"><Star size={13} fill="currentColor"/><span>{p.rating.toFixed(1)}</span></div><h3>{p.name}</h3><div className="prices"><strong>{money(p.price)}</strong>{p.oldPrice&&<del>{money(p.oldPrice)}</del>}</div><div className="card-actions"><button className={'secondary '+(outfit[p.slot]===p.id?'trying':'')} onClick={e=>tryOn(p,e)}><Shirt size={16}/> {outfit[p.slot]===p.id?'On mannequin':'Try on'}</button><button className="icon add" onClick={()=>add([p])} aria-label={'Add '+p.name+' to cart'}><ShoppingBag size={17}/></button></div></div>
          </article>)}</div>
          {!filtered.length&&<div className="empty"><p>No products match your filters.</p><button className="secondary" onClick={reset}>Reset filters</button></div>}
        </div>
      </section>
    </main>
    <footer className="footer"><strong>{brand.name}</strong><span>© {new Date().getFullYear()} {brand.name}</span></footer>
    {!fit&&<button className="primary float-fit" onClick={()=>setFit(true)}><Shirt size={19}/> Try it on</button>}
    {drawer&&<div className="overlay" onClick={()=>setDrawer(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')setDrawer(false)}}><div className="fit-title"><h2>Your cart ({count})</h2><button autoFocus className="icon" onClick={()=>setDrawer(false)} aria-label="Close cart"><X/></button></div><div className="cart-lines">{lines.length?lines.map(p=><div className="cart-line" key={p.id}><img src={p.photo} alt=""/><div><strong>{p.name}</strong><p className="muted">{money(p.price)}</p><div className="quantity"><button aria-label={'Decrease '+p.name} onClick={()=>changeQuantity(p.id,-1)}>−</button><span>{p.quantity}</span><button aria-label={'Increase '+p.name} onClick={()=>changeQuantity(p.id,1)}>+</button></div></div><strong>{money(p.price*p.quantity)}</strong></div>):<p className="muted">Your cart is empty.</p>}</div><div className="cart-total"><strong>Subtotal</strong><strong>{money(total)}</strong></div>{count>0&&<Link className="primary full" href="/checkout">Checkout <ArrowRight size={17}/></Link>}</aside></div>}
  </>
}
