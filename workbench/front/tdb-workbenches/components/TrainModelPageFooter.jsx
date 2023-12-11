import React from "react";
import Button from "antd/lib/button";

export default function TrainModelPageFooter({prev, disablePrev, next, disableNext}) {
    return <>
        <div className="bottom-controller-contrainer p-15 mb-10">
            <Button.Group>
                <Button onClick={prev} disabled={disablePrev}>Previous</Button>
                <Button type="primary" onClick={next} disabled={disableNext}>Next</Button>
            </Button.Group>
        </div>
    </>
}