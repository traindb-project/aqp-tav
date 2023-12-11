import { extend, identity, map } from "lodash";

import { axios } from "@/services/axios";


export class TrainModel {
  constructor(trainmodel) {
    extend(this, trainmodel)
  }
}

function getTrainModel(train_model) {
  return new TrainModel(train_model)
}


function mapResults(data) {
  return { ...data, results: map(data.results, getTrainModel) }
}

async function getInfo(params) {
  let show_models = await axios.get("api/train_models", { params })
  let show_trainings = await axios.get("api/trainings", { params })

  let retries = 0
  const maxRetries = 3
  const retryInterval = 1000

  while ((show_models.results === null || show_trainings.results === null) && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, retryInterval))
    show_models = await axios.get('api/train_models', { params })
    show_trainings = await axios.get('api/trainings', { params })
    retries++
  }

  if (show_models.results === null || show_trainings.results === null) {
    throw new Error("Failed to fetch data.")
  }

  const joinedData = [];
  for (const model of show_models.results) {
    const matchingTraining = show_trainings.results.find(training => training.model_name === model.model_name)
    if (matchingTraining) {
      const mergedData = { ...model, ...matchingTraining }
      joinedData.push(mergedData)
    } else {
      joinedData.push(model)
    }
  }

  return mapResults({ results: joinedData })
}

const TrainModelService = {
  // trainModel: params => axios.get("api/train_models", { params }).then(mapResults),
  trainModel: params => getInfo(params),
  delete: data => axios.delete(`api/train_models/${data}`),

  // import: () => axios.post('api/migration/import', {model_name: newModelName, hex_string: hexString}),
  export: model_name => axios.get(`api/migration/export?model_name=${model_name}`),
}

extend(TrainModel, TrainModelService)



