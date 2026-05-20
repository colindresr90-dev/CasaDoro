import { useState, useEffect } from 'react'
import { getSuites, getSuiteBySlug } from '../lib/supabase'

// Hook para todas las suites
export function useSuites() {
  const [suites, setSuites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSuites()
      .then(setSuites)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { suites, loading, error }
}

// Hook para una suite específica
export function useSuite(slug) {
  const [suite, setSuite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    getSuiteBySlug(slug)
      .then(setSuite)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [slug])

  return { suite, loading, error }
}
