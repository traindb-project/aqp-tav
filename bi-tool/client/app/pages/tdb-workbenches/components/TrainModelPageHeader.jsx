import React, {useState, useEffect} from "react"
import Steps from "antd/lib/steps";

import PageHeader from "@/components/PageHeader";


const { Step } = Steps


export default function TrainModelPageHeader({ current, setCurrent }) {


    return <>
        <div className="container w-100 p-b-10">
            <PageHeader
                title={"New_Model"}
                actions={<>
                    <Steps current={current} style={{ width: "calc(90%)", minWidth: '500px' }}>
                        <Step title="Data source" />
                        <Step title="Model type" />
                        <Step title="Hyperparameter" />
                        {/* <Step title="Training plan" /> */}
                        <Step title="Overview" />
                    </Steps>
                </>}
            />
        </div>
    </>
}
