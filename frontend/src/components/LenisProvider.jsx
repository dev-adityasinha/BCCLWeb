import { useEffect, useRef } from "react"
import Lenis from "@studio-freight/lenis"

const LenisProvider = ({ children }) => {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.12,
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <div>{children}</div>
}

export default LenisProvider
