// import React, {useState, useCallback, useMemo} from "react";

// export default function useTrainModelPageHook() {
//     const steps = [
//         { title: 'First', content: 'First-content' },
//         { title: 'Second', content: 'Second-content' },
//         { title: 'Last', content: 'Last-content' },
//     ]
//     const items = steps.map((item) => ({ key: item.title, title: item.title }))

//     const [disableNext, setDisableNext] = useState(false)
//     const [disablePrev, setDisablePrev] = useState(false)

//     function next() { setCurrent(current + 1) }
//     function prev() { setCurrent(current - 1) }

//     useEffect(() => {
//         if (current === steps.length) setDisableNext(true)
//         else setDisableNext(false)

//         if (current === 0) setDisablePrev(true)
//         else setDisablePrev(false)
//     }, [current, steps.length])

//     return useMemo(() => ({current, setCurrent, prev, disablePrev, next, disableNext}), [current, setCurrent, prev, disablePrev, next, disableNext])
// }