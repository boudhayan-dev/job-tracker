import { useEffect, useState } from 'react'
import { getIdentity, type Identity } from './identity'

const EMPTY: Identity = { name: null, email: null, photoUrl: null }

export function useIdentity(): Identity {
  const [identity, setIdentity] = useState<Identity>(EMPTY)

  useEffect(() => {
    let cancelled = false
    getIdentity().then((result) => {
      if (!cancelled) setIdentity(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return identity
}
