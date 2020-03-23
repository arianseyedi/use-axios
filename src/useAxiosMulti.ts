import { useState, useEffect } from 'react'
import Axios, { AxiosRequestConfig, CancelToken, AxiosPromise } from 'axios'

import { UseAxiosBaseOptions, UseAxiosMultiReturnType, UseAxiosMultiState } from './types'
import { config } from './config'

const defaultState: UseAxiosMultiState = {
  data: null,
  loading: false,
  error: false,
}

/**
 * @function returns the data as the result of multiple fetch statements in the same order as the input with index keys starting at 0. Designed for handling multiple fetches in the same component. Refetch will not happen on change of url for this hook. If a new fetch is required, redo option needs to be incremented or skip needs to toggle to false if initially set to true
 * @param configs axios configurations
 * @param transformers the data transformers inserted in the same order as the configs (this is a must)
 * @param axiosPromiseConstructor axios constructor, note that the same axios object will be configured using the first parameter to place the calls
 * @param options useAxiosMulti options. For polling, please pass this option from the initial render of this hook.
 * @author Arian Seyedi
 */
type AxiosOutputTransformer<T = any> = (data: T) => any
function useAxiosMultiBase(
  configs: AxiosRequestConfig[],
  transformers: AxiosOutputTransformer[],
  axiosPromiseConstructor: (
    config: AxiosRequestConfig,
    cancelToken: CancelToken
  ) => AxiosPromise,
  options: UseAxiosBaseOptions
): UseAxiosMultiReturnType {
  const [state, setState] = useState<UseAxiosMultiState>(defaultState) // simple one time fetch (either - or basis)
  const [redo, setRedo] = useState<number>(0) // simple one time fetch (either - or basis)
  const [intervalState, setIntervalState] = useState<UseAxiosMultiState>(defaultState) // interval fetch (either - or basis)
  const { skip, pollingInterval } = options

  const handleIncrementRedo = () => {
    setRedo((redo + 1) % 2)
  }

  useEffect(() => {
    const source = Axios.CancelToken.source()
    const loadData = async () => {
      if (pollingInterval) setIntervalState({ error: false, loading: true, data: null })
      else setState({ error: false, loading: true, data: null })

      try {
        const resultData: any[] = []
        const promises = configs.map(config => axiosPromiseConstructor(config, source.token))
        const results = await Promise.all(promises)

        results.forEach((result, index) => {
          resultData.push(transformers[index](result.data))
        })

        if (pollingInterval)
          setIntervalState({ error: false, loading: false, data: resultData })
        else setState({ error: false, loading: false, data: resultData })
      } catch (error) {
        if (Axios.isCancel(error)) {
          console.warn('use axios multiple call cancelled: ', error)
        } else {
          if (pollingInterval) setIntervalState({ error: true, loading: false, data: null })
          else setState({ error: true, loading: false, data: null })
        }
      }
    }

    let id: NodeJS.Timeout

    if (!skip && !pollingInterval) {
      loadData()
      return () => {
        source.cancel()
      }
    }
    if (!skip && pollingInterval) {
      if (!intervalState.data) {
        // if no data at hand, initialize fetch just like in a normal case
        loadData()
      } else {
        // start polling on the second rount
        id = setInterval(loadData, pollingInterval)
      }
    }
    return () => {
      // polling cleanup
      clearInterval(id)
      source.cancel()
    }
  }, [redo, skip, intervalState.data]) // watch for intervalData especially because refetch is required after each poll
  return intervalState.data
    ? [
        {
          data: intervalState.data,
          error: intervalState.error,
          loading: intervalState.loading,
        },
        handleIncrementRedo,
      ]
    : state.data
    ? [{ data: state.data, error: state.error, loading: state.loading }, handleIncrementRedo]
    : [{ data: null, error: state.error, loading: state.loading }, handleIncrementRedo]
}

/**
 * @function returns the data as the result of multiple fetch statements in the same order as the input with index keys starting at 0. Designed for handling multiple fetches in the same component. Refetch will not happen on change of url for this hook. If a new fetch is required, redo option needs to be incremented or skip needs to toggle to false if initially set to true
 * @param resquestConfigs axios configurations
 * @param transformers the data transformers inserted in the same order as the resquestConfigs (this is a must)
 * @param options useAxiosMulti options. For polling, please pass this option from the initial render of this hook.
 * @author Arian Seyedi
 */
export function useAxiosMulti(
  resquestConfigs: AxiosRequestConfig[],
  transformers: AxiosOutputTransformer[],
  options: UseAxiosBaseOptions
): UseAxiosMultiReturnType {
  return useAxiosMultiBase(resquestConfigs, transformers, config.getInstance(), options)
}
