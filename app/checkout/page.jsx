'use client'
import {useState} from 'react'
import Link from 'next/link'
import {ArrowLeft} from 'lucide-react'
import {brand,cartLines,money} from '../../components/catalog'
import useStored from '../../components/useStored'
export default function Checkout(){
  const [cart]=useStored('offgrid-cart',{})
  const [review,setReview]=useState(false)
  const lines=cartLines(cart)
  const total=lines.reduce((sum,p)=>sum+p.price*p.quantity,0)
  const fields=[['Email','email','email'],['Full name','text','name'],['Address','text','street-address'],['City','text','address-level2'],['State / province','text','address-level1'],['Postal code','text','postal-code'],['Country','text','country-name']]
  return <main className="checkout shell"><Link className="text-button" href="/"><ArrowLeft size={17}/> Back to {brand.name}</Link><h1>Checkout</h1><div className="checkout-grid"><form onSubmit={e=>{e.preventDefault();setReview(true)}}><h2>Contact and shipping</h2>{fields.map(([label,type,autoComplete])=><label key={label}>{label}<input required type={type} autoComplete={autoComplete} onChange={()=>setReview(false)}/></label>)}<h2>Payment</h2><p className="muted">Online payment is coming soon.</p><button className="primary" disabled={!lines.length}>Review order</button>{review&&<p role="status">Your shipping details are ready. Checkout is awaiting a payment provider, so no order or charge was created.</p>}</form><section className="summary"><h2>Order summary</h2>{lines.length?lines.map(p=><div className="summary-line" key={p.id}><span>{p.name} × {p.quantity}</span><strong>{money(p.price*p.quantity)}</strong></div>):<p className="muted">Your cart is empty.</p>}<div className="cart-total"><strong>Subtotal</strong><strong>{money(total)}</strong></div><p className="muted">Shipping and taxes are calculated by the payment provider.</p></section></div></main>
}
