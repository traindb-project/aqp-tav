// Created by wgkim 2023-04-12
import moment from "moment";
import debug from "debug";
import Mustache from "mustache";
import { axios } from "@/services/axios";
import {
  zipObject,
  isEmpty,
  isArray,
  map,
  filter,
  includes,
  union,
  uniq,
  has,
  identity,
  extend,
  each,
  some,
  clone,
  find,
} from "lodash";
import location from "@/services/location";

import { Parameter, createParameter } from "./parameters";
import { currentUser } from "./auth";
import WorkbenchResult from "./workbench-result";
import localOptions from "@/lib/localOptions";

Mustache.escape = identity; // do not html-escape values

const logger = debug("redash:services:workbench");

function collectParams(parts) {
  let parameters = [];

  parts.forEach(part => {
    if (part[0] === "name" || part[0] === "&") {
      parameters.push(part[1].split(".")[0]);
    } else if (part[0] === "#") {
      parameters = union(parameters, collectParams(part[4]));
    }
  });

  return parameters;
}

export class Workbench {
  constructor(workbench) {
    extend(this, workbench);

    if (!has(this, "options")) {
      this.options = {};
    }
    this.options.apply_auto_limit = !!this.options.apply_auto_limit;

    if (!isArray(this.options.parameters)) {
      this.options.parameters = [];
    }
  }

  isNew() {
    return this.id === undefined;
  }

  hasDailySchedule() {
    return this.schedule && this.schedule.match(/\d\d:\d\d/) !== null;
  }

  scheduleInLocalTime() {
    const parts = this.schedule.split(":");
    return moment
      .utc()
      .hour(parts[0])
      .minute(parts[1])
      .local()
      .format("HH:mm");
  }

  hasResult() {
    return !!(this.latest_workbench_data || this.latest_workbench_data_id);
  }

  paramsRequired() {
    return this.getParameters().isRequired();
  }

  hasParameters() {
    return this.getParametersDefs().length > 0;
  }

  prepareWorkbenchResultExecution(execute, maxAge) {
    const parameters = this.getParameters();
    const missingParams = parameters.getMissing();

    if (missingParams.length > 0) {
      let paramsWord = "parameter";
      let valuesWord = "value";
      if (missingParams.length > 1) {
        paramsWord = "parameters";
        valuesWord = "values";
      }

      return new WorkbenchResult({
        job: {
          error: `missing ${valuesWord} for ${missingParams.join(", ")} ${paramsWord}.`,
          status: 4,
        },
      });
    }

    if (parameters.isRequired()) {
      // Need to clear latest results, to make sure we don't use results for different params.
      this.latest_workbench_data = null;
      this.latest_workbench_data_id = null;
    }

    if (this.latest_workbench_data && maxAge !== 0) {
      if (!this.workbenchResult) {
        this.workbenchResult = new WorkbenchResult({
          workbench_result: this.latest_workbench_data,
        });
      }
    } else if (this.latest_workbench_data_id && maxAge !== 0) {
      if (!this.workbenchResult) {
        this.workbenchResult = WorkbenchResult.getById(this.id, this.latest_workbench_data_id);
      }
    } else {
      this.workbenchResult = execute();
    }

    return this.workbenchResult;
  }

  getWorkbenchResult(maxAge) {
    const execute = () =>
      WorkbenchResult.getByWorkbenchId(this.id, this.getParameters().getExecutionValues(), this.getAutoLimit(), maxAge);
    return this.prepareWorkbenchResultExecution(execute, maxAge);
  }

  getWorkbenchResultByText(maxAge, selectedWorkbenchQuery) {
    const workbenchQuery = selectedWorkbenchQuery || this.query;
    if (!workbenchQuery) {
      return new WorkbenchResultError("Can't execute empty workbench.");
    }

    const parameters = this.getParameters().getExecutionValues({ joinListValues: true });
    const execute = () =>
      WorkbenchResult.get(this.data_source_id, workbenchQuery, parameters, this.getAutoLimit(), maxAge, this.id);
    return this.prepareWorkbenchResultExecution(execute, maxAge);
  }

