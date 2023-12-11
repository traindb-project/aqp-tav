import React, { useEffect, useState } from "react";
import routes from "@/services/routes";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import warpTrainModelPage from "./components/wrapTrainModelPage";
import Button from "antd/lib/button";
import "./TrainModelSource.less"
import Resizable from "@/components/Resizable";
import SchemaBrowser from "@/components/tdb-workbenches/SchemaBrowser";

import useTrainModelPageHook from "./hooks/useTrainModelPageHook";
import TrainModelPageHeader from "./components/TrainModelPageHeader";
import TrainModelPageFooter from "./components/TrainModelPageFooter";



function TrainModelSource(props) {
    const {current, setCurrent, prev, disablePrev, next, disableNext} = useTrainModelPageHook()

    return <>
        <TrainModelPageHeader current={current} setCurrent={setCurrent} />

        <main className="train-model-fullscreen">

            <Resizable direction="horizontal" sizeAttribute="flex-basis" toggleShortcut="Alt+Shift+D, Alt+D">
                <h3>asdf</h3>
            </Resizable>

        </main>

        <TrainModelPageFooter prev={prev} disablePrev={disablePrev} next={next} disableNext={disableNext} />
    </>
}

const TrainModelSourcePage = warpTrainModelPage(TrainModelSource)

// routes.register(
//     "Workbench.New",
//     routeWithUserSession({
//         path: "/workbench/new",
//         render: pageProps => <TrainModelSourcePage {...pageProps} />,
//         bodyClass: "fixed-layout",
//     })
// )