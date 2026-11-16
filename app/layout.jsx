import './store.css'
import store from '../data/store.json'
export const metadata = {title: store.brand.name + ' | Streetwear store', description: store.brand.subtext}
export default function RootLayout({children}) {
  return <html lang="en"><body style={{'--accent':store.brand.accent,'--background':store.brand.background}}>{children}</body></html>
}