  // Updated by wgkim 2023-04-20 : URL 변경
  getUrl(source, hash) {
    let url = `workbenches/${this.id}`;

    if (source) {
      url += "/source";
    }

    let params = {};
    if (this.getParameters().isRequired()) {
      this.getParametersDefs().forEach(param => {
        extend(params, param.toUrlParams());
      });
    }
    Object.keys(params).forEach(key => params[key] == null && delete params[key]);
    params = map(params, (value, name) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join("&");

    if (params !== "") {
      url += `?${params}`;
    }

    if (hash) {
      url += `#${hash}`;
    }

    return url;
  }

  getWorkbenchResultPromise() {
    return this.getWorkbenchResult().toPromise();
  }

  getParameters() {
    if (!this.$parameters) {
      this.$parameters = new Parameters(this, location.search);
    }

    return this.$parameters;
  }

  getAutoLimit() {
    return this.options.apply_auto_limit;
  }

  getParametersDefs(update = true) {
    return this.getParameters().get(update);
  }

  favorite() {
    return Workbench.favorite(this);
  }

  unfavorite() {
    return Workbench.unfavorite(this);
  }

  clone() {
    const newWorkbench = clone(this);
    newWorkbench.$parameters = null;
    newWorkbench.getParameters();
    return newWorkbench;
  }
}

class Parameters {
  constructor(workbench, workbenchString) {
    this.workbench = workbench;
    this.updateParameters();
    this.initFromWorkbenchString(workbenchString);
  }

  parseWorkbench() {
    const fallback = () => map(this.workbench.options.parameters, i => i.name);

    let parameters = [];
    // if (this.workbench.workbench !== undefined) {
    if (this.workbench.query !== undefined) {
      try {
        // const parts = Mustache.parse(this.workbench.workbench);
        const parts = Mustache.parse(this.workbench.query);
        parameters = uniq(collectParams(parts));
      } catch (e) {
        logger("Failed parsing parameters: ", e);
        // Return current parameters so we don't reset the list
        parameters = fallback();
      }
    } else {
      parameters = fallback();
    }

    return parameters;
  }

  updateParameters(update) {
    // if (this.workbench.workbench === this.cachedWorkbenchText) {
    if (this.workbench.query === this.cachedWorkbenchText) {
      const parameters = this.workbench.options.parameters;
      const hasUnprocessedParameters = find(parameters, p => !(p instanceof Parameter));
      if (hasUnprocessedParameters) {
        this.workbench.options.parameters = map(parameters, p =>
          p instanceof Parameter ? p : createParameter(p, this.workbench.id)
        );
      }
      return;
    }

    this.cachedWorkbenchText = this.workbench.query;
    const parameterNames = update ? this.parseWorkbench() : map(this.workbench.options.parameters, p => p.name);

    this.workbench.options.parameters = this.workbench.options.parameters || [];

    const parametersMap = {};
    this.workbench.options.parameters.forEach(param => {
      parametersMap[param.name] = param;
    });

    parameterNames.forEach(param => {
      if (!has(parametersMap, param)) {
        this.workbench.options.parameters.push(
          createParameter({
            title: param,
            name: param,
            type: "text",
            value: null,
            global: false,
          })
        );
      }
    });

    const parameterExists = p => includes(parameterNames, p.name);
    const parameters = this.workbench.options.parameters;
    this.workbench.options.parameters = parameters
      .filter(parameterExists)
      .map(p => (p instanceof Parameter ? p : createParameter(p, this.workbench.id)));
  }

  initFromWorkbenchString(workbench) {
    this.get().forEach(param => {
      param.fromUrlParams(workbench);
    });
  }

  get(update = true) {
    this.updateParameters(update);
    return this.workbench.options.parameters;
  }

  add(parameterDef) {
    this.workbench.options.parameters = this.workbench.options.parameters.filter(p => p.name !== parameterDef.name);
    const param = createParameter(parameterDef);
    this.workbench.options.parameters.push(param);
    return param;
  }

