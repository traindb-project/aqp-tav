import { has, map, isObject } from "lodash";
import { axios } from "@/services/axios";
import { fetchDataFromJob } from "@/services/query-result";

export const SCHEMA_NOT_SUPPORTED = 1;
export const SCHEMA_LOAD_ERROR = 2;
export const IMG_ROOT = "static/images/db-logos";

function mapSchemaColumnsToObject(columns) {
  return map(columns, column => (isObject(column) ? column : { name: column }));
}

const DataSource = {
  query: () => axios.get("api/data_sources"),
  get: ({ id }) => axios.get(`api/data_sources/${id}`),
  types: () => axios.get("api/data_sources/types"),
  create: data => axios.post(`api/data_sources`, data),
  save: data => axios.post(`api/data_sources/${data.id}`, data),
  test: data => axios.post(`api/data_sources/${data.id}/test`),
  delete: ({ id }) => axios.delete(`api/data_sources/${id}`),
  fetchSchema: (data, refresh = false) => {
    const params = {};

    if (refresh) {
      params.refresh = true;
    }


    // Updated by wgkim 2023-10-11: 잡 생성이 아닌 직접 데이터를 가져오는 형식으로 변경
    // return axios.get(`api/data_sources/${data.id}/schema`, { params })
    //   .then(response => {
    //     let result = map(response, table => ({ ...table, columns: mapSchemaColumnsToObject(table.columns)}))[0]
    //     result = Object.keys(result).filter(key => !isNaN(key)).map(key => result[key]);
    //     return result
    //   })

    return axios
      .get(`api/data_sources/${data.id}/schema`, { params })
      .then(data => {
        if (has(data, "job")) {
         return fetchDataFromJob(data.job.id).catch(error =>
            error.code === SCHEMA_NOT_SUPPORTED ? [] : Promise.reject(new Error(data.job.error))
          );
        }
        return has(data, "schema") ? data.schema : Promise.reject();
      })
      .then(tables => map(tables, table => ({ ...table, columns: mapSchemaColumnsToObject(table.columns) })));
  },
};

export default DataSource;