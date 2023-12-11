import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import { TrainModel } from "@/services/train-model";
import React, { useEffect } from "react";

export default function warpTrainModelPage(WrappedComponent){
    function TrainModelPageWrapper({onError, ...props}){
        return <WrappedComponent {...props} />
    }

    return TrainModelPageWrapper
}