  getMissing() {
    return map(
      filter(this.get(), p => p.isEmpty),
      i => i.title
    );
  }

  isRequired() {
    return !isEmpty(this.get());
  }

  getExecutionValues(extra = {}) {
    const params = this.get();
    return zipObject(
      map(params, i => i.name),
      map(params, i => i.getExecutionValue(extra))
    );
  }

  hasPendingValues() {
    return some(this.get(), p => p.hasPendingValue);
  }

  applyPendingValues() {
    each(this.get(), p => p.applyPendingValue());
  }

  toUrlParams() {
    if (this.get().length === 0) {
      return "";
    }

    const params = Object.assign(...this.get().map(p => p.toUrlParams()));
    Object.keys(params).forEach(key => params[key] == null && delete params[key]);
    return Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
  }
}

export class WorkbenchResultError {
  constructor(errorMessage) {
    this.errorMessage = errorMessage;
    this.updatedAt = moment.utc();
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  getError() {
    return this.errorMessage;
  }

  toPromise() {
    return Promise.reject(this);
  }

  // eslint-disable-next-line class-methods-use-this
  getStatus() {
    return "failed";
  }

  // eslint-disable-next-line class-methods-use-this
  getData() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getLog() {
    return null;
  }
}

const getWorkbench = workbench => new Workbench(workbench);
// Updated by wgkim 2023-05-04 : 파라미터 추가 삽입
function saveOrCreateUrl(data){
  delete data.schedule
  delete data.latest_workbench_data_id
  delete data.tags

  return (data.id ? `api/workbenches/${data.id}` : "api/workbenches")
};
const mapResults = data => ({ ...data, results: map(data.results, getWorkbench) });

// Updated by wgkim 2023-04-20 : 백엔드로 연결되는 URL링크를 쿼리에서 워크벤치로 변경
// Updated by wgkim 2023-04-20 : Delete의 Data가 곧 Id임
// Updated by wgkim 2023-07-17 : train 추가
const WorkbenchService = {
  workbenches: params => axios.get("api/workbenches", { params }).then(mapResults),
  // workbenches: params => axios.get("api/train_models", { params }).then(mapResults),
  
  get: data => axios.get(`api/workbenches/${data.id}`, data).then(getWorkbench),
  save: data => axios.post(saveOrCreateUrl(data), data).then(getWorkbench),
  // delete: data => axios.delete(`api/workbenches/${data.id}`),
  recent: params => axios.get(`api/workbenches/recent`, { params }).then(data => map(data, getWorkbench)),
  archive: params => axios.get(`api/workbenches/archive`, { params }).then(mapResults),
  myWorkbenches: params => axios.get("api/workbenches/my", { params }).then(mapResults),
  fork: ({ id }) => axios.post(`api/workbenches/${id}/fork`, { id }).then(getWorkbench),
  resultById: data => axios.get(`api/workbenches/${data.id}/results.json`),
  asDropdown: data => axios.get(`api/workbenches/${data.id}/dropdown`),
  associatedDropdown: ({ workbenchId, dropdownWorkbenchId }) =>
    axios.get(`api/workbenches/${workbenchId}/dropdowns/${dropdownWorkbenchId}`),
  favorites: params => axios.get("api/workbenches/favorites", { params }).then(mapResults),
  favorite: data => axios.post(`api/workbenches/${data.id}/favorite`),
  unfavorite: data => axios.delete(`api/workbenches/${data.id}/favorite`),

  delete: data => axios.delete(`api/workbenches/${data}`),
  train: data => axios.post('api/train_models', data),
};

// Updated by wgkim 2023-05-04 : workbench -> query
WorkbenchService.newWorkbench = function newWorkbenches() {
  return new Workbench({
    query: "",
    name: "New_Model",
    schedule: null,
    user: currentUser,
    options: { apply_auto_limit: localOptions.get("applyAutoLimit", true) },
    tags: [],
    can_edit: true,
  });
};

extend(Workbench, WorkbenchService);
