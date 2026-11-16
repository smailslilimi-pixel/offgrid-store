'use client'
import {useEffect,useState} from 'react'
export default function useStored(key,initial){
  const [value,setValue]=useState(initial)
  const [ready,setReady]=useState(false)
  useEffect(()=>{
    try {
      const saved=localStorage.getItem(key)
      if(saved) setValue(JSON.parse(saved))
    } catch {}
    setReady(true)
  },[key])
  useEffect(()=>{if(ready){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}},[key,ready,value])
  return [value,setValue]
}
