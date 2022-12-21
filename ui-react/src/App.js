import React, {useEffect, useState} from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

import * as d3 from "d3"
import axios from "axios";

d3.select('title').text('시각화 분석 도구')

const PlotlyRenderers = createPlotlyRenderers(Plot);
const data = [
    ['attribute1', 'attribute2', 'attribute3', 'attribute4'],
    ['a1.data1', 'a2.data1', 0, 1],
    ['a1.data2', 'a2.data2', 1, 1],
    ['a1.data3', 'a2.data3', 2, 2],
    ['a1.data4', 'a2.data4', 3, 2],
];

function App() {
    const [hello, setHello] = useState('')
    const [state, setState] = useState('')
    axios.defaults.baseURL = 'http://localhost:8080'

    // function request_query() {
    //     let query = document.querySelector("#query").textContent
    //     useEffect(() => {
    //         axios.get('/api/hello?query=' + query)
    //             .then(response => setHello(response.data))
    //             .catch(error => console.log(error))
    //     }, []);
    //     console.log(hello);
    // }

    useEffect(() => {
        axios.get('/api/hello')
            .then(response => setHello(response.data))
            .catch(error => console.log(error))
    }, []);
    console.log(hello);

    return (
        <PivotTableUI
            data={data}
            onChange={s => setState(s)}
            renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
            {...state}
        />
    );
}

// ReactDOM.render(<APP />, document.body);
export default App;